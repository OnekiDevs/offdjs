import {
    ApplicationCommandData,
    ApplicationCommandDataResolvable,
    ChatInputCommandInteraction,
    JSONEncodable,
    RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js'
import { CacheHandler, InteractionFile, InteractionHandler } from '../utils.js'
import { pathToFileURL } from 'node:url'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

class CommandCacheHandler extends CacheHandler<
    InteractionHandler<ChatInputCommandInteraction>
> {
    override async register(
        from: string,
        recursive?: boolean | undefined,
    ): Promise<this> {
        try {
            for (const file of readdirSync(from, { withFileTypes: true })) {
                if (file.isDirectory()) {
                    if (recursive)
                        await this.register(join(from, file.name), true)
                    continue
                }
                if (!file.name.endsWith('.js')) continue
                const interaction: InteractionFile<any> & {
                    command?: ApplicationCommandDataResolvable
                } = await import(
                    pathToFileURL(join(from, file.name)).toString()
                )
                const commandName =
                    interaction.name ??
                    ((
                        (
                            interaction.command as JSONEncodable<RESTPostAPIApplicationCommandsJSONBody>
                        ).toJSON?.().name
                    ) ?
                        new RegExp(
                            `${(interaction.command as JSONEncodable<RESTPostAPIApplicationCommandsJSONBody>).toJSON?.().name}:?([^:]+)?:?(.+)?`,
                        )
                    :   null) ??
                    ((
                        (
                            interaction.command as
                                | ApplicationCommandData
                                | RESTPostAPIApplicationCommandsJSONBody
                        ).name
                    ) ?
                        new RegExp(
                            `${(interaction.command as ApplicationCommandData | RESTPostAPIApplicationCommandsJSONBody).name}:?([^:]+)?:?(.+)?`,
                        )
                    :   null) ??
                    file.name.split(/\./g)[0]
                this.add(
                    commandName,
                    interaction.handler as InteractionHandler<ChatInputCommandInteraction>,
                )
            }
        } catch (e) {
            if (!(e as Error).message.includes('no such file or directory'))
                throw e
        }
        return this
    }
}

export default new CommandCacheHandler()
