const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'unlock',
  description: 'Déverrouille le salon',
  aliases: ['deverrouiller'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Vous n\'avez pas la permission de gérer les salons.')]
      });
    }

    try {
      const everyoneRole = message.guild.roles.everyone;

      await message.channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: null
      });

      return message.reply({
        embeds: [
          successEmbed(
            'Salon Déverrouillé 🔓',
            `Le salon **#${message.channel.name}** a été déverrouillé.`
          )
        ]
      });
    } catch (err) {
      console.error('Erreur unlock:', err);
      return message.reply({
        embeds: [errorEmbed('Erreur', 'Impossible de déverrouiller ce salon.')]
      });
    }
  }
};