const { PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'lock',
  description: 'Verrouille un salon textuel pour empêcher les membres d\'écrire',
  aliases: ['verrouiller'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply({ embeds: [errorEmbed('Permission Refusée', 'Vous devez avoir la permission de gérer les salons.')] });
    }

    const channel = message.mentions.channels.first() || message.channel;

    try {
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false
      });

      return message.reply({
        embeds: [successEmbed('Salon Verrouillé 🔒', `Le salon ${channel} est désormais verrouillé pour @everyone.`)]
      });
    } catch (err) {
      console.error(err);
      return message.reply({ embeds: [errorEmbed('Erreur', 'Impossible de modifier les permissions du salon.')] });
    }
  }
};
