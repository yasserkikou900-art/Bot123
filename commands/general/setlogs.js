const { PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const db = require('../../utils/database');

module.exports = {
  name: 'setlogs',
  description: 'Définit le salon de logs pour le serveur',
  aliases: ['logs-channel', 'configlogs'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply({ embeds: [errorEmbed('Permission Refusée', 'Seuls les administrateurs peuvent configurer le salon des logs.')] });
    }

    if (args[0] && args[0].toLowerCase() === 'off') {
      db.setLogsChannel(message.guild.id, null);
      return message.reply({ embeds: [successEmbed('Logs Désactivés', 'Le système de logs a été désactivé pour ce serveur.')] });
    }

    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;

    if (!channel || !channel.isTextBased()) {
      return message.reply({ embeds: [errorEmbed('Salon Invalide', 'Veuillez mentionner un salon textuel valide.')] });
    }

    db.setLogsChannel(message.guild.id, channel.id);

    return message.reply({
      embeds: [successEmbed('Salon de Logs Configuré', `Tous les événements et logs du serveur seront désormais envoyés dans ${channel}.`)]
    });
  }
};
