import { CacheHandler, registerCache } from '../utils.js'
import type { InteractionHandler } from '../types.js'
import { AnySelectMenuInteraction } from 'discord.js'
import { join } from 'node:path'

export default await registerCache(
    join(process.cwd(), 'menus'),
    new CacheHandler<InteractionHandler<AnySelectMenuInteraction>>(),
)
