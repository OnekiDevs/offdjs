import {
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Message,
    ModalSubmitInteraction,
    SelectMenuInteraction
} from 'discord.js'
import { Command } from '../utils/classes.js'

export default class Test extends Command {
    constructor() {
        super({
            name: {
                'en-US': 'test',
                'es-ES': 'test'
            },
            description: {
                'en-US': 'Test command',
                'es-ES': 'Comando de test'
            }
        })
    }

    override async interaction(
        interaction: ChatInputCommandInteraction<'cached'>
    ) {
        interaction.reply('test...')
    }

    override async message(
        message: Message<true>,
        _args: string[]
    ): Promise<any> {
        message.reply('test...')
    }

    override async button(
        interaction: ButtonInteraction<'cached'>
    ): Promise<any> {
        interaction.reply('test...')
    }

    override async autocomplete(
        interaction: AutocompleteInteraction<'cached'>
    ): Promise<any> {
        interaction.respond([
            {
                name: 'test',
                value: 'test'
            }
        ])
    }

    override async modal(
        interaction: ModalSubmitInteraction<'cached'>
    ): Promise<any> {
        interaction.reply('test...')
    }

    override async select(
        interaction: SelectMenuInteraction<'cached'>
    ): Promise<any> {
        interaction.reply('test...')
    }
}
