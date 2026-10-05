const { PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'greroll',
  description: 'Tire un nouveau gagnant pour un concours déjà terminé',
  aliases: ['reroll'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Vous devez avoir la permission de gérer les messages.')]
      });
    }

    const messageId = args[0];
    if (!messageId) {
      return message.reply({
        embeds: [errorEmbed('Argument Manquant', 'Usage : `=greroll <ID_du_message_du_giveaway>`')]
      });
    }

    const gw = db.getGiveaway(messageId);
    if (!gw) {
      return message.reply({
        embeds: [errorEmbed('Introuvable', 'Aucun giveaway trouvé avec cet identifiant.')]
      });
    }

    if (!gw.ended) {
      return message.reply({
        embeds: [errorEmbed('En Cours', 'Ce concours n\'est pas encore terminé ! Utilisez `=gend` pour le terminer d\'abord.')]
      });
    }

    const participants = gw.participants || [];
    if (participants.length === 0) {
      return message.reply({
        embeds: [errorEmbed('Aucun Participant', 'Il n\'y avait aucun participant enregistré à ce concours.')]
      });
    }

    const randomWinner = participants[Math.floor(Math.random() * participants.length)];

    return message.channel.send({
      content: `🎉 Nouveau tirage au sort pour **${gw.prize}** !\n👑 Le nouveau vainqueur est : <@${randomWinner}> ! Félicitations ! 🎁`
    });
  }
};
