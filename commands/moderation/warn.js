const { PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, warningEmbed } = require('../../utils/embeds');
const db = require('../../utils/database');

module.exports = {
  name: 'warn',
  description: 'Avertit un membre pour non-respect des règles',
  aliases: ['avertir'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply({ embeds: [errorEmbed('Permission Refusée', 'Vous devez avoir la permission de gérer les messages pour avertir un membre.')] });
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply({ embeds: [errorEmbed('Membre introuvable', 'Veuillez mentionner un membre ou donner son identifiant.')] });
    }

    if (target.id === message.author.id) {
      return message.reply({ embeds: [errorEmbed('Action Impossible', 'Vous ne pouvez pas vous avertir vous-même !')] });
    }

    const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';
    const totalWarns = db.addWarn(message.guild.id, target.id, reason, message.author.tag);

    // Envoi MP à l'utilisateur
    target.send({
      embeds: [warningEmbed('Avertissement Reçu', `Vous avez reçu un avertissement sur le serveur **${message.guild.name}**.\n\n**Raison :** ${reason}\n**Modérateur :** ${message.author.tag}\n**Total d'avertissements :** ${totalWarns}`)]
    }).catch(() => {});

    return message.reply({
      embeds: [successEmbed('Membre Averti', `**${target.user.tag}** a reçu un avertissement.\n**Raison :** ${reason}\n**Total d'avertissements :** ${totalWarns}`)]
    });
  }
};
