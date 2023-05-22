import {
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction,
    ApplicationCommandDataResolvable,
    ChatInputCommandInteraction,
    AutocompleteInteraction,
    ApplicationCommandType,
    ClientEvents,
    Interaction,
    Collection,
} from 'discord.js'
import { readdirSync } from 'node:fs'
import { Client } from 'discord.js'
import { join } from 'node:path'

export async function registerEvents(from: string, to: Client) {
    try {
        for (const file of readdirSync(from, { withFileTypes: true })) {
            if (file.isDirectory()) {
                await registerEvents(join(from, file.name), to)
                continue
            }
            if (!file.name.endsWith('.js')) continue
            const event: EventFile<any> = await import(join(from, file.name))
            to[event.once ? 'once' : 'on'](event.name, event.handler)
        }
    } catch (e) {
        if (!(e as Error).message.includes('no such file or directory')) throw e
    }
    return to
}

export class CacheHandler<T> extends Collection<string | RegExp, T[]> {
    fetch(key: string | RegExp): Set<T> {
        const matchs = new Set<T>()
        if (this.has(key)) for (const handler of this.get(key) as T[]) matchs.add(handler)
        else if (typeof key === 'string')
            for (const [name, handler] of this.entries()) {
                if (typeof name === 'string') continue
                if (name.test(key)) for (const h of handler) matchs.add(h)
            }
        return matchs
    }

    add(key: string | RegExp, value: T) {
        const handlers = this.fetch(key)
        handlers.add(value)
        super.set(key, [...handlers])
        return this
    }

    async register(from: string, recursive?: boolean) {
        try {
            for (const file of readdirSync(from, { withFileTypes: true })) {
                if (file.isDirectory()) {
                    if (recursive) await this.register(join(from, file.name), true)
                    continue
                }
                if (!file.name.endsWith('.js')) continue
                const interaction: InteractionFile<any> = await import(join(from, file.name))
                this.add(interaction.name, interaction.handler as T)
            }
        } catch (e) {
            if (!(e as Error).message.includes('no such file or directory')) throw e
        }
        return this
    }
}

export function formatName(interaction: ChatInputCommandInteraction | AutocompleteInteraction) {
    return [
        interaction.commandName,
        interaction.options.getSubcommandGroup(false),
        interaction.options.getSubcommand(false),
    ]
        .filter(Boolean)
        .join(':')
}

// types

export type EventFile<K extends keyof ClientEvents> = {
    name: K
    once: boolean
    handler: EventHandler<K>
}

export type EventHandler<K extends keyof ClientEvents> = (...args: ClientEvents[K]) => Promise<any>

export type InteractionHandler<T extends Interaction> = (Interaction: T, ...args: any[]) => Promise<any>

export type InteractionFile<T extends Interaction> = T extends ChatInputCommandInteraction
    ? {
          name: string | RegExp
          command?: ApplicationCommandDataResolvable & {
              type?: ApplicationCommandType.ChatInput
          }
          handler: InteractionHandler<T>
      }
    : T extends UserContextMenuCommandInteraction
    ? {
          name: string | RegExp
          handler: InteractionHandler<T>
          type: ApplicationCommandType.User
      }
    : T extends MessageContextMenuCommandInteraction
    ? {
          name: string | RegExp
          handler: InteractionHandler<T>
          type: ApplicationCommandType.Message
      }
    : {
          name: string | RegExp
          handler: InteractionHandler<T>
      }
