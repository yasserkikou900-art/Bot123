const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

const OWNER_ID = '754703887738470482';

module.exports = {
  name: 'whitelistlist',
  description: 'Affiche tous les IDs whitelistés',
  aliases: ['wllist', 'listwhitelist'],
  async execute(message, args, client) {
    if (message.author.id !== OWNER_ID) {
      return message.reply({
        content: '❌ Seul le propriétaire du bot peut utiliser cette commande.'
      });
    }

    const whitelist = Array.isArray(config.whitelist) ? config.whitelist : [];

    if (whitelist.length === 0) {
      return message.reply({
        content: '❌ Aucun ID dans la whitelist.'
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📋 Liste Whitelist du Bot')
      .setDescription(whitelist.map((id, i) => `${i + 1}. \`${id}\``).join('\n'))
      .setFooter({ text: `Total : ${whitelist.length} ID(s)` })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};