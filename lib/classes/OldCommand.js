export class OldCommand {
    name = 'ping';
    description = 'pong';
    alias = [];
    client;
    constructor(options) {
        this.client = options.client;
        this.name = options.name;
        this.description = options.description;
        if (options.alias)
            this.alias = options.alias;
    }
    run(msg, args) {
        msg.reply('pong');
    }
}
