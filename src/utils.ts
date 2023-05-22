import { ChatInputCommandInteraction, AutocompleteInteraction, Collection, Interaction } from 'discord.js'
import { EventFile, InteractionFile, InteractionHandler } from './types'
import { readdirSync } from 'node:fs'
import { Client } from 'discord.js'
import { join } from 'node:path'

export async function registerEvents(from: string, to: Client) {
    for (const file of readdirSync(from, { withFileTypes: true })) {
        if (file.isDirectory()) {
            await registerEvents(join(from, file.name), to)
            continue
        }
        if (!file.name.endsWith('.js')) continue
        const event: EventFile<any> = await import(join(from, file.name))
        to[event.once ? 'once' : 'on'](event.name, event.handler)
    }
    return to
}

export class CacheHandler<T> extends Collection<string | RegExp, T[]> {
    fetch(key: string | RegExp): Set<T> {
        const matchs = new Set<T>()
        if (this.has(key)) for (const handler of this.get(key)!) matchs.add(handler)
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
}

export async function registerCache<T extends Interaction>(from: string, to: CacheHandler<InteractionHandler<T>>) {
    for (const file of readdirSync(from, { withFileTypes: true })) {
        if (file.isDirectory()) {
            await registerCache(join(from, file.name), to)
            continue
        }
        if (!file.name.endsWith('.js')) continue
        const interaction: InteractionFile<any> = await import(join(from, file.name))
        to.add(interaction.name, interaction.handler as InteractionHandler<T>)
    }
    return to
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
