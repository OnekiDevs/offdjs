import { Context, Layer } from "effect"

export class Env extends Context.Tag("Env")<
    Env,
    { get: (key: string) => string | undefined }
>() {}

export const EnvLive = Layer.succeed(Env, {
    get: key => process.env[key]
})