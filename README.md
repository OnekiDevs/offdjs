<div align="center">
	<br />
	<h1>OFFDJS</h1>
	<br />
	<p>
        <a href="https://discord.gg/8SpUxnF6v4"><img src="https://img.shields.io/discord/885674114310881362?color=5865F2&logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://www.npmjs.com/package/offdjs"><img src="https://img.shields.io/npm/v/offdjs.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/offdjs"><img src="https://img.shields.io/npm/dt/offdjs.svg?maxAge=3600" alt="npm downloads" /></a>
        <a href="https://packagephobia.com/result?p=offdjs" ><img src="https://packagephobia.com/badge?p=offdjs" alt="install size" /></a>
	</p>
</div>

# About

offdjs is a small framework that uses [discord.js](https://https://discord.js.org/) created to solve the needs and simplify the development of the Oneki bot made public so that anyone can create their own bot in a few lines of code

-   little
-   fast
-   easy to use
-   0 config

# Installation

**Node.js 18.12 or newer is required.**

```sh-session
npm install offdjs
```

# Example usage

Set your token in an .env file at the root of the project (according to [discord.js](https://https://discord.js.org/) specs)

```env
DISCORD_TOKEN="your_discord_token"
```

At this point you can run your script from the root of your project and the bot will turn on without requiring any configuration or installing anything at all.

```sh-session
npx offdjs
```

> You can also install offdjs locally and add it to your scripts in the `package.json`. (recomended)

```json
{
    "scripts": {
        "start": "offdjs"
    }
}
```

# Intents

intents can be declared in an environment variable `DISCORD_INTENTS` or as an argument `-i` in the command, its value will be the number of intents that can be calculated in the [intents calculator](https://discord-intents-calculator.vercel.app/), or the name of the item in its [upper snake case](https://discord.com/developers/docs/topics/gateway#list-of-intents) or [pascal case version](https://discord-api-types.dev/api/discord-api-types-v10/enum/GatewayIntentBits).

An example with .env

```env
DISCORD_INTENTS="1 GUILD_MEMBERS GuildBans"
```

An example with cli

```sh-session
npx offdjs -i 1 GUILD_MEMBERS GuildBans
```

# DJS components

offdjs exports all the discord.js library in 'offdjs/djs'. example: `import { Events } from 'offdjs/djs'`

# Events

To load events you just need to create a folder in the root called `events` and **offdjs** will read all the `.js` files; (custom events also work). **offdjs** can read subfolders inside the `events` folder for easy event organisation. **offdjs** will register the file name as event name.

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

The script must export a `handler` function to be executed with the parameters of such an event

```js
// events/ready.js
export function handler(client) {
    console.log('ready')
}
```

Optionally, you can export an `once` constant with `true` or `false` if you require it to be recorded as a once event. If you need to register several handlers for the same event you also have the option of exporting a name constant where you will explicitly declare the name of the event you need to subscribe to and **offdjs** will omit the file name and replace it with that constant.

```js
// events/other_ready.js
import { Events } from 'offdjs/djs'

export const name = Events.ClientReady

export const once = true

export function handler(client) {
    console.log('ready again')
}
```

# Interactions

Receiving interactions is similar to events. You need to export a `handler` function that will receive the interaction as a parameter.
You also need to export a constant `name` which can be of type `string` or `RegExp`; this constant, similar to events, will be compared with the id of the interaction or name of the command.
If the interaction has a custom id, the handler receives as parameters the id separated by `:`.
The name of the folder depends on the type of interaction y al igual que los eventos, los scripts pueden estar dentro de subcarpetas. Here are examples of the different types:

## Buttons

For buttons, the folder name is `buttons`.

```
.
├── buttons
│   └── confirm_ban.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
// confirm_ban.js
export const name = /ban:\d{18,19}/

/**
 * @param {ButtonInteraction} interaction - djs interaction object
 * @param {'ban'} _ - in this case always is 'ban'
 * @param {string} id - the id of the member to ban
 */
export function handler(interaction, _, id) {
    // example code
    const user = interaction.guild?.members.ban(id)
    interaction.reply({
        content: `User ${user} banned successfully`,
    })
}
```

## Select Menus

For selection menus, the folder name is `menus`, they receive any selectable menu, whether string, channel, role, user and mentionable menus.

```
.
├── menus
│   └── config
│       └── welcome_channel.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
// welcome_channel.js
export const name = 'config:welcome_channel'

/**
 * @param {AnySelectMenuInteraction} interaction - djs interaction object
 */
export function handler(interaction) {
    // example code
    if (!interaction.isChannelSelectMenu()) return
    const channel = interaction.channels.first()
    interaction.client.configWelcomeChannel(channel)
    interaction.reply({
        content: `welcomes are now displayed in ${channel}`,
    })
}
```

## Modals

For modals it is very similar to [buttons](#buttons) and the name of the folder is surprisingly `modals`.

```
.
├── modals
│   └── secret.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
// secret.js
export const name = 'secret'

/**
 * @param {ModalSubmitInteraction} interaction - djs interaction object
 */
export function handler(interaction) {
    // example code
    const secret = interaction.fields.getTextInputValue('secret')
    interaction.client.publishSecret(secret)
    interaction.reply({
        content: 'Your secret was published anonymously',
        ephemeral: true,
    })
}
```

## Context Menus

For context menu commands the folder shall be named `context` and shall receive both user context interactions and message context interactions.

```
.
├── contexts
│   └── warn.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
// warn.js
export const name = 'warn'

/**
 * @param {ContextMenuCommandInteraction} interaction - djs interaction object
 */
export function handler(interaction) {
    // example code
    interaction.showModal(
            new ModalBuilder()
                .setTitle(`Warn ${interaction.target.displayName}`)
                .setCustomId(`warn:${interaction.target.id}`)
                .setComponents(
                    new ActionRowBuilder<TextInputBuilder>().setComponents(
                        new TextInputBuilder()
                            .setCustomId('reason')
                            .setLabel('Reason')
                            .setRequired()
                            .setStyle(TextInputStyle.Paragraph)
                    )
                )
        )
}
```

## Commands

For commands the folder is called `commands`, these can export a third property called `command` of type `ApplicationCommandDataResolvable` which will be the command that the client will automatically register in each of the guilds. The `command` property is optional. The command name, subcommand and group shall also be received in the function parameters as a custom id. If the command contains subcommands and/or groups, the `name` property separates them with `:` as if they were buttons.

Offdjs will register the command for execution in the following order of priority:
- The name constant exported
- The name of the constant `command` exported.
- The name of the file

This means that the `export const name` is optional, plus, if you need to, you can name the file `poll:create.js` to listen only to the `/poll create` subcommand.

```
.
├── commands
│   └── poll.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
// secret.js
export const name = /poll:(create|finish)/

export const command =
    new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create or finish a poll')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a poll')
                .addStringOption(option =>
                    option
                        .setName('question')
                        .setDescription('The question to ask')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('finish')
                .setDescription('Finish a poll')
                .addStringOption(option =>
                    option
                        .setName('poll')
                        .setDescription('The id of the poll to finish')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )

/**
 * @param {ChatInputCommandInteraction} interaction - djs interaction object
 * @param {'poll'} _ - in this case always is 'poll'
 * @param {'create' | 'finish'} subcommand - the id of the member to ban
 */
export function handler(interaction, _, subcommand) {
    // example code
    if (subcommand === 'create') return interaction.client.newPoll(interaction)
    const pollId = interaction.options.getString('poll')
    interaction.client.finishPoll(pollId)
    interaction.reply({
        'Poll finished'
    })
}
```

## Autocompletes

For autocompletes the folder is called `autocompletes` and they behave similar to commands except that they **do not** export the `command` property. If the command contains subcommands and/or groups, the `name` property separates them with `:` as if they were buttons. The name of the command, subcommand and group will also be received in the function parameters as a custom id.

```
.
├── commands
│   └── poll.js
├── node_modules
│   └── ...
├── .env
└── package.json
```

```js
// secret.js
export const name = 'poll:finish'

/**
 * @param {AutocompleteInteraction} interaction - djs interaction object
 */
export function handler(interaction) {
    // example code
    const polls = interaction.client.polls
        .search(interaction.options.getFocused())
        .map(p => ({ value: p.id, name: p.name }))
    interaction.respond(polls)
}
```

# Root Directory

You can specify the root of your project by passing it as a parameter in the command (`-root build`) or by setting the environment variable `OFFDJS_ROOT`.

Example .env

```env
OFFDJS_ROOT="build"
```

Example cli

```sh-session
npx offdjs -r build
```

# Main process

## With cli

If you have extra processes, such as a database connection, you can indicate it to the cli as the first argument and it will execute it.

Example:

```sh-session
npx offdjs ./index.js
```

```js
// index.js
import server from './server.js'
import client from 'offdjs'
import mydb from './db.js'

// your custom process
await mydb.connect()
await server.listen(process.env.PORT ?? 3000)
server.send(client.user.username + ' ready')
```

> remember not to initialize the client in that file, offdjs already initializes it for you and you can import it with `import client from 'offdjs'`. the clien exported is an initialized client `Client<true>`.

## Without cli

It is also possible to run the framework without the cli by importing the client into your index.js file and executing `client.login()`.
To configure the `offdjs` options, such as intents, or root you can set them in `client.options`

> Note: `import { client } from 'offdjs'` export an uninitialized client `Client<false>`

Example

```js
// index.js
import { Events, GatewayIntentBits } from 'offdjs/djs'
import server from './server.js'
import mydb from './db.js'
import { client } 'offdjs'

// your custom process
await mydb.connect()
await server.listen(process.env.PORT ?? 3000)
client.on(Events.ClientReady, () => {
    server.send(client.user.username + ' ready')
})

// config framework

// intents
client.options.intents = new IntentsBitField([
    GatewayIntentBits.Guilds,
    GatewayIntentBits.Members
])
// root (from the cwd)
client.options.root = 'build'

await client.login()
```
