# Changelog

All notable changes to this project will be documented in this file.

# 2.7.4

## Fix

-   **OFFDJS_INTENTS** loaded correctly

# 2.7.3

## Fix

-   **env** loaded correctly

# 2.7.2

## features

-   **types** `EventHandler`, `InteractionHandler` exported

# 2.7.1

## features

-   `intents` add defaault to cli -i option

# 2.7.0

## Breaking changues

-   `Node` verion required update

## features

-   `-V` mode verbose added

## Fix

-   `token` token visible on cli fixed

# 2.6.0

## features

-   `guilds` param in commands

# 2.5.2

## fixes

-   modal register fixed

# 2.5.1

## fixes

-   command naming fixed

# 2.5.0

## fixes

-   deploy commands
-   priority naming of commands

# 2.4.0

## features

-   set token in the cli

# 2.3.0

## features

-   declare root directory

# 2.2.2

## fixes

-   fix cli bug on windows

# 2.2.0

## features

-   custom intents

# 2.1.0

## features

-   event names are optionals

# 2.0.1

## types

-   export types in utils

# 2.0.0

## Breaking changues

Practically everything has changed. See the
[new docs](https://github.com/OnekiDevs/offdjs/blob/05bf908d4c7693b0ea1f494c28948598f82f3e2e/README.md)

# 1.1.0

## Breaking changues

-   **Interactions:** `SelectMenu` add support to new select menu
-   **Interactions:** `customId` arguments now is an array
-   **Client:** `cli` deleted logs

# 1.0.4

## Fix

-   **Client:** `Parse` serialize BigInt

# 1.0.3

## Fix

-   **syncCommands:** init on ready

# 1.0.1

## Fix

-   **Events:** `load` load events in login()

# 1.0.0

## Refactor

-   **Utils:** `export` delete unused functions
-   **Dependencies:** `package.json` delete unused dependecies and update

# 0.11.8

## Fix

-   **Utils:** `parse` detect json api format

# 0.11.4

## Fix

-   **Client:** `commands` not read root

# 0.11.3

## Fix

-   **Client:** `commands` not load new

# 0.11.2

## Types

-   **config:** `Config` are now optionals

# 0.11.1

## Fix

-   **JSON:** `commandSchema` $ref can not be resolved

# 0.11.0

## Feature

-   **JSON:** `commandSchema` schema created

# 0.10.6

## Feature

-   **Client:** `ClientOptions` export ClientOptions

# 0.10.5

## Fix

-   **Events:** `Load` the events path is fixed

# 0.10.4

## Fix

-   **Sync commands:** `ENOENT` no such file or directory

# 0.10.3

## Features

-   **Sync commands:** `syncCommands` add new option to sync

# 0.10.2

## Docs

-   **Sync commands:** `syncCommands` add docs about sync commands

# 0.10.1

## Changues

-   **Client:** `Commands` the client load js command files
-   **Client:** `Commands` the client read rest djs command properties
-   **Client:** `Events` the event files don't need a .event.js nomenglature

# 0.10.0

## Features

-   **utils:** `parseAPICommand` added method to parse objecs to
    `RESTPostAPIApplicationCommandsJSONBody`
-   **Client:** `syncCommands` the client sync the commands whith the local files

# 0.9.0

## Features

-   **commands:** `Global Commands` added method to register

# 0.8.0

## Features

-   **interactions:** `UserContextMenuCommandInteraction` added method to reply

# 0.7.0

## Features

-   **interactions:** `MessageContextMenuCommandInteraction` added method to reply

# 0.6.0

## Features

-   **interactions:** `AutocompleteInteraction` added method to reply

# 0.5.0

## Features

-   **interactions:** `ModalSubmitInteraction` added method to reply

# 0.4.0

## Features

-   **interactions:** `SelectMenuInteraction` added method to reply

# 0.3.0

## Features

-   **interactions:** `ButtonInteraction` added method to reply

# 0.2.0

## Features

-   **interactions:** `ChatInputCommandInteraction` added method to reply
