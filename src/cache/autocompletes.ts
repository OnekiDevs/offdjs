import { CacheHandler } from '../utils.js'
import type { InteractionHandler } from '../types.js'
import { AutocompleteInteraction } from 'discord.js'
import { join } from 'node:path'

export default await new CacheHandler<InteractionHandler<AutocompleteInteraction>>().register(
    join(process.cwd(), 'autocompletes'),
    true,
)
