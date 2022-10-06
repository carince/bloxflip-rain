import { launch, Browser, Page } from "puppeteer";
import { notify } from "node-notifier";
import { parse } from "json5";
import chalk from "chalk";
import { readFileSync } from "fs";
import { join } from "path";

class Logger {
    public static log(type: string, info: string): void {
        type.toUpperCase();
        console.log(chalk.greenBright(`${chalk.bold(`[${type}]`)} \t${info}`));
    }

    public static error(type: string, info: string): void {
        type.toUpperCase();
        console.log(chalk.redBright(`${chalk.bold(`[${type}]`)} \t${info}`));
    }

    public static warn(type: string, info: string): void {
        type.toUpperCase();
        console.log(chalk.yellowBright(`${chalk.bold(`[${type}]`)} \t${info}`));
    }
}

(async (): Promise<void> => {
    Logger.log("STARTUP", "Starting bloxflip-rain...");

    interface configInt {
        minimum: number;
        delay: number;
        os_notifs: boolean;
        webhook: {
            enabled: boolean;
            link: string;
        };
    }

    let config: configInt;

    try {
        config = parse(readFileSync(join(__dirname, "config.json"), "utf-8"));

        if (config.delay < 1000) {
            Logger.error("CONFIG", "Delay cant be lower than 1 second.");
            return;
        }

        if (!config.os_notifs && !config.webhook.enabled) {
            Logger.error("CONFIG", "Either OS notifications or webhooks should be enabled.");
            return;
        }

        Logger.log("CONFIG", "Successfully parsed config");
    } catch {
        Logger.error("CONFIG", "Unable to parse config");
        return;
    }

    const browser: Browser = await launch({ headless: true });
    const page: Page = (await browser.pages())[0];
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.124 Safari/537.36 Edg/102.0.1245.44");
    await page.setBypassCSP(true);
    await page.goto("https://github.com/Norikiru/bloxflip-rain");

    Logger.log("RAIN", "\tStarting rain notifier...");

    const webhookLink: string = config.webhook.link;
    let notified = false;
    for (let i = 0; i < Infinity; i++) {
        try {
            const bfRes = await page.evaluate(() => {
                return fetch("https://rest-bf.blox.land/chat/history").then(res => res.json());
            });

            if (bfRes.rain.active) {
                if (!notified) {
                    const rainHost: string = bfRes.rain.host;
                    const hostId = await page.evaluate((rainHost: string) => {
                        return fetch(`https://api.roblox.com/users/get-by-username?username=${rainHost}`).then(res => res.json()).then(res => res.Id);
                    }, rainHost);

                    if (bfRes.rain.prize >= config.minimum) {
                        if (config.os_notifs) {
                            notify({
                                title: "Bloxflip Rain Notifier",
                                message: `Robux: ${bfRes.rain.prize} R$ \nHost: ${bfRes.rain.host} \nTime Remaining: ${bfRes.rain.duration / 60000} minutes`,
                                subtitle: "bloxflip-rain",
                                sound: true
                            });
                        }

                        if (config.webhook.enabled) {
                            const embed = {
                                "embeds": [
                                    {
                                        "title": "Bloxflip Rain Notifier",
                                        "url": "https://bloxflip.com",
                                        "color": 3092790,
                                        "fields": [
                                            {
                                                "name": "Prize",
                                                "value": `${bfRes.rain.prize} R$`,
                                                "inline": true
                                            },
                                            {
                                                "name": "Host",
                                                "value": bfRes.rain.host,
                                                "inline": true
                                            },
                                            {
                                                "name": "Time Remaining",
                                                "value": `${bfRes.rain.duration / 60000} minutes`,
                                                "inline": true
                                            }
                                        ],
                                        "footer": {
                                            "text": "bloxflip-rain"
                                        },
                                        "thumbnail": {
                                            "url": `https://www.roblox.com/headshot-thumbnail/image?userId=${hostId}&width=720&height=720`
                                        }
                                    }
                                ]
                            };

                            await page.evaluate(async (embed: any, webhookLink: string) => {
                                await fetch(webhookLink, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Accept": "application/json"
                                    },
                                    body: JSON.stringify(embed)
                                });
                            }, embed, webhookLink);
                        }
                    } else {
                        Logger.warn("RAIN", "\tPrize is not greater or equal than the minimum value set in the config, ignoring...");
                    }

                    notified = true;
                }
            } else {
                notified = false;
            }
        } catch (err) {
            Logger.warn("FETCH", `Unable to fetch chat history, ignoring error...\n${err}`);
        }
        await sleep(config.delay);
    }
})();

function sleep(ms: number): Promise<unknown> {
    return new Promise((resolve): void => {
        setTimeout(resolve, ms);
    });
}
