import { CacheHandler, InteractionHandler } from '../utils.js'
import { AutocompleteInteraction } from 'discord.js'
import { join } from 'node:path'

export default await new CacheHandler<InteractionHandler<AutocompleteInteraction>>().register(
    join(process.cwd(), 'autocompletes'),
    true,
)
