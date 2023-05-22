import { CacheHandler, registerCache } from '../utils.js'
import { AnySelectMenuInteraction } from 'discord.js'
import { InteractionHandler } from '../types.js'
import { join } from 'node:path'

export default await registerCache(
    join(process.cwd(), 'menus'),
    new CacheHandler<InteractionHandler<AnySelectMenuInteraction>>(),
)
