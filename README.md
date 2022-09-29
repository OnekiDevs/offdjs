<div align="center">
	<br />
	<h1>OFFDJS</h1>
	<br />
	<p>
        <a href="https://discord.gg/8SpUxnF6v4"><img src="https://img.shields.io/discord/885674114310881362?color=5865F2&logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://www.npmjs.com/package/offdjs"><img src="https://img.shields.io/npm/v/offdjs.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/offdjs"><img src="https://img.shields.io/npm/dt/offdjs.svg?maxAge=3600" alt="npm downloads" /></a>
	</p>
</div>

## About

offdjs is a small framework that uses [discord.js](https://https://discord.js.org/) created to solve the needs and simplify the development of the Oneki bot made public so that anyone can create their own bot in a few lines of code

-   little
-   fast
-   easy to use

## Installation

**Node.js 16.9.0 or newer is required.**

```
npm install off
```

## Example usage

Install discord.js:

```sh-session
npm i offdjs
```

create a script in your **package.json** that runs `offdjs`:

```json
{
    "scripts": {
        "start": "offdjs"
    }
}
```

Set your token in an .env file at the root of the project (according to [discord.js](https://https://discord.js.org/) specs)

```env
DISCORD_TOKEN=your_discord_token
```

At this point you can run your script and the bot will turn on without requiring any configuration

```sh-session
npm start
```

## Events

To load events you just need to create a folder in the root called `events` and **offdjs** will read all the files whose name has the following structure:

```
eventName.event.js
```

**offdjs** can read subfolders within the `events` folder for easy event management

example:

```
.
├── events
│   ├── ready.event.js
│   └── guild
│       ├── guildMemberAdd.event.js
│       └── guildMemberRemove.event.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

The script should export by default a function which will be executed with the parameters of said event

```js
export default function ready(client) {
    console.log('ready')
}
```

## Commands

To load commands you just need to create a folder in the root called `commands` and **offdjs** will read all the files whose name has the following structure:

```
commandName.command.js
```

**offdjs** can read subfolders within the `commands` folder to make managing commands easier

example:

```
.
├── commands
│   ├── ping.command.js
│   └── actions
│       ├── punch.command.js
│       └── kiss.command.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

The script must export a default class that extends from the `Command` class provided by **offdjs** which is initialized in the super with at least the name that must match the name put in the file and a description, both properties are objects with properties named as [local Discord API](https://discord.com/developers/docs/reference#locales), `en-US` at least (this will change in the future)

The `Comand` class has an ChatInputCommandInteraction method with a parameter of type `ChatInputCommandInteraction<'cached'>` which is executed every time it receives a command interaction with the same name set which you can override to execute and respond to said interaction

example:

```js
import { Command } from 'offdjs'

export default class Ping extends Command {
    constructor() {
        super({
            name: {
                'en-US': 'ping'
            },
            description: {
                'en-US': 'Ping the bot'
            },
            global: false
        })
    }

    async ChatInputCommandInteraction(interaction) {
        interaction.reply('Pong!')
    }
}
```

If you want to abstract the functionality of the command you can create a folder called `interactions` and export a function `chatInputCommandInteraction` in a file with the name of the command, it will receive the interaction as a parameter of type `ChatInputCommandInteraction<'cached'>`

example:

```
.
├── interactions
│   └── ping.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
//ping.js

export function chatInputCommandInteraction(interaction) {
    interaction.reply('Pong!')
}
```

If you use subcommands you can create folders to use them as if the command name were a path; `/test ping` => `interactions/test/ping.js`

example:

```
.
├── interactions
│   └── test
│       └── ping.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
//ping.js

export function chatInputCommandInteraction(interaction) {
    interaction.reply('Pong!')
}
```

## Buttons

To receive button interactions you can create a folder called `interactions` and export a function `buttonInteraction` in a file with the name of the button id, it will receive the interaction as a parameter of type `ButtonInteraction<'cached'>`

example:

```
.
├── interactions
│   └── custom_id.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
//ping.js

export function buttonInteraction(interaction) {
    interaction.reply('you clicked the button')
}
```

if you need to use arguments in the button, you can pass them by the `customId` as a `string` separating them with `:` (you can custom `interactionSplit`). This also allows you to create subinteractions with the commands that like the `chatInputCommandInteraction` will split the logic into different files for example `interaction.customId = 'test:yes'` => `interactions/test/yes.js`. The arguments passed by id will be received along with the interaction

example:

```
.
├── interactions
│   ├── test.js
│   └── test
│       └── yes.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
//test.js

export function buttonInteraction(interaction, _, choice) {
    // this is executed in case the interaction.customId
    // is 'test:yes' or 'test:no'
    interaction.reply('you selected ' + choice)
    // choice contains a 'yes' or 'no'
}
```

```js
//test/yes.js

export function buttonInteraction(interaction) {
    // this is executed only in case
    // the interaction.customId is 'test:yes'
    interaction.reply('you selected yes')
}
```

## Client

To obtain the client, offdjs exports the client already initialized as default so if it requires. this is initialized by running `offdjs`

example:

```js
import client, { Command } from 'offdjs'

client.on('ready', () => console.log('ready'))

// client.login() isn't necessary
```

## executing index file

As you may have noticed, there is no index file to run, however, if required, you can easily create an index file to run extra processes like connecting to a database

You only have to import the client and use the login method in said file and you can change your script in the package.json or execute said file

example:

```js
//index.js

// import the client
import client from 'offdjs'

// others imports
import mongoose from 'mongoose'

// login the client (important)
client.login()

// connect to de db or others process
await mongoose.connect('mongodb://localhost/my_database')
```

If you run index.js it works without problems

```sh-session
node index.js
```

## Config

So far no configuration has been required, however, if you need to touch client configurations you can generate a `offdjs.config.js` file in the root where you export by default an object with properties to pass to the client, this step is optional

example:

```
.
├── offdjs.config.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
// offdjs.config.js
export default {
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages
    ]
}
```

## Root Directory

If you are working with typescript it is common to have a `build` folder

```
.
├── build
│   └── events
│       └── ...
├── node_modules
│   └── ...
├── .env
├── offdjs.config.js
└── package.json
└── tsc.json
```

By default offdjs reads the `commands` and `events` folders in root, to change root to the `build` folder you will need to export a `root` property in the config with the new route

example:

```js
// offdjs.config.js
export default {
    intents: [IntentsBitField.Flags.Guilds],
    root: 'build'
}
```

## i18n

offdjs has [i18n](https://www.npmjs.com/package/i18n) integration, you can enable the defaults in `offdjs.config.js` by setting the `i18n` property to `true` or by setting your own config

example:

```js
// offdjs.config.js
export default {
    i18n: true
}
```

or

```js
// offdjs.config.js
export default {
    i18n: {
        locales: ['en', es],
        directory: join(cwd, 'lang'),
        defaultLocale: 'en',
        retryInDefaultLocale: true
        // more config
    }
}
```

it also provides a function to create a translator which receives an interaction or message object and returns a function which you can use as a translator. The first parameter of the returned function will be a string with the phrase to translate and the second will be an object with the keywords to replace (optional) as if it were `i18n.__n()`

example:

```js
// x.command.js
import client, { Command, Translator } from 'offdjs'

export default class Ping extends Command {
    constructor() { super({ ... }) }

    async interaction(interaction) {
        const translate = Translator(interaction)
        await interaction.reply(translate('ping.response'))
        interaction.editReply(translate('ping.other', {
            name: client.user.username
        }))
    }
}
```

## interactions

...coming soon
