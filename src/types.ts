import {
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction,
    ApplicationCommandDataResolvable,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    ClientEvents,
    Interaction,
} from 'discord.js'

export type EventFile<K extends keyof ClientEvents> = {
    name: K
    once: boolean
    handler: EventHandler<K>
}

export type EventHandler<K extends keyof ClientEvents> = (...args: ClientEvents[K]) => Promise<any>

export type InteractionHandler<T extends Interaction> = (Interaction: T, ...args: any[]) => Promise<any>

export type InteractionFile<T extends Interaction> = T extends ChatInputCommandInteraction
    ? {
          name: string | RegExp
          command?: ApplicationCommandDataResolvable & {
              type?: ApplicationCommandType.ChatInput
          }
          handler: InteractionHandler<T>
      }
    : T extends UserContextMenuCommandInteraction
    ? {
          name: string | RegExp
          handler: InteractionHandler<T>
          type: ApplicationCommandType.User
      }
    : T extends MessageContextMenuCommandInteraction
    ? {
          name: string | RegExp
          handler: InteractionHandler<T>
          type: ApplicationCommandType.Message
      }
    : {
          name: string | RegExp
          handler: InteractionHandler<T>
      }
