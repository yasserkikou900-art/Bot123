const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'snipe',
  description: 'Cherche des usernames Discord disponibles',
  async execute(message, args) {

    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1558457244817817722/OEAqCe_oYLauV0DtwtDOK9qU26i2t4XA34sT7B4tMzf1hBlXDXxknTD3iJyMHOvJq3gm';

    const length = parseInt(args[0]);
    const charsetType = (args[1] || 'letters').toLowerCase();

    if (!length || length < 2 || length > 5) {
      return message.reply('Utilisation : `=snipe <longueur> [letters/alphanum/full]`\nExemple : `=snipe 3` ou `=snipe 4 letters`');
    }

    if (length >= 5 && charsetType !== 'letters') {
      return message.reply('Trop de combinaisons. Pour 5 caractères utilise seulement `letters`.');
    }

    let chars = '';
    if (charsetType === 'letters') chars = 'abcdefghijklmnopqrstuvwxyz';
    else if (charsetType === 'alphanum') chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    else if (charsetType === 'full') chars = 'abcdefghijklmnopqrstuvwxyz0123456789_';
    else {
      return message.reply('Charset invalide. Utilise : `letters`, `alphanum` ou `full`');
    }

    const total = Math.pow(chars.length, length);
    const delay = 2000;

    // Message simple et propre
    await message.reply(`Snipe lancé (${length} caractères - ${charsetType})`);

    function* generateCombinations(len) {
      const max = Math.pow(chars.length, len);
      for (let i = 0; i < max; i++) {
        let num = i;
        let str = '';
        for (let j = 0; j < len; j++) {
          str = chars[num % chars.length] + str;
          num = Math.floor(num / chars.length);
        }
        yield str;
      }
    }

    const found = [];
    let checked = 0;

    for (const username of generateCombinations(length)) {
      try {
        const res = await fetch(`https://discord.com/api/v9/unique-username/username-attempt-unauthed?username=${encodeURIComponent(username)}`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const data = await res.json().catch(() => null);
        checked++;

        if (res.status === 200 && data && data.taken === false) {
          found.push(username);
          console.log(`[FOUND] ${username}`);

          // Uniquement le webhook
          await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `🎯 **Username disponible**\n\`${username}\``
            })
          }).catch(() => {});
        }

        await new Promise(r => setTimeout(r, delay));

      } catch (err) {
        console.log(`Erreur sur ${username}`);
        await new Promise(r => setTimeout(r, 6000));
      }
    }

    // Message final simple
    if (found.length > 0) {
      await message.channel.send(`Snipe terminé. **${found.length}** username(s) trouvé(s).`);
    } else {
      await message.channel.send(`Snipe terminé. Aucun username trouvé.`);
    }
  }
};