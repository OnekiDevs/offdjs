import { Collection, Guild } from 'discord.js'
import Command from '../classes/Command.js'
import { readdirSync } from 'fs'
import { join } from 'path'

export default class CommandManager extends Collection<string, Command> {
    subcommands = new Collection<string, Command>()

    constructor(path: string) {
        super()
        try {
            for (const file of readdirSync(path, { withFileTypes: true })) {
                if (file.isDirectory()) {
                    for (const f of readdirSync(join(path, file.name), { withFileTypes: true })) {
                        if (f.name.endsWith('.command.js'))
                            import('file:///' + join(path, file.name, f.name)).then((command) => {
                                const cmd = new command.default()
                                this.set(cmd.name, cmd)
                            })
                    }
                } else if (file.name.endsWith('.command.js'))
                    import('file:///' + join(path, file.name)).then((command) => {
                        const cmd = new command.default()
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
