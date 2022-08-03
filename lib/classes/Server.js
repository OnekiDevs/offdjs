import { ChatInputCommandInteraction, Collection, EmbedBuilder } from 'discord.js';
import { FieldValue } from 'firebase-admin/firestore';
import { PunishmentType, sleep } from '../utils/utils.js';
import ms from 'iblazingx-ms';
import client from '../index.js';
export class Server {
    autoroles = new Collection();
    rejectSug(id) {
        throw new Error('Method not implemented.' + id);
    }
    aceptSug(id) {
        throw new Error('Method not implemented.' + id);
    }
    _emojiAnalisisEnabled = false;
    guild;
    #prefixes = ['>', '?'];
    db;
    suggestChannels = [];
    _lastSuggestId = 0;
    logsChannels = {};
    keepRoles = false;
    blacklistedWords = [];
    disabledChannels = [];
    birthday = {};
    premium = false;
    emojiStatistics = {};
    emojiTimeout;
    constructor(guild) {
        this.guild = guild;
        this.db = guild.client.db.collection('guilds').doc(guild.id);
    }
    async init() {
        return this.syncDB();
    }
    async syncDB(dataPriority) {
        if (this.guild.client.user?.id === '897298074915975269' &&
            this.guild.id === '885674114310881362')
            return;
        const db = await this.db.get();
        if (!db.exists || dataPriority) {
            const obj = this.toDBObject();
            return this.db.set(obj);
        }
        const data = db.data();
        if (data.disabled_channels)
            this.disabledChannels = data.disabled_channels;
        if (data.blacklisted_words)
            this.blacklistedWords = data.blacklisted_words;
        if (data.keep_roles && data.premium)
            this.keepRoles = data.keep_roles;
        if (data.premium)
            this.premium = true;
        if (data.last_suggest)
            this.lastSuggestId = data.last_suggest;
        if (data.suggest_channels)
            this.suggestChannels = data.suggest_channels;
        if (data.logs_channels) {
            const { message_update, message_delete, message_attachment, invite, member_update, sanction } = data.logs_channels;
            if (message_update)
                this.logsChannels.messageUpdate = message_update;
            if (message_delete)
                this.logsChannels.messageDelete = message_delete;
            if (message_attachment)
                this.logsChannels.attachment = message_attachment;
            if (invite)
                this.logsChannels.invite = invite;
            if (member_update)
                this.logsChannels.memberUpdate = member_update;
            if (sanction)
                this.logsChannels.sanction = sanction;
        }
        if (data.birthday?.channel)
            this.birthday.channel = data.birthday.channel;
        if (data.birthday?.message)
            this.birthday.message = data.birthday.message;
        if (data.emoji_statistics)
            this.emojiStatistics = data.emoji_statistics;
        if (data.emoji_analisis_enabled && data.premium)
            this.startEmojiAnalisis();
        if (data.autoroles) {
            for (const [key, value] of Object.entries(data.autoroles)) {
                this.autoroles.set(key, new Set(value));
            }
        }
        return;
    }
    toDBObject(toPublic) {
        const obj = {};
        if (JSON.stringify(this.getPrefixes(true)) !==
            JSON.stringify(['?', '>']))
            obj.prefixes = this.#prefixes;
        if (this.lastSuggestId)
            obj.last_suggest = this.lastSuggestId;
        if (this.suggestChannels)
            obj.suggest_channels = this.suggestChannels;
        if (this.logsChannels) {
            const { messageUpdate, messageDelete, attachment: Attachment, invite, memberUpdate } = this.logsChannels;
            obj.logs_channels = {};
            if (messageUpdate)
                obj.logs_channels.message_update = messageUpdate;
            if (messageDelete)
                obj.logs_channels.message_delete = messageDelete;
            if (Attachment)
                obj.logs_channels.message_attachment = Attachment;
            if (invite)
                this.logsChannels.invite = invite;
            if (memberUpdate)
                this.logsChannels.memberUpdate = memberUpdate;
        }
        obj.birthday = {};
        if (this.birthday?.channel)
            obj.birthday.channel = this.birthday.channel;
        if (this.birthday?.message)
            obj.birthday.message = this.birthday.message;
        if (this._emojiAnalisisEnabled)
            obj.emoji_analisis_enabled = true;
        if (toPublic && this.emojiStatistics)
            obj.emoji_statistics = this.emojiStatistics;
        if (toPublic)
            obj.premium = this.premium;
        if (this.autoroles) {
            obj.autoroles = {};
            for (const [key, value] of this.autoroles.entries()) {
                obj.autoroles[key] = [...value];
            }
        }
        if (this.keepRoles)
            obj.keep_roles = this.keepRoles;
        if (this.disabledChannels)
            obj.disabled_channels = this.disabledChannels;
        return obj;
    }
    get lastSuggestId() {
        return this._lastSuggestId;
    }
    set lastSuggestId(n) {
        this._lastSuggestId = n;
        this.db
            .update({ last_suggest: n })
            .catch(() => this.db.set({ last_suggest: n }));
    }
    get emojiAnalisisEnabled() {
        return this._emojiAnalisisEnabled;
    }
    get prefixes() {
        return [
            `<@!${this.guild.members.me?.id}>`,
            `<@${this.guild.members.me?.id}>`,
            ...this.#prefixes
        ];
    }
    set prefixes(value) {
        this.#prefixes = value;
    }
    getPrefixes(onlyDeclared) {
        if (onlyDeclared === undefined || onlyDeclared)
            return this.#prefixes;
        else
            return this.prefixes;
    }
    setPrefix(prefix) {
        this.#prefixes = [prefix];
        this.db
            .update({ prefix: [prefix] })
            .catch(() => this.db.update({ prefix: [prefix] }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'set_prefix',
            from: 'mts',
            data: {
                prefix: prefix,
                guild: this.guild.id
            }
        }));
    }
    addPrefix(prefix) {
        if (this.#prefixes.includes(prefix))
            return;
        this.#prefixes.push(prefix);
        this.db
            .update({ prefixies: this.#prefixes })
            .catch(() => this.db.set({ prefixies: this.#prefixes }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'add_prefix',
            from: 'mts',
            data: {
                prefix: prefix,
                guild: this.guild.id
            }
        }));
    }
    removePrefix(prefix) {
        if (this.#prefixes.includes(prefix)) {
            this.#prefixes.splice(this.#prefixes.indexOf(prefix), 1);
            if (this.#prefixes.length < 1) {
                this.#prefixes = ['>', '?'];
                this.db
                    .update({ prefixies: FieldValue.delete() })
                    .catch(() => this.db.set({ prefixies: FieldValue.delete() }));
            }
            else
                this.db
                    .update({ prefixies: FieldValue.arrayRemove(prefix) })
                    .catch(() => this.db.set({
                    prefixies: FieldValue.arrayRemove(prefix)
                }));
        }
        ;
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'remove_prefix',
            from: 'mts',
            data: {
                prefix: prefix,
                guild: this.guild.id
            }
        }));
    }
    get lang() {
        return this.guild.preferredLocale;
    }
    setSuggestChannel(channel) {
        this.suggestChannels = [
            { channel: channel.id, default: true }
        ];
        this.db
            .update({
            suggest_channels: [{ channel: channel.id, default: true }]
        })
            .catch(() => this.db.set({
            suggest_channels: [{ channel: channel.id, default: true }]
        }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'set_suggest_channel',
            from: 'mts',
            data: {
                channel: channel.id,
                guild: this.guild.id
            }
        }));
    }
    addSuggestChannel(suggestChannelObject) {
        if (suggestChannelObject.default)
            this.suggestChannels = this.suggestChannels.map(i => i.default ? suggestChannelObject : i);
        else
            this.suggestChannels.push(suggestChannelObject);
        this.db
            .update({ suggest_channels: this.suggestChannels })
            .catch(() => this.db.set({ suggest_channels: this.suggestChannels }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'add_suggest_channel',
            from: 'mts',
            data: {
                channel: suggestChannelObject.channel,
                default: suggestChannelObject.default,
                alias: suggestChannelObject.alias,
                guild: this.guild.id
            }
        }));
    }
    removeSuggestChannel(idToRemove) {
        if (!this.suggestChannels.find(c => c.channel == idToRemove))
            return;
        const newChannels = this.suggestChannels
            .map(c => {
            if (c.channel == idToRemove)
                return false;
            return c;
        })
            .filter(c => c);
        this.suggestChannels = newChannels;
        this.db
            .update({ suggest_channels: this.suggestChannels })
            .catch(() => this.db.set({ suggest_channels: this.suggestChannels }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'remove_suggest_channel',
            from: 'mts',
            data: {
                channel: idToRemove,
                guild: this.guild.id
            }
        }));
    }
    updateChannelsLogsInDB() {
        const data = {};
        if (this.logsChannels.messageUpdate)
            data['logs_channels.message_update'] =
                this.logsChannels.messageUpdate;
        if (this.logsChannels.attachment)
            data['logs_channels.message_attachment'] =
                this.logsChannels.attachment;
        if (this.logsChannels.messageDelete)
            data['logs_channels.message_delete'] =
                this.logsChannels.messageDelete;
        if (this.logsChannels.invite)
            data['logs_channels.invite'] = this.logsChannels.invite;
        if (this.logsChannels.memberUpdate)
            data['logs_channels.member_update'] = this.logsChannels.memberUpdate;
        if (this.logsChannels.sanction)
            data['logs_channels.sanction'] = this.logsChannels.sanction;
        if (Object.values(data).length === 0)
            data.logs_channels = FieldValue.delete();
        this.db.update(data).catch(() => this.db.set(data));
    }
    setMessageUpdateLog(channel) {
        this.logsChannels.messageUpdate = channel;
        this.db
            .update({ ['logs_channels.message_update']: channel })
            .catch(() => this.db.set({ ['logs_channels.message_update']: channel }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'set_log',
            from: 'mts',
            data: {
                log: 'MESSAGE_UPDATE',
                channel: channel,
                guild: this.guild.id
            }
        }));
    }
    removeMessageUpdateLog() {
        if (!this.logsChannels.messageUpdate)
            return;
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'remove_log',
            from: 'mts',
            data: {
                log: 'MESSAGE_UPDATE',
                channel: this.logsChannels.messageUpdate,
                guild: this.guild.id
            }
        }));
        delete this.logsChannels.messageUpdate;
        this.updateChannelsLogsInDB();
    }
    setMessageDeleteLog(channel) {
        this.logsChannels.messageDelete = channel;
        this.db
            .update({ ['logs_channels.message_delete']: channel })
            .catch(() => this.db.set({ ['logs_channels.message_delete']: channel }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'set_log',
            from: 'mts',
            data: {
                log: 'MESSAGE_DELETE',
                channel: channel,
                guild: this.guild.id
            }
        }));
    }
    removeMessageDeleteLog() {
        if (!this.logsChannels.messageDelete)
            return;
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'remove_log',
            from: 'mts',
            data: {
                log: 'MESSAGE_DELETE',
                channel: this.logsChannels.messageDelete,
                guild: this.guild.id
            }
        }));
        delete this.logsChannels.messageDelete;
        this.updateChannelsLogsInDB();
    }
    setAttachmentLog(channel) {
        this.logsChannels.attachment = channel;
        this.db
            .update({ ['logs_channels.message_attachment']: channel })
            .catch(() => this.db.set({ ['logs_channels.message_attachment']: channel }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'set_log',
            from: 'mts',
            data: {
                log: 'MESSAGE_ATTACHMENT',
                channel,
                guild: this.guild.id
            }
        }));
    }
    removeAttachmentLog() {
        if (!this.logsChannels.attachment)
            return;
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'remove_log',
            from: 'mts',
            data: {
                log: 'MESSAGE_ATTACHMENT',
                channel: this.logsChannels.attachment,
                guild: this.guild.id
            }
        }));
        delete this.logsChannels.attachment;
        this.updateChannelsLogsInDB();
    }
    translate(phrase, params) {
        const i18n = this.guild.client.i18n;
        if (params)
            return i18n.__mf({ phrase, locale: this.lang }, params).toString();
        return i18n.__({ phrase, locale: this.lang }).toString();
    }
    setBirthdayChannel(birthdayChannel) {
        this.birthday.channel = birthdayChannel;
        this.db
            .update({ ['birthday.channel']: birthdayChannel })
            .catch(() => this.db.set({ ['birthday.channel']: birthdayChannel }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'set_birthdaychannel',
            from: 'mts',
            data: {
                log: 'BIRTHDAY_CHANNEL',
                channel: birthdayChannel,
                guild: this.guild.id
            }
        }));
    }
    setBirthdayMessage(birthdayMessage) {
        this.birthday.message = birthdayMessage;
        this.db
            .update({ ['birthday.message']: birthdayMessage })
            .catch(() => this.db.set({ ['birthday.message']: birthdayMessage }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'set_birthdaymessage',
            from: 'mts',
            data: {
                log: 'BIRTHDAY_MESSAGE',
                message: birthdayMessage,
                guild: this.guild.id
            }
        }));
    }
    removeBirthdayChannel() {
        if (!this.birthday.channel)
            return;
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'remove_birthday',
            from: 'mts',
            data: {
                log: 'BIRTHDAY_CHANNEL',
                channel: this.birthday.channel,
                guild: this.guild.id
            }
        }));
        delete this.birthday.channel;
        this.updateChannelsLogsInDB();
    }
    removeBirthdayMessage() {
        if (!this.birthday.message)
            return;
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'remove_birthday',
            from: 'mts',
            data: {
                log: 'BIRTHDAY_MESSAGE',
                message: this.birthday.message,
                guild: this.guild.id
            }
        }));
        delete this.birthday.message;
        this.updateChannelsLogsInDB();
    }
    startEmojiAnalisis() {
        if (this._emojiAnalisisEnabled)
            return;
        else
            this._emojiAnalisisEnabled = true;
        this.db
            .update({ emoji_analisis_enabled: true })
            .catch(() => this.db.set({ emoji_analisis_enabled: true }));
        this.emojiTimeout = setInterval(() => {
            this.db
                .update({
                emoji_statistics: this.emojiStatistics
            })
                .catch(() => this.db.set({ emoji_statistics: this.emojiStatistics }));
        }, 600000);
        this.guild.client.on('messageCreate', msg => {
            if (!msg.guild || !msg.content)
                return;
            const emojis = msg.content.match(/<a?:[a-z_]+:\d{18}>/gi);
            if (!emojis)
                return;
            const ids = emojis?.map(e => e.replace(/<a?:[a-z_]+:(?<id>\d{18})>/i, '$<id>'));
            for (const id of ids) {
                const emoji = msg.guild.emojis.cache.get(id);
                if (emoji)
                    this.emojiStatistics[id] = this.emojiStatistics[id]
                        ? this.emojiStatistics[id] + 1
                        : 1;
            }
        });
    }
    stopEmojiAnalisis() {
        this._emojiAnalisisEnabled = false;
        this.db
            .update({ emoji_analisis_enabled: false })
            .catch(() => this.db.set({ emoji_analisis_enabled: false }));
        if (this.emojiTimeout)
            clearInterval(this.emojiTimeout);
        this.guild.client.removeListener('messageCreate', this.emojiAnalisis);
    }
    emojiAnalisis(msg) {
        if (!msg.guild)
            return;
        if (!msg.content)
            return;
        const emojis = msg.content.match(/<a?:[a-z_]+:\d{18}>/gi);
        if (!emojis)
            return;
        const ids = emojis?.map(e => e.replace(/<a?:[a-z_]+:(?<id>\d{18})>/i, '$<id>'));
        for (const id of ids) {
            const emoji = msg.guild.emojis.cache.get(id);
            if (emoji)
                this.emojiStatistics[id] = this.emojiStatistics[id]
                    ? this.emojiStatistics[id] + 1
                    : 1;
        }
    }
    newAutorol(name) {
        this.autoroles.set(name, new Set());
        return this.db
            .update({ ['autoroles.' + name]: [] })
            .catch(() => this.db.set({ ['autoroles.' + name]: [] }));
    }
    addAutorol(name, id) {
        if (!this.autoroles.has(name))
            return;
        this.autoroles.get(name)?.add(id);
        return this.db
            .update({
            ['autoroles.' + name]: Array.from(this.autoroles.get(name).values())
        })
            .catch(() => this.db.set({
            ['autoroles.' + name]: Array.from(this.autoroles.get(name).values())
        }));
    }
    removeAutorolRol(name, id) {
        if (!this.autoroles.has(name))
            return;
        this.autoroles.get(name)?.delete(id);
        return this.db
            .update({
            ['autoroles.' + name]: Array.from(this.autoroles.get(name).values())
        })
            .catch(() => this.db.set({
            ['autoroles.' + name]: Array.from(this.autoroles.get(name).values())
        }));
    }
    removeAutorol(name) {
        if (!this.autoroles.has(name))
            return;
        this.autoroles.delete(name);
        return this.db
            .update({ ['autoroles.' + name]: FieldValue.delete() })
            .catch(() => this.db.set({ ['autoroles.' + name]: FieldValue.delete() }));
    }
    setInviteChannel(inviteChannel) {
        this.logsChannels.invite = inviteChannel;
        this.db
            .update({ ['logs_channels.invite']: inviteChannel })
            .catch(() => this.db.set({ ['logs_channels.invite']: inviteChannel }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'set_log',
            from: 'mts',
            data: {
                log: 'INVITE',
                channel: inviteChannel,
                guild: this.guild.id
            }
        }));
    }
    setMemberUpdateChannel(memberUpdateChannel) {
        this.logsChannels.memberUpdate = memberUpdateChannel;
        this.db
            .update({ ['logs_channels.member_update']: memberUpdateChannel })
            .catch(() => this.db.set({
            ['logs_channels.member_update']: memberUpdateChannel
        }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'set_log',
            from: 'mts',
            data: {
                log: 'GUILD_MEMBER_UPDATE',
                channel: memberUpdateChannel
            }
        }));
    }
    removeMemberUpdateLog() {
        if (!this.logsChannels.memberUpdate)
            return;
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'remove_log',
            from: 'mts',
            data: {
                log: 'GUILD_MEMBER_UPDATE',
                channel: this.logsChannels.memberUpdate,
                guild: this.guild.id
            }
        }));
        delete this.logsChannels.memberUpdate;
        this.updateChannelsLogsInDB();
    }
    removeInviteChannelLog() {
        if (!this.logsChannels.invite)
            return;
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'remove_log',
            from: 'mts',
            data: {
                log: 'INVITE',
                message: this.logsChannels.invite,
                guild: this.guild.id
            }
        }));
        delete this.logsChannels.invite;
        this.updateChannelsLogsInDB();
    }
    setKeepRoles(keepRoles) {
        this.keepRoles = keepRoles;
        this.db
            .update({ ['keep_roles']: keepRoles })
            .catch(() => this.db.set({ ['keep_roles']: keepRoles }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'keep_roles',
            from: 'mts',
            data: keepRoles
        }));
    }
    addBlacklistedWord(word) {
        this.blacklistedWords.push(word);
        this.db
            .update({ ['blacklisted_words']: FieldValue.arrayUnion(word) })
            .catch(() => this.db.set({ ['blacklisted_words']: this.blacklistedWords }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'add_blacklisted_word',
            from: 'mts',
            data: this.blacklistedWords
        }));
    }
    removeBlacklistedWord(word) {
        this.blacklistedWords = this.blacklistedWords.filter(dbWord => dbWord !== word);
        this.db
            .update({ ['blacklisted_words']: FieldValue.arrayRemove(word) })
            .catch(() => this.db.set({ ['blacklisted_words']: this.blacklistedWords }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'remove_blacklisted_word',
            from: 'mts',
            data: this.blacklistedWords
        }));
    }
    addDisabledChannel(channelID) {
        this.disabledChannels.push(channelID);
        this.db
            .update({ ['disabled_channels']: FieldValue.arrayUnion(channelID) })
            .catch(() => this.db.set({ ['disabled_channels']: this.disabledChannels }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'add_disabled_channel',
            from: 'mts',
            data: this.disabledChannels
        }));
    }
    removeDisabledChannel(channelID) {
        this.disabledChannels = this.disabledChannels.filter(dbChannel => dbChannel !== channelID);
        this.db
            .update({
            ['disabled_channels']: FieldValue.arrayRemove(channelID)
        })
            .catch(() => this.db.set({ ['disabled_channels']: this.disabledChannels }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'remove_disabled_channel',
            from: 'mts',
            data: this.disabledChannels
        }));
    }
    setSanctionChannel(channelID) {
        this.logsChannels.sanction = channelID;
        this.db
            .update({ ['logs_channels.sanction']: channelID })
            .catch(() => this.db.set({ ['logs_channels.sanction']: channelID }));
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'set_sanction_channel',
            from: 'mts',
            data: channelID
        }));
    }
    removeSanctionChannel() {
        if (!this.logsChannels.sanction)
            return;
        this.guild.client.websocket?.send(JSON.stringify({
            event: 'remove_log',
            from: 'mts',
            data: {
                log: 'SANCTION',
                message: this.logsChannels.sanction,
                guild: this.guild.id
            }
        }));
        delete this.logsChannels.sanction;
        this.updateChannelsLogsInDB();
    }
    punishUser({ userId, type, reason, duration = 'permanent', moderatorId }) {
        return new Promise((resolve, reject) => {
            if (type === PunishmentType.WARN)
                this.warnUser(userId, reason, moderatorId)
                    .then(() => resolve(null))
                    .catch(error => reject(error));
            if (type === PunishmentType.MUTE)
                this.muteUser(userId, reason, duration, moderatorId)
                    .then(() => resolve(null))
                    .catch(error => reject(error));
            if (type === PunishmentType.KICK)
                this.kickUser(userId, reason, moderatorId)
                    .then(() => resolve(null))
                    .catch(error => reject(error));
            if (type === PunishmentType.BAN)
                this.banUser(userId, reason, duration, moderatorId)
                    .then(() => resolve(null))
                    .catch(error => reject(error));
            if (type === PunishmentType.HACKBAN)
                this.hackbanUser(userId, reason, duration, moderatorId)
                    .then(() => resolve(null))
                    .catch(error => reject(error));
        });
    }
    async warnUser(userId, reason, moderatorId) {
        const user = await this.guild.members.fetch(userId);
        const moderator = await this.guild.members.fetch(moderatorId);
        if (moderator.roles.highest.comparePositionTo(user.roles.highest) <= 0)
            return Promise.reject('user_higher_role');
        this.db
            .collection('users')
            .doc(userId)
            .update({
            sanctions: FieldValue.arrayUnion({
                type: 'WARN',
                reason,
                moderator: moderatorId,
                date: new Date().getTime()
            })
        })
            .catch(() => {
            this.db
                .collection('users')
                .doc(userId)
                .set({
                sanctions: [
                    {
                        type: 'WARN',
                        reason,
                        moderator: moderatorId,
                        date: new Date().getTime()
                    }
                ]
            });
        });
        return Promise.resolve();
    }
    async muteUser(userId, reason, duration, moderatorId) {
        const user = await this.guild.members.fetch(userId);
        const moderator = await this.guild.members.fetch(moderatorId);
        if (moderator.roles.highest.comparePositionTo(user.roles.highest) <= 0)
            return Promise.reject('user_higher_role');
        const durationToMs = ms(duration);
        user.timeout(durationToMs, reason);
        this.db
            .collection('users')
            .doc(userId)
            .update({
            sanctions: FieldValue.arrayUnion({
                type: 'MUTE',
                reason,
                moderator: moderatorId,
                date: new Date().getTime()
            })
        })
            .catch(() => {
            this.db
                .collection('users')
                .doc(userId)
                .set({
                sanctions: [
                    {
                        type: 'MUTE',
                        reason,
                        moderator: moderatorId,
                        date: new Date().getTime()
                    }
                ]
            });
        });
        return Promise.resolve();
    }
    async kickUser(userId, reason, moderatorId) {
        const user = await this.guild.members.fetch(userId);
        const moderator = await this.guild.members.fetch(moderatorId);
        if (moderator.roles.highest.comparePositionTo(user.roles.highest) <= 0)
            return Promise.reject('user_higher_role');
        user.kick(reason);
        this.db
            .collection('users')
            .doc(userId)
            .update({
            sanctions: FieldValue.arrayUnion({
                type: 'KICK',
                reason,
                moderator: moderatorId,
                date: new Date().getTime()
            })
        })
            .catch(() => {
            this.db
                .collection('users')
                .doc(userId)
                .set({
                sanctions: [
                    {
                        type: 'KICK',
                        reason,
                        moderator: moderatorId,
                        date: new Date().getTime()
                    }
                ]
            });
        });
        return Promise.resolve();
    }
    async banUser(userId, reason, duration, moderatorId) {
        const user = await this.guild.members.fetch(userId);
        const moderator = await this.guild.members.fetch(moderatorId);
        if (moderator.roles.highest.comparePositionTo(user.roles.highest) <= 0)
            return Promise.reject('user_higher_role');
        this.db
            .collection('users')
            .doc(userId)
            .update({
            sanctions: FieldValue.arrayUnion({
                type: 'BAN',
                reason,
                moderator: moderatorId,
                date: new Date().getTime()
            })
        })
            .catch(() => {
            this.db
                .collection('users')
                .doc(userId)
                .set({
                sanctions: [
                    {
                        type: 'BAN',
                        reason,
                        moderator: moderatorId,
                        date: new Date().getTime()
                    }
                ]
            });
        });
        if (duration === 'permanent') {
            user.ban({ reason });
            return Promise.resolve();
        }
        user.ban({ reason }).then(() => {
            if (ms(duration) < 86400000) {
                setTimeout(() => {
                    this.guild.members.unban(userId);
                }, ms(duration));
            }
        });
        return Promise.resolve();
    }
    async hackbanUser(userId, reason, duration, moderatorId) {
        const user = await this.guild.members.fetch(userId);
        const moderator = await this.guild.members.fetch(moderatorId);
        if (moderator.roles.highest.comparePositionTo(user.roles.highest) <= 0)
            return Promise.reject('user_higher_role');
        this.db
            .collection('users')
            .doc(userId)
            .update({
            sanctions: FieldValue.arrayUnion({
                type: 'BAN',
                reason,
                moderator: moderatorId,
                date: new Date().getTime()
            })
        })
            .catch(() => {
            this.db
                .collection('users')
                .doc(userId)
                .set({
                sanctions: [
                    {
                        type: 'BAN',
                        reason,
                        moderator: moderatorId,
                        date: new Date().getTime()
                    }
                ]
            });
        });
        if (duration === 'permanent') {
            user.ban({ reason });
            return Promise.resolve();
        }
        user.ban({ reason }).then(() => {
            if (ms(duration) < 86400000) {
                setTimeout(() => {
                    this.guild.members.unban(userId);
                }, ms(duration));
            }
        });
        return Promise.resolve();
    }
    sendSuggestion(interaction) {
        let sug, channel, author;
        if (interaction instanceof ChatInputCommandInteraction) {
            channel = (interaction.options.getChannel('channel') ??
                client.channels.cache.get(this.suggestChannels[0]?.channel));
            sug = interaction.options.getString('suggestion');
            author = interaction.user;
        }
        else {
            author = interaction.author;
            channel = interaction.channel;
            sug = interaction.content;
        }
        this.lastSuggestId += 1;
        const embed = new EmbedBuilder()
            .setAuthor({
            name: author.username,
            iconURL: author.displayAvatarURL()
        })
            .setTitle(this.translate('suggest_cmd.title', { id: this?.lastSuggestId }))
            .setColor(16313844)
            .setDescription(sug)
            .setFooter(client.embedFooter)
            .setTimestamp();
        channel
            .send({
            embeds: [embed]
        })
            .then(msg => {
            msg.react('<:yes:885693508533489694>');
            msg.react('<:no:885693492632879104>');
            msg.startThread({
                name: this.translate('suggest_cmd.sent', {
                    id: this?.lastSuggestId
                })
            });
            this?.db
                ?.collection('suggests')
                .doc(`suggest_${this.lastSuggestId}`)
                .set({
                author: author.id,
                channel: msg.channel.id,
                suggest: sug
            });
        });
    }
    async createCommands(commands) {
        for (const command of commands) {
            fetch(`https://discord.com/api/v10/guilds/${this.guild.id}/commands`, {
                method: 'POST',
                headers: {
                    Authorization: `Bot ${client.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(command)
            }).catch(console.error);
            await sleep();
        }
        return Promise.resolve();
    }
}
