const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'slowmode',
  description: 'Active le mode lent (délai entre les messages)',
  aliases: ['slow'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Vous n\'avez pas la permission de gérer les salons.')]
      });
    }

    const seconds = parseInt(args[0], 10) || 0;

    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      return message.reply({
        embeds: [errorEmbed('Nombre Invalide', 'Veuillez préciser un nombre entre **0** (désactiver) et **21600** secondes (6h).\\n*Exemple :* `=slowmode 5`')]
      });
    }

    try {
      await message.channel.setRateLimitPerUser(seconds);

      const status = seconds === 0 ? 'désactivé' : `activé (${seconds}s)`;

      return message.reply({
        embeds: [
          successEmbed(
            'Mode Lent 🐌',
            `Le mode lent a été ${status} sur **#${message.channel.name}**.`
          )
        ]
      });
    } catch (err) {
      console.error('Erreur slowmode:', err);
      return message.reply({
        embeds: [errorEmbed('Erreur', 'Impossible de changer le mode lent.')]
      });
    }
  }
};