import { CacheHandler } from '../utils.js'
import type { InteractionHandler } from '../types.js'
import { AnySelectMenuInteraction } from 'discord.js'
import { join } from 'node:path'

export default await new CacheHandler<InteractionHandler<AnySelectMenuInteraction>>().register(
    join(process.cwd(), 'menus'),
    true,
)
