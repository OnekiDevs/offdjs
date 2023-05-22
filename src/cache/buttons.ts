import { CacheHandler, InteractionHandler } from '../utils.js'
import { ButtonInteraction } from 'discord.js'
import { join } from 'node:path'

export default await new CacheHandler<InteractionHandler<ButtonInteraction>>().register(
    join(process.cwd(), 'buttons'),
    true,
)
