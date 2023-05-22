import { CacheHandler, registerCache } from '../utils.js'
import type { InteractionHandler } from '../types.js'
import { ButtonInteraction } from 'discord.js'
import { join } from 'node:path'

export default await registerCache(
    join(process.cwd(), 'buttons'),
    new CacheHandler<InteractionHandler<ButtonInteraction>>(),
)
