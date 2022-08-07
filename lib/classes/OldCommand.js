export default class OldCommand {
    name = 'ping';
    alias = [];
    constructor(options) {
        this.name = options.name;
        if (options.alias)
            this.alias = options.alias;
    }
    run(msg, args) {
        msg.reply('pong');
    }
}
