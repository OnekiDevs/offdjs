import { CacheHandler } from '../utils.js'
import type { InteractionHandler } from '../types.js'
import { ButtonInteraction } from 'discord.js'
import { join } from 'node:path'

export default await new CacheHandler<InteractionHandler<ButtonInteraction>>().register(
    join(process.cwd(), 'buttons'),
    true,
)
