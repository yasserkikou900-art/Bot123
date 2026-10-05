const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'database.json');

// Structure par défaut de la base de données
const defaultData = {
  blacklist: {},    // { [userId]: { reason, by, date } }
  antilink: {},     // { [guildId]: boolean }
  dogFollows: {},   // { [callerId]: targetId } - Caller is followed by target
  giveaways: {},    // { [messageId]: { prize, winnersCount, endsAt, channelId, guildId, hostId, participants: [], ended: false } }
  warns: {}         // { [guildId]: { [userId]: [ { reason, by, date } ] } }
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
    return Boolean(this.data.blacklist[userId]);
  }

  addBlacklist(userId, reason = 'Aucune raison spécifiée', by = 'Système') {
    this.data.blacklist[userId] = {
      reason,
      by,
      date: new Date().toISOString()
    };
    this.save();
  }

  removeBlacklist(userId) {
    if (this.data.blacklist[userId]) {
      delete this.data.blacklist[userId];
      this.save();
      return true;
    }
    return false;
  }

  getBlacklist() {
    return this.data.blacklist;
  }

  // --- Anti-Link ---
  isAntiLinkEnabled(guildId) {
    // Par défaut activé si non configuré ou true
    if (this.data.antilink[guildId] === undefined) return true;
    return Boolean(this.data.antilink[guildId]);
  }

  setAntiLink(guildId, enabled) {
    this.data.antilink[guildId] = Boolean(enabled);
    this.save();
  }

  // --- Dog Follow Mode (=dog) ---
  // callerId : La personne qui donne l'ordre (le maître). targetId : la personne qui le suit
  setDog(callerId, targetId) {
    this.data.dogFollows[callerId] = targetId;
    this.save();
  }

  removeDog(callerId) {
    if (this.data.dogFollows[callerId]) {
      delete this.data.dogFollows[callerId];
      this.save();
      return true;
    }
    return false;
  }

  getDog(callerId) {
    return this.data.dogFollows[callerId] || null;
  }

  getAllDogs() {
    return this.data.dogFollows;
  }

  // --- Giveaways ---
  saveGiveaway(messageId, giveawayData) {
    this.data.giveaways[messageId] = giveawayData;
    this.save();
  }

  getGiveaway(messageId) {
    return this.data.giveaways[messageId] || null;
  }

  getActiveGiveaways() {
    const active = [];
    for (const [id, gw] of Object.entries(this.data.giveaways)) {
      if (!gw.ended) {
        active.push({ messageId: id, ...gw });
      }
    }
    return active;
  }

  addParticipant(messageId, userId) {
    const gw = this.data.giveaways[messageId];
    if (!gw) return { success: false, reason: 'NOT_FOUND' };
    if (gw.ended) return { success: false, reason: 'ENDED' };
    if (!gw.participants) gw.participants = [];
    
    const index = gw.participants.indexOf(userId);
    if (index > -1) {
      // Toggle / retirer participation
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
    if (this.data.giveaways[messageId]) {
      this.data.giveaways[messageId].ended = true;
      this.save();
    }
  }
}

module.exports = new Database();
