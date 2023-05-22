import { CacheHandler, registerCache } from '../utils.js'
import { ChatInputCommandInteraction } from 'discord.js'
import type { InteractionHandler } from '../types.js'
import { join } from 'node:path'

export default await registerCache(
    join(process.cwd(), 'commands'),
    new CacheHandler<InteractionHandler<ChatInputCommandInteraction>>(),
)
