const { PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database');
const { createEmbed, errorEmbed, successEmbed } = require('../../utils/embeds');
const config = require('../../config.json');

module.exports = {
  name: 'antilink',
  description: 'Active, désactive ou consulte l\'état de la protection Anti-Lien',
  aliases: ['anti-link', 'protectlink'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Vous devez avoir la permission `Gérer le serveur` pour configurer l\'anti-link.')]
      });
    }

    const sub = args[0] ? args[0].toLowerCase() : null;
    const currentState = db.isAntiLinkEnabled(message.guild.id);

    if (!sub || sub === 'status') {
      return message.reply({
        embeds: [
          createEmbed({
            title: '🔗 Statut de la Protection Anti-Lien',
            description: [
              `> L'Anti-Lien supprime automatiquement les messages contenant des invitations Discord (\`discord.gg/...\`) ou des liens non autorisés.`,
              ``,
              `**État actuel :** ${currentState ? '🟢 **ACTIVÉ**' : '🔴 **DÉSACTIVÉ**'}`,
              ``,
              `**Commandes disponibles :**`,
              `\`=antilink on\` : Activer la protection`,
              `\`=antilink off\` : Désactiver la protection`
            ].join('\n'),
            color: currentState ? config.colors.success : config.colors.danger
          })
        ]
      });
    }

    if (sub === 'on' || sub === 'enable' || sub === '1') {
      db.setAntiLink(message.guild.id, true);
      return message.reply({
        embeds: [
          successEmbed(
            'Anti-Lien Activé 🛡️',
            'La protection Anti-Lien est maintenant **activée**. Les invitations Discord et liens publicitaires seront immédiatement supprimés.'
          )
        ]
      });
    }

    if (sub === 'off' || sub === 'disable' || sub === '0') {
      db.setAntiLink(message.guild.id, false);
      return message.reply({
        embeds: [
          createEmbed({
            title: 'Anti-Lien Désactivé ⚠️',
            description: '> La protection Anti-Lien est désormais **désactivée**. Les membres peuvent poster des liens.',
            color: config.colors.warning
          })
        ]
      });
    }

    return message.reply({
      embeds: [errorEmbed('Paramètre Inconnu', 'Utilisez `=antilink on`, `=antilink off` ou `=antilink status`.')]
    });
  }
};
