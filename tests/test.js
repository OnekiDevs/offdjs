import assert from 'node:assert'
import { describe, it } from 'node:test'
import client from '../lib/index.js'
import { CacheHandler } from '../lib/utils.js'

// describe('Test', async () => {
describe('Client', () => {
    // it('the client should be a discord client', async () => {
    //     assert.strictEqual(client.constructor.name, 'Client')
    // })

    it('client should switch on with the token obtained from process.env.DISCORD_TOKEN', async () => {
        const token = await client.login()
        assert.strictEqual(token, process.env.DISCORD_TOKEN)
        client.destroy()
    })
})

describe('Cache', () => {
    it('#add()', async () => {
        const cache = new CacheHandler()
        cache.add('test', 'test')
        assert.deepStrictEqual([...cache.entries()], [['test', ['test']]])
        cache.add('test', 'test2')
        assert.deepStrictEqual([...cache.entries()], [['test', ['test', 'test2']]])
        cache.add('test3', 'test3')
        assert.deepStrictEqual(
            [...cache.entries()],
            [
                ['test', ['test', 'test2']],
                ['test3', ['test3']],
            ],
        )
    })

    describe('#fetch()', async () => {
        const cache = new CacheHandler()
        it('should return a Set', async () => {
            assert.strictEqual(cache.fetch('test').constructor.name, 'Set')
        })
        it('should return a void Set', async () => {
            assert.deepStrictEqual([...cache.fetch('test')], [])
        })
        it('should return a Set with the values', async () => {
            cache.add('test', 'test')
            assert.deepStrictEqual([...cache.fetch('test')], ['test'])
            cache.add('test', 'test2')
            assert.deepStrictEqual([...cache.fetch('test')], ['test', 'test2'])
            cache.add('test3', 'test3')
            assert.deepStrictEqual([...cache.fetch('test3')], ['test3'])
        })
        it('should return a Set with the values of the regex', async () => {
            cache.add(/test\d/, 'regex')
            assert.deepStrictEqual([...cache.fetch('test1')], ['regex'])
        })
    })
    //     before(() => {
    //         mkdirSync(`${process.cwd()}/commands/nested`, { recursive: true })
    //         writeFileSync(
    //             `${process.cwd()}/commands/test.js`,
    //             `export const name = 'cached'
    // export const handler = () => 'cached'`,
    //         )
    //         writeFileSync(
    //             `${process.cwd()}/commands/nested/test.js`,
    //             `export const name = 'nested'
    // export const handler = () => 'nested'`,
    //         )
    //     })
    // it('you should be able to get the cache from $cwd/commands', async () => {
    //     const { default: commands } = await import('../lib/cache/commands.js')
    //     const h = () => 'cached'
    //     assert.strictEqual([...commands.fetch('cached').values()][0].toString(), h.toString())
    // })
    // it('you should be able to get the cache from $cwd/commands/nested', async () => {
    //     const { default: commands } = await import('../lib/cache/commands.js')
    //     const h = () => 'nested'
    //     assert.strictEqual([...commands.fetch('nested').values()][0].toString(), h.toString())
    // })
    // after(() => {
    //     rmSync(`${process.cwd()}/commands`, { recursive: true, force: true })
    // })
    // })
})
