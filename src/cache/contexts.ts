import {
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction,
} from 'discord.js'
import { CacheHandler, InteractionHandler } from '../utils.js'

export default new CacheHandler<
    InteractionHandler<
        MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction
    >
>()
