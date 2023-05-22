import { MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from 'discord.js'
import { CacheHandler, registerCache } from '../utils.js'
import type { InteractionHandler } from '../types.js'
import { join } from 'node:path'

export default await registerCache(
    join(process.cwd(), 'contexts'),
    new CacheHandler<InteractionHandler<MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction>>(),
)
