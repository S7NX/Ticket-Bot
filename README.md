# Partner Bot

A Discord bot designed to help you effortlessly grow and moderate your Discord server.

## Table of Contents

- [Overview](#overview)
- [Commands](#commands)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Overview

A Discord bot designed to help you effortlessly grow your Discord server. By setting up the Partner bot, you can easily promote your server. Simply use the slash command /bump to showcase your server advertisement in other partnered servers. Similarly, when other servers have set up the Partner bot, they can use the slash command /bump to display their ad in other partnered servers as well. Moreover, you can also utilize auto-moderation features as your server continues to grow.

## Commands

- `/botinfo` - Replies with information about the bot.
- `/ping` - Replies with the current bot ping.

### Auto Mode

- `/analyze [attribute] {text}` - Analyzes the selected attribute of the given text.
- `/setup anti_toxic` - Sets up Anti-Toxic moderation.

### Advertisement

- `/bump` - Bump the server's advertisement.
- `/leaderboard` - Sends a leaderboard of bumps.
- `/setup advertisement` - Sets up the server's advertisement and partner channel.
- `/setup panel {channel}` - Sets up a Panel for Servers with leaderboard.
- `/preview` - Previews the server's advertisement.

### Moderation

- `/timeout add {user} [reason]` - Timeout a user with an optional reason.
- `/timeout remove {user}` - Remove the timeout for a user.
- `/kick {user} [reason]` - Kick a user with an optional reason.
- `/ban add {user} [reason]` - Ban a user with an optional reason.
- `/ban remove {user}` - Remove the ban for a user.
- `/purge {amount}` - Delete a specified amount of messages.
- `/role add {role}` - Add a role to a user.
- `/role remove {role}` - Remove a role from a user.

## Getting Started

### Installation

- run `npm install` in terminal to install all the required packages.

### Usage

When you have filled your `.env.example` and ran `npm install` in the terminal, you can start the bot by running `node .` or `node cluster.js`

## Configuration

- `token` you can get from [Discord Developer Portal](https://discord.com/developers/applications)
- `Mongo Db` you can get from [Mongo Db](https://cloud.mongodb.com/)
- `Prespective Api` you can apply from [Google Cloud](https://developers.google.com/codelabs/setup-perspective-api)

## Contributing

Thank you for considering contributing to the Partner Bot project! We welcome contributions from the community to help improve and enhance the bot. To ensure a smooth and collaborative development process, please adhere to the following guidelines:

1. Before starting any work, please open an issue in the GitHub repository to discuss the proposed changes or bug fixes. This allows for better coordination and prevents duplication of efforts.

2. Fork the repository and create a new branch for your contribution. It's recommended to use descriptive branch names that reflect the nature of your changes.

3. Follow the coding style and conventions used in the project. This includes consistent indentation, meaningful variable and function names, and appropriate commenting.

4. Write clear and concise commit messages that explain the purpose of each commit.

5. Make sure your code is well-tested. Include relevant test cases and ensure all existing tests pass successfully.

6. When submitting a pull request, provide a detailed description of the changes you made and reference the related issue number(s) if applicable. This helps reviewers understand the purpose and context of your changes.

7. Be open to feedback and constructive criticism. Reviewers may suggest improvements or request modifications to ensure the quality and compatibility of the codebase.

8. Respect the opinions and ideas of other contributors. We encourage a friendly and inclusive environment where everyone feels welcome to participate.

### Issue Reporting

If you encounter any issues or bugs while using the Partner Bot, please follow these guidelines for reporting them:

1. Check the existing issues in the GitHub repository to see if the problem has already been reported. If it has, you can add relevant information or contribute to the existing discussion.

2. If the issue hasn't been reported, open a new issue and provide a clear and concise description of the problem. Include steps to reproduce the issue and any relevant error messages or logs.

3. If possible, include screenshots or code snippets that help demonstrate the issue.

4. Assign appropriate labels to the issue, such as "bug," "enhancement," or "feature request," to help with organization and prioritization.

## License

The Partner Bot project is licensed under the MIT License. By using or contributing to this project, you agree that your usage will be subject to the terms and conditions of this license.

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to use, copy, modify, and distribute the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The person obtaining a copy of the Software shall not claim ownership or credit for the original work and shall not use the Software to promote or endorse themselves or their products without explicit written permission from the original author.

The person obtaining a copy of the Software shall not sell or commercially exploit the Software or any part thereof.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Copyright (c) 2023 S7NX
