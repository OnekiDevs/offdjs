import { Command } from "commander"
import { Context, Layer } from "effect"
import pkg from "../../package.json" assert { type: "json" }

export class Cli extends Context.Tag("Cli")<
    Cli,
    ReturnType<typeof createCli>
>() {}

function createCli() {
    const cmd = new Command()
        .argument("[main]", "main file")
        .option("-t, --token <token>", "discord token")
        .option("-i, --intents <intents...>", "intents")
        .option("-r, --root <root>", "root")
        .option("-V, --verbose", "verbose", false)
        .version(pkg.version)
        .parse()

    return {
        cmd,
        args: cmd.args,
        opts: cmd.opts()
    }
}

export const CliLive = Layer.succeed(Cli, createCli())