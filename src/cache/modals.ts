import { CacheHandler } from '../utils.js'
import type { InteractionHandler } from '../types.js'
import { ModalSubmitInteraction } from 'discord.js'
import { join } from 'node:path'

export default await new CacheHandler<InteractionHandler<ModalSubmitInteraction>>().register(
    join(process.cwd(), 'modals'),
    true,
)
