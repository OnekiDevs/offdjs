import { CacheHandler } from '../utils.js'
import { ChatInputCommandInteraction } from 'discord.js'
import type { InteractionHandler } from '../types.js'
import { join } from 'node:path'

export default await new CacheHandler<InteractionHandler<ChatInputCommandInteraction>>().register(
    join(process.cwd(), 'commands'),
    true,
)
