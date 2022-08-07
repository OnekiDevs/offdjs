import { readdirSync } from 'fs'
import { Collection, Guild } from 'discord.js'
import { join } from 'path'
import Command from '../classes/Command.js'

export default class CommandManager extends Collection<string, Command> {
    constructor(path: string) {
        super()

        try {
            for (const file of readdirSync(path).filter((f) => f.endsWith('.command.js'))) {
                import('file:///' + join(path, file)).then((command) => {
                    const cmd: Command = new command.default()
                    this.set(cmd.name, cmd)
                })
            }
        } catch (error) {
            // console.log('WARNING:', `${error}`)
        }
    }

    deploy(guild?: Guild) {
        if (process.env.DEPLOY_COMMANDS == 'true') return Promise.all(this.map((command) => command.deploy(guild)))
        else return Promise.resolve()
    }
}
