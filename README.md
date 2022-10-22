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
npm install offdjs
```

## Example usage

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
DISCORD_TOKEN="your_discord_token"
```

At this point you can run your script and the bot will turn on without requiring any configuration

```sh-session
offdjs
```

## Events

To load events you just need to create a folder in the root called `events` and **offdjs** will read all the js files that contain an event as name; (custom events work too). **offdjs** can read subfolders within the `events` folder for easy event management

example:

```
.
├── events
│   ├── ready.js
│   └── guild
│       ├── guildMemberAdd.js
│       └── guildMemberRemove.js
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

To load commands you just need to create a folder in the root called `commands` and **offdjs** will read all the json and js files and will load them as global commands. **offdjs** can read subfolders within the `commands` folder to make managing commands easier.

example:

```
.
├── commands
│   └── ping.json
│   └── others
│       └── test.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

The json structure is the `ApplicationCommandData | RESTPostAPIApplicationCommandsJSONBody` type which exports discord.js.

**offdjs** synchronize the commands of your files and those already registered automatically when you turn on. If you want you can configure that behavior in `offdjs.config.js`, for more information see !!!!

## Chat input commands

If you need to respond to a command you can create a folder called `interactions` and export a function `chatInputCommandInteraction` in a file with the name of the command, it will receive the interaction as a parameter of type `ChatInputCommandInteraction<'cached'>`

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

## Menus

To receive menu interactions you can create a folder called `interactions` and export a function `selectMenuInteraction` in a file with the name of the menu id, it will receive the interaction as a parameter of type `SelectMenuInteraction<'cached'>`

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

export function selectMenuInteraction(interaction) {
    interaction.reply('you selected: ' + interaction.vaues.join(', '))
}
```

if you need to use arguments in the menu, you can pass them by the `customId` as a `string` separating them with `:` (you can custom `interactionSplit`). This also allows you to create subinteractions with the commands that like the `chatInputCommandInteraction` will split the logic into different files for example `interaction.customId = 'test:add'` => `interactions/test/add.js`. The arguments passed by id will be received along with the interaction

example:

```
.
├── interactions
│   ├── test.js
│   └── test
│       └── add.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
//test.js

export function selectMenuInteraction(interaction, _, choice) {
    // this is executed in case the interaction.customId
    // is 'test:add' or 'test:remove'
    interaction.reply(`you selected ${choice} this options: ${interaction.values.join(', ')}`)
    // choice contains a 'add' or 'remove'
}
```

```js
//test/add.js

export function selectMenuInteraction(interaction) {
    // this is executed only in case
    // the interaction.customId is 'test:add'
    interaction.reply('you selected add this options: ' + interaction.values.join(', '))
}
```

## Modals

To receive modal interactions you can create a folder called `interactions` and export a function `modalSubmitInteraction` in a file with the name of the modal id, it will receive the interaction as a parameter of type `ModalSubmitInteraction<'cached'>`

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

export function modalSubmitInteraction(interaction) {
    interaction.reply('you selected: ' + interaction.vaues.join(', '))
}
```

if you need to use arguments in the modal, you can pass them by the `customId` as a `string` separating them with `:` (you can custom `interactionSplit`). This also allows you to create subinteractions with the commands that like the `modalSubmitInteraction` will split the logic into different files for example `interaction.customId = 'test:add'` => `interactions/send/suggest.js`. The arguments passed by id will be received along with the interaction

example:

```
.
├── interactions
│   ├── send.js
│   └── send
│       └── suggest.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
//send.js

export function modalSubmitInteraction(interaction, _, choice) {
    // this is executed in case the interaction.customId
    // is 'send:suggest' or 'send:issue'
    interaction.reply(choice + ' sent')
    // choice contains a 'suggest' or 'issue'
}
```

```js
//send/suggest.js

export function modalSubmitInteraction(interaction) {
    // this is executed only in case
    // the interaction.customId is 'send:suggest'
    interaction.reply('suggest sent')
}
```

## Autocomplete

To receive autocomplete interactions you can create a folder called `interactions` and export a function `autocompleteInteraction` in a file with the name of the command or the name of the option focused in a folder with the name of the command, it will receive the interaction as a parameter of type `AutocompleteInteraction<'cached'>`

example:

```
.
├── interactions
│   └── search
│       └── query.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
//query.js

export function autocompleteInteraction(interaction) {
    const query = interaction.options.getFocused()
    interaction.respond(autocomplete(query))
}
```

```
.
├── interactions
│   └── search.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
//query.js

export function autocompleteInteraction(interaction) {
    const query = interaction.options.getFocused()
    if (interaction.options.getFocused(true).name === 'query') {
        interaction.respond(autocomplete(query))
    }
}
```

## Message context menu

To receive message context menu interactions you can create a folder called `interactions` and export a function `messageContextMenuCommandInteraction` in a file with the name of the command, it will receive the interaction as a parameter of type `MessageContextMenuCommandInteraction<'cached'>`

example:

```
.
├── interactions
│   └── translate.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
//query.js

export function messageContextMenuCommandInteraction(interaction) {
    interaction.reply(translate(interaction.targetMessage.content, interaction.locale))
}
```

## User context menu

To receive user context menu interactions you can create a folder called `interactions` and export a function `mserContextMenuCommandInteraction` in a file with the name of the command, it will receive the interaction as a parameter of type `UserContextMenuCommandInteraction<'cached'>`

example:

```
.
├── interactions
│   └── report.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
//report.js

export function userContextMenuCommandInteraction(interaction) {
    interaction.reply('User reported')
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

## Sync commands

**offdjs** synchronize the commands of your files and those already registered automatically when you turn on. There are several options to set on `offdjs.config.js` with the `syncCommands` property:

-   `'none'`: Skip this process and do not sync or upload any command
-   `files_to_discord`: Synchronize all the commands with the local files, deleting the ones that are not local and uploading the ones that are missing

## interactions

To receive interactions you can create a folder called `interactions` and export a default function in a file with the name of the command or the id of the button, it will receive the interaction as a parameter of type `Interaction`. If the interaction contains a `customId`, in the parameters you recibe a `customId` splited for `:`

Example:

```
.
├── interactions
│   └── avatar.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
//avatar.js
import { getToggleButton, getAvatarEmbed } from '../myUtils.js'

export default function (interaction, _, selected = 'user') {
    const button = getToggleButton(selected) // customId = 'avatar:user' | 'avatar:member'

    if (interaction.isChatInputCommand()) {
        const embed = getAvatarEmbed(interaction, selected)

        interaction.reply({
            embeds: [embed],
            components: [button]
        })
    } else if (interaction.isButton()) {
        const embed = getAvatarEmbed(interaction, selected)

        interaction.update({
            embeds: [embed],
            components: [button]
        })
    }
}
```

if you need recibe a specific interaction see [commands](#commands), [buttons](#buttons), [menus](#menus), [modals](#modals), [autocomplete](#autocomplete), [Message context menu](#message-context-menu) and [User context menu](#user-context-menu)
