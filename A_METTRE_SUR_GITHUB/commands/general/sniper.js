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
    const delay = 2000; // 2 secondes

    const statusMsg = await message.reply(`Snipe lancé...\nLongueur: **\( {length}**\nCharset: ** \){charsetType}**\nTotal: **\( {total}**\nDélai: ** \){delay}ms**`);

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

          // Envoie sur le webhook
          await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `🎯 **Username disponible trouvé !**\n\`${username}\`\nLongueur: ${length} | Charset: ${charsetType}`
            })
          }).catch(() => {});

          // Message aussi dans le salon
          await message.channel.send(`🎯 **Trouvé :** \`${username}\``).catch(() => {});
        }

        if (checked % 20 === 0) {
          await statusMsg.edit(`Progression: **\( {checked}/ \){total}**\nTrouvés: **\( {found.length}**\nDernier: \` \){username}\``).catch(() => {});
        }

        await new Promise(r => setTimeout(r, delay));

      } catch (err) {
        console.log(`Erreur sur ${username}, pause 6s...`);
        await new Promise(r => setTimeout(r, 6000));
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('Snipe terminé')
      .setColor(found.length > 0 ? 0x57F287 : 0xED4245)
      .setDescription(found.length > 0
        ? `**\( {found.length} username(s) trouvé(s) :**\n\`\`\`\n \){found.join('\n')}\n\`\`\``
        : 'Aucun username disponible trouvé.')
      .addFields(
        { name: 'Checkés', value: `${checked}`, inline: true },
        { name: 'Longueur', value: `${length}`, inline: true }
      );

    await statusMsg.edit({ content: null, embeds: [embed] }).catch(() => {});
  }
};