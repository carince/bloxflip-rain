import nodeNotifier from "node-notifier";
import json5 from "json5";
import chalk from "chalk";
import fetch from "node-fetch";
import { readFileSync } from "fs";
const { notify } = nodeNotifier;
const { parse } = json5;


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
        config = parse(readFileSync("./config.json", { encoding: "utf8" }));

        if (config.delay < 1000) {
            Logger.error("CONFIG", "Delay cant be lower than 1 second.");
            return;
        }

        if (!config.os_notifs && !config.webhook.enabled) {
            Logger.error("CONFIG", "Either OS notifications or webhooks should be enabled.");
            return;
        }

        Logger.log("CONFIG", "Successfully parsed config");
    } catch (err) {
        Logger.error("CONFIG", `Unable to parse config\n ${err}`);
        return;
    }

    Logger.log("RAIN", "\tStarting rain notifier...");

    const webhookLink: string = config.webhook.link;
    let notified = false;
    for (let i = 0; i < Infinity; i++) {
        try {
            const bfRes: any = await (await fetch("https://rest-bf.blox.land/chat/history")).json();

            if (bfRes.rain.active) {
                if (!notified) {
                    if (bfRes.rain.prize >= config.minimum) {
                        Logger.log("RAIN", `Rain Detected \nRobux: ${bfRes.rain.prize} R$ \nHost: ${bfRes.rain.host} \nTime Remaining: ${bfRes.rain.duration / 60000} minutes`);

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
                                        }
                                    }
                                ]
                            };

                            await fetch(webhookLink, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Accept": "application/json"
                                },
                                body: JSON.stringify(embed)
                            });
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
