import { MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from 'discord.js'
import { CacheHandler, InteractionHandler } from '../utils.js'
import { join } from 'node:path'

export default await new CacheHandler<
    InteractionHandler<MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction>
>().register(join(process.cwd(), 'contexts'), true)
