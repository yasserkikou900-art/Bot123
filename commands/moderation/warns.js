const { PermissionFlagsBits } = require('discord.js');
const { createEmbed, errorEmbed } = require('../../utils/embeds');
const db = require('../../utils/database');
const config = require('../../config.json');

module.exports = {
  name: 'warns',
  description: 'Affiche la liste des avertissements d\'un utilisateur',
  aliases: ['warnings'],
  async execute(message, args, client) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
    const warnsList = db.getWarns(message.guild.id, target.id);

    if (!warnsList || warnsList.length === 0) {
      return message.reply({
        embeds: [createEmbed({
          title: `🛡️ Avertissements de ${target.user.tag}`,
          description: `Cet utilisateur ne possède **aucun avertissement** enregistré.`,
          color: config.colors.success
        })]
      });
    }

    const fields = warnsList.map((w, index) => ({
      name: `Avertissement #${index + 1}`,
      value: `**Raison :** ${w.reason}\n**Par :** ${w.by}\n**Date :** <t:${Math.floor(new Date(w.date).getTime() / 1000)}:R>`,
      inline: false
    }));

    const embed = createEmbed({
      title: `⚠️ Avertissements de ${target.user.tag} (${warnsList.length})`,
      description: `Historique complet des sanctions pour ce membre :`,
      fields: fields,
      color: config.colors.warning
    });

    return message.reply({ embeds: [embed] });
  }
};
