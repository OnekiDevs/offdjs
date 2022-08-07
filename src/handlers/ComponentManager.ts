import Component from '../classes/Component.js'
import { randomId } from '../utils.js'
import { Collection } from 'discord.js'
import { join } from 'path'
import { readdirSync } from 'fs'

export default class ComponentManager extends Collection<string, Component> {
    constructor(path: string) {
        super()
        try {
            for (const file of readdirSync(path).filter((f) => f.includes('.component.'))) {
                import('file:///' + join(path, file)).then((componentClass) => {
                    const component: Component = new componentClass.default()
                    this.set(randomId(), component)
                })
            }
        } catch (error) {
            // console.log('WARNING:', `${error}`)
        }
    }
}
