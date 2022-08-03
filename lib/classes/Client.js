import { Client as BaseClient, Collection } from 'discord.js';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';
import { sendError } from '../utils/utils.js';
import { createRequire } from 'module';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';
import { WebSocket } from 'ws';
import { CommandManager, ComponentManager, OldCommandManager, Server } from '../utils/classes.js';
import i18n from 'i18n';
const __dirname = dirname(fileURLToPath(import.meta.url));
const version = createRequire(import.meta.url)('../../package.json').version;
export class Client extends BaseClient {
    db;
    version;
    i18n = i18n;
    commands;
    oldCommands;
    components;
    websocket;
    constants;
    _wsInterval;
    _wsintent = 1;
    embeds = new Collection();
    reconect = true;
    _wsw = false;
    constructor(options) {
        super(options);
        this.oldCommands = new OldCommandManager(this, options.routes.oldCommands);
        this.commands = new CommandManager(this, options.routes.commands);
        this.components = new ComponentManager(this, options.routes.components);
        this.i18n.configure(options.i18n);
        this.version = version ?? '1.0.0';
        this.db = getFirestore(initializeApp({
            credential: cert(options.firebaseToken)
        }));
        this.constants = {
            errorChannel: '',
            imgChannel: '',
            jsDiscordRoll: '',
            newServerLogChannel: ''
        };
        this.once('ready', () => this._onReady({
            eventsPath: options.routes?.events ?? join(__dirname, '../events')
        }));
        this._initWebSocket();
    }
    get embedFooter() {
        return {
            text: `${this.user?.username} Bot v${this.version}`,
            iconURL: this.user?.avatarURL()
        };
    }
    _initWebSocket() {
        console.log('\x1b[36m%s\x1b[0m', 'Iniciando WebSocket...');
        this._wsw = false;
        this.websocket = new WebSocket('wss://oneki.up.railway.app/');
        this.websocket.on('open', () => {
            console.time('WebSocket Connection');
            this.websocket?.send(this.token);
            console.log('\x1b[33m%s\x1b[0m', 'Socket Conectado!!!');
            this._wsInterval = setInterval(() => this.websocket?.ping(() => ''), 20000);
            this._wsintent = 1;
        });
        this.websocket.on('close', () => {
            if (!this.reconect)
                return;
            console.log('ws closed event');
            console.log(`WebSocket closed, reconnecting in ${5000 * this._wsintent++} miliseconds...`);
            clearInterval(this._wsInterval);
            if (!this._wsw)
                setTimeout(() => this._initWebSocket(), 5000 * this._wsintent);
            this._wsw = true;
        });
        this.websocket.on('message', () => this._onWebSocketMessage);
        this.websocket.on('error', () => {
            if (!this.reconect)
                return;
            console.log('ws error event');
            console.log(`WebSocket closed, reconnecting in ${5000 * this._wsintent++} miliseconds...`);
            clearInterval(this._wsInterval);
            if (!this._wsw)
                setTimeout(() => this._initWebSocket(), 5000 * this._wsintent);
            this._wsw = true;
        });
    }
    async _onReady(options) {
        await this.commands.deploy();
        console.log('\x1b[32m%s\x1b[0m', 'Comandos Desplegados!!');
        await this.initializeEventListener(options.eventsPath);
        console.log('\x1b[35m%s\x1b[0m', 'Eventos Cargados!!');
        await this._checkBirthdays();
        await this.checkBans();
        console.log('\x1b[31m%s\x1b[0m', `${this.user?.username} ${this.version} Lista y Atenta!!!`);
    }
    _onWebSocketMessage(message) {
        try {
            const data = JSON.parse(message);
            if (data.event === 'error') {
                this.reconect = false;
                console.error(data.message);
                sendError(new Error(data.message), import.meta.url);
            }
            else if (data.event)
                this.emit(data.event, data.data);
        }
        catch (error) {
            if (error.startsWith('SyntaxError'))
                console.error('SyntaxError on socket', message);
        }
    }
    initializeEventListener(path) {
        return Promise.all(readdirSync(path)
            .filter(f => f.includes('.event.'))
            .map(async (file) => {
            const event = await import('file:///' + join(path, file));
            const [eventName] = file.split('.');
            this.on(eventName, (...args) => event.default(...args));
        }));
    }
    async checkBans() {
    }
    async _checkBirthdays() {
        console.log('\x1b[34m%s\x1b[0m', 'Revisando cumpleaños...');
        const usersSnap = await this.db.collection('users').get();
        usersSnap.forEach(async (user) => {
            const birthday = user.data()['birthday'];
            if (!birthday)
                return;
            const [month, day, year] = birthday.split('/');
            if (year > new Date().getFullYear())
                return;
            if (month > new Date().getMonth() + 1 || day > new Date().getDate())
                return;
            const newBirthday = `${month}/${day}/${parseInt(year) + 1}`;
            this.db
                .collection('users')
                .doc(user.id)
                .update({ birthday: newBirthday });
        });
        setTimeout(() => {
            this._checkBirthdays();
        }, 86400000);
    }
    newServer(guild) {
        const server = new Server(guild);
        return server;
    }
}
