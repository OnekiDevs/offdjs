import { CacheHandler, registerCache } from '../utils.js'
import { AutocompleteInteraction } from 'discord.js'
import { InteractionHandler } from '../types.js'
import { join } from 'node:path'

export default await registerCache(
    join(process.cwd(), 'autocompletes'),
    new CacheHandler<InteractionHandler<AutocompleteInteraction>>(),
)
