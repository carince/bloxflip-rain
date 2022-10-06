<h1 align="center">bloxflip-rain</h1>
<p align="center">Bloxflip rain notifier seperate from the <a href="https://github.com/Norikiru/bloxflip-autocrash">bloxflip-autocrash</a> repo.</p>

<p align="center"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/Norikiru/bloxflip-rain?color=yellow&style=flat-square"> <img alt="GitHub forks" src="https://img.shields.io/github/forks/Norikiru/bloxflip-rain?style=flat-square"> <img alt="GitHub issues" src="https://img.shields.io/github/issues/Norikiru/bloxflip-rain?style=flat-square"></p>

### Prerequisites
- [NodeJS](https://nodejs.org/en/download/ "NodeJS v16.17.0^")
- [git](https://git-scm.com/downloads "git")

### Installation
- Open your terminal and clone the repository
```bash
git clone https://github.com/Norikiru/bloxflip-rain.git
```

- Edit config.example.json with your desired configuration
```jsonc
{
    // Minimum robux to notify
    "minimum": 0,
    // Loop delay in milliseconds
    "delay": 5000,
    // Toggle OS notifications
    "os_notifs": true,
    "webhook": {
        // Toggle webhook embeds
        "enabled": false,
        // Discord webhook link
        "link": ""
    }
}
```

- Rename `config.example.json` to `config.json`

- Install required dependencies
```bash
npm i
```

- Run the bot! 🚀
```bash
npm run start
```

### 🆕 Updating
You must be in the root folder to be able to pull new commits
```bash
git pull
```

## 💖 Contributing
If you encounter any issues with the bot, feel free to give feedback on the issues page.
Feel free to fork the repo and do pull requests to help in maintaining the bot! PR's are always welcome.

## ⭐ Support
Support the project by giving the repository a star!
