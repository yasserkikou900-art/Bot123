const { PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'unlock',
  description: 'Déverrouille un salon textuel pour permettre aux membres d\'écrire à nouveau',
  aliases: ['deverrouiller'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply({ embeds: [errorEmbed('Permission Refusée', 'Vous devez avoir la permission de gérer les salons.')] });
    }

    const channel = message.mentions.channels.first() || message.channel;

    try {
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: null
      });

      return message.reply({
        embeds: [successEmbed('Salon Déverrouillé 🔓', `Le salon ${channel} est de nouveau accessible en écriture.`)]
      });
    } catch (err) {
      console.error(err);
      return message.reply({ embeds: [errorEmbed('Erreur', 'Impossible de modifier les permissions du salon.')] });
    }
  }
};
