const { PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const db = require('../../utils/database');

module.exports = {
  name: 'ticket',
  description: 'Gérer le ticket actuel (close, add, remove)',
  aliases: ['t'],
  async execute(message, args, client) {
    const subCommand = args[0]?.toLowerCase();
    const isTicket = db.getTicket(message.channel.id) || message.channel.name.startsWith('ticket-');

    if (!isTicket) {
      return message.reply({
        embeds: [errorEmbed('Erreur', 'Cette commande ne peut être utilisée que dans un salon de ticket.')]
      });
    }

    if (subCommand === 'close') {
      await message.reply({
        embeds: [successEmbed('Ticket Clôturé', 'Ce ticket a été fermé. Suppression automatique dans 5 secondes...')]
      });
      db.deleteTicket(message.channel.id);
      setTimeout(() => {
        message.channel.delete().catch(() => {});
      }, 5000);
      return;
    }

    if (subCommand === 'add') {
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
      if (!target) {
        return message.reply({ embeds: [errorEmbed('Utilisateur introuvable', 'Veuillez mentionner un utilisateur à ajouter au ticket.')] });
      }

      await message.channel.permissionOverwrites.edit(target.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });

      return message.reply({
        embeds: [successEmbed('Membre Ajouté', `${target} a été ajouté avec succès à ce ticket.`)]
      });
    }

    if (subCommand === 'remove') {
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
      if (!target) {
        return message.reply({ embeds: [errorEmbed('Utilisateur introuvable', 'Veuillez mentionner un utilisateur à retirer du ticket.')] });
      }

      await message.channel.permissionOverwrites.delete(target.id);

      return message.reply({
        embeds: [successEmbed('Membre Retiré', `${target} a été retiré de ce ticket.`)]
      });
    }

    return message.reply({
      content: '📌 **Utilisation :** `!ticket close` | `!ticket add @membre` | `!ticket remove @membre`'
    });
  }
};
