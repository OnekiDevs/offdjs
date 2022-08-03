import { readdirSync } from 'fs'
import { Collection, Guild } from 'discord.js'
import { Command, Client } from '../utils/classes.js'
import { join } from 'path'

export class CommandManager extends Collection<string, Command> {
    client: Client

    constructor(client: Client, path: string) {
        super()
        this.client = client

        try {
            for (const file of readdirSync(path).filter(f =>
                f.endsWith('.command.js')
            )) {
                import('file:///' + join(path, file)).then(command => {
                    const cmd: Command = new command.default(client)
                    this.set(cmd.name, cmd)
                })
            }
        } catch (error) {
            console.log('WARNING:', `${error}`)
        }
    }

    deploy(guild?: Guild) {
        if (process.env.DEPLOY_COMMANDS == 'true')
            return Promise.all(this.map(command => command.deploy(guild)))
        else return Promise.resolve()
    }
}
