const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'database.json');

const defaultData = {
  blacklist: {},
  antilink: {},
  dogFollows: {},
  giveaways: {},
  warns: {},
  logs: {},
  tickets: {}
};

class Database {
  constructor() {
    this.data = { ...defaultData };
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_PATH)) {
      try {
        const fileContent = fs.readFileSync(DB_PATH, 'utf8');
        this.data = { ...defaultData, ...JSON.parse(fileContent) };
      } catch (err) {
        console.error('Erreur lecture DB, réinitialisation partielle:', err);
        this.save();
      }
    } else {
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Erreur écriture DB:', err);
    }
  }

  // --- Blacklist ---
  isBlacklisted(userId) {
    return Boolean(this.data.blacklist && this.data.blacklist[userId]);
  }

  addBlacklist(userId, reason = 'Aucune raison spécifiée', by = 'Système') {
    if (!this.data.blacklist) this.data.blacklist = {};
    this.data.blacklist[userId] = {
      reason,
      by,
      date: new Date().toISOString()
    };
    this.save();
  }

  removeBlacklist(userId) {
    if (this.data.blacklist && this.data.blacklist[userId]) {
      delete this.data.blacklist[userId];
      this.save();
      return true;
    }
    return false;
  }

  getBlacklist() {
    return this.data.blacklist || {};
  }

  // --- Anti-Link ---
  isAntiLinkEnabled(guildId) {
    if (!this.data.antilink) this.data.antilink = {};
    if (this.data.antilink[guildId] === undefined) return true;
    return Boolean(this.data.antilink[guildId]);
  }

  setAntiLink(guildId, enabled) {
    if (!this.data.antilink) this.data.antilink = {};
    this.data.antilink[guildId] = Boolean(enabled);
    this.save();
  }

  // --- Dog Follow Mode ---
  setDog(callerId, targetId) {
    if (!this.data.dogFollows) this.data.dogFollows = {};
    this.data.dogFollows[callerId] = targetId;
    this.save();
  }

  removeDog(callerId) {
    if (this.data.dogFollows && this.data.dogFollows[callerId]) {
      delete this.data.dogFollows[callerId];
      this.save();
      return true;
    }
    return false;
  }

  getDog(callerId) {
    return (this.data.dogFollows && this.data.dogFollows[callerId]) || null;
  }

  getAllDogs() {
    return this.data.dogFollows || {};
  }

  // --- Giveaways ---
  saveGiveaway(messageId, giveawayData) {
    if (!this.data.giveaways) this.data.giveaways = {};
    this.data.giveaways[messageId] = giveawayData;
    this.save();
  }

  getGiveaway(messageId) {
    return (this.data.giveaways && this.data.giveaways[messageId]) || null;
  }

  getActiveGiveaways() {
    const active = [];
    if (!this.data.giveaways) return active;
    for (const [id, gw] of Object.entries(this.data.giveaways)) {
      if (!gw.ended) {
        active.push({ messageId: id, ...gw });
      }
    }
    return active;
  }

  addParticipant(messageId, userId) {
    const gw = this.getGiveaway(messageId);
    if (!gw) return { success: false, reason: 'NOT_FOUND' };
    if (gw.ended) return { success: false, reason: 'ENDED' };
    if (!gw.participants) gw.participants = [];
    
    const index = gw.participants.indexOf(userId);
    if (index > -1) {
      gw.participants.splice(index, 1);
      this.save();
      return { success: true, joined: false, count: gw.participants.length };
    } else {
      gw.participants.push(userId);
      this.save();
      return { success: true, joined: true, count: gw.participants.length };
    }
  }

  endGiveaway(messageId) {
    if (this.data.giveaways && this.data.giveaways[messageId]) {
      this.data.giveaways[messageId].ended = true;
      this.save();
    }
  }

  // --- Warns ---
  addWarn(guildId, userId, reason, moderator) {
    if (!this.data.warns) this.data.warns = {};
    if (!this.data.warns[guildId]) this.data.warns[guildId] = {};
    if (!this.data.warns[guildId][userId]) this.data.warns[guildId][userId] = [];
    this.data.warns[guildId][userId].push({
      reason,
      by: moderator,
      date: new Date().toISOString()
    });
    this.save();
    return this.data.warns[guildId][userId].length;
  }

  getWarns(guildId, userId) {
    if (!this.data.warns || !this.data.warns[guildId]) return [];
    return this.data.warns[guildId][userId] || [];
  }

  clearWarns(guildId, userId) {
    if (this.data.warns && this.data.warns[guildId] && this.data.warns[guildId][userId]) {
      delete this.data.warns[guildId][userId];
      this.save();
      return true;
    }
    return false;
  }

  // --- Logs ---
  setLogsChannel(guildId, channelId) {
    if (!this.data.logs) this.data.logs = {};
    this.data.logs[guildId] = channelId;
    this.save();
  }

  getLogsChannel(guildId) {
    if (!this.data.logs) return null;
    return this.data.logs[guildId] || null;
  }

  // --- Tickets ---
  saveTicket(channelId, ticketData) {
    if (!this.data.tickets) this.data.tickets = {};
    this.data.tickets[channelId] = ticketData;
    this.save();
  }

  getTicket(channelId) {
    if (!this.data.tickets) return null;
    return this.data.tickets[channelId] || null;
  }

  deleteTicket(channelId) {
    if (this.data.tickets && this.data.tickets[channelId]) {
      delete this.data.tickets[channelId];
      this.save();
    }
  }
}

module.exports = new Database();
