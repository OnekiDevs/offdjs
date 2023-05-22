import { CacheHandler, InteractionHandler } from '../utils.js'
import { AnySelectMenuInteraction } from 'discord.js'
import { join } from 'node:path'

export default await new CacheHandler<InteractionHandler<AnySelectMenuInteraction>>().register(
    join(process.cwd(), 'menus'),
    true,
)
