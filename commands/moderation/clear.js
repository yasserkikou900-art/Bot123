const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'clear',
  description: 'Supprime un nombre défini de messages dans le salon',
  aliases: ['purge', 'clean'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Vous n\'avez pas la permission de gérer les messages.')]
      });
    }

    const amount = parseInt(args[0], 10);

    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply({
        embeds: [errorEmbed('Nombre Invalide', 'Veuillez préciser un nombre de messages à supprimer entre **1** et **100**.\n*Exemple :* `=clear 20`')]
      });
    }

    try {
      // Supprimer le message de commande d'abord
      await message.delete().catch(() => {});

      const deleted = await message.channel.bulkDelete(amount, true);

      const confirmMsg = await message.channel.send({
        embeds: [
          successEmbed(
            'Nettoyage Réussi 🧹',
            `**${deleted.size}** message${deleted.size > 1 ? 's ont été supprimés' : ' a été supprimé'} avec succès.`
          )
        ]
      });

      // Auto suppression du message de confirmation après 4s
      setTimeout(() => {
        confirmMsg.delete().catch(() => {});
      }, 4000);
    } catch (err) {
      console.error('Erreur clear:', err);
      return message.channel.send({
        embeds: [errorEmbed('Erreur', 'Impossible de supprimer les messages (les messages de plus de 14 jours ne peuvent pas être supprimés en masse par Discord).')]
      });
    }
  }
};
