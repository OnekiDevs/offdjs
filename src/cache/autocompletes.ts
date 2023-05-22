import { CacheHandler, registerCache } from '../utils.js'
import type { InteractionHandler } from '../types.js'
import { AutocompleteInteraction } from 'discord.js'
import { join } from 'node:path'

export default await registerCache(
    join(process.cwd(), 'autocompletes'),
    new CacheHandler<InteractionHandler<AutocompleteInteraction>>(),
)
