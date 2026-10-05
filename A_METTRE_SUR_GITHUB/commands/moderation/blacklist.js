const { PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database');
const { createEmbed, errorEmbed, successEmbed } = require('../../utils/embeds');
const config = require('../../config.json');

module.exports = {
  name: 'bl',
  description: 'Gère la liste noire (Blacklist) du bot et du serveur',
  aliases: ['blacklist'],
  async execute(message, args, client) {
    // Vérifier les permissions modérateur
    const isOwner = message.author.id === process.env.OWNER_ID;
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers) && !isOwner) {
      return message.reply({
        embeds: [errorEmbed('Accès Refusé', 'Vous devez avoir la permission `Bannir des membres` pour gérer la blacklist.')]
      });
    }

    const subCommand = args[0] ? args[0].toLowerCase() : null;

    if (!subCommand || !['add', 'remove', 'del', 'list'].includes(subCommand)) {
      return message.reply({
        embeds: [
          createEmbed({
            title: '📖 Utilisation de la commande Blacklist',
            description: [
              `> La Blacklist bloque totalement un utilisateur de l'utilisation du bot et le bannit du serveur.`,
              ``,
              `**Ajouter un membre :** \`=bl add <@user/ID> [raison]\``,
              `**Retirer un membre :** \`=bl remove <@user/ID>\``,
              `**Consulter la liste :** \`=bl list\``
            ].join('\n'),
            color: config.colors.primary
          })
        ]
      });
    }

    // LIST
    if (subCommand === 'list') {
      const blData = db.getBlacklist();
      const entries = Object.entries(blData);

      if (entries.length === 0) {
        return message.reply({
          embeds: [successEmbed('Blacklist Vierge', 'Aucun utilisateur n\'est actuellement enregistré sur la Blacklist.')]
        });
      }

      const listFields = entries.slice(0, 25).map(([id, info]) => {
        return {
          name: `👤 ID : ${id}`,
          value: `> **Raison :** ${info.reason}\n> **Par :** <@${info.by}>`
        };
      });

      return message.reply({
        embeds: [
          createEmbed({
            title: `🛡️ Liste Noire (${entries.length} membre${entries.length > 1 ? 's' : ''})`,
            description: `Les personnes listées ci-dessous n'ont aucun accès aux fonctionnalités.`,
            fields: listFields,
            color: config.colors.danger
          })
        ]
      });
    }

    // ADD / REMOVE
    const targetArg = args[1];
    if (!targetArg) {
      return message.reply({
        embeds: [errorEmbed('Argument Manquant', 'Vous devez mentionner un utilisateur ou fournir son ID.')]
      });
    }

    const cleanId = targetArg.replace(/[<@!>]/g, '');

    // ADD
    if (subCommand === 'add') {
      if (cleanId === message.author.id) {
        return message.reply({
          embeds: [errorEmbed('Action Impossible', 'Vous ne pouvez pas vous mettre vous-même en blacklist.')]
        });
      }

      const reason = args.slice(2).join(' ') || 'Blacklist de sécurité';
      db.addBlacklist(cleanId, reason, message.author.id);

      // Si le membre est présent sur le serveur, on le bannit également
      const memberToBan = message.guild.members.cache.get(cleanId);
      if (memberToBan && memberToBan.bannable) {
        await memberToBan.ban({ reason: `[Blacklist] ${reason}` }).catch(() => {});
      }

      return message.reply({
        embeds: [
          successEmbed(
            'Utilisateur Ajouté à la Blacklist ⛔',
            `<@${cleanId}> (\`${cleanId}\`) a été blacklisté définitivement.\n**Raison :** ${reason}`
          )
        ]
      });
    }

    // REMOVE
    if (subCommand === 'remove' || subCommand === 'del') {
      const removed = db.removeBlacklist(cleanId);
      if (removed) {
        // Tente de débannir si banni
        await message.guild.bans.remove(cleanId, 'Retrait de la Blacklist').catch(() => {});

        return message.reply({
          embeds: [
            successEmbed(
              'Utilisateur Retiré de la Blacklist ✅',
              `<@${cleanId}> (\`${cleanId}\`) a été retiré de la liste noire avec succès.`
            )
          ]
        });
      } else {
        return message.reply({
          embeds: [errorEmbed('Introuvable', `L'utilisateur \`${cleanId}\` n'était pas sur la Blacklist.`)]
        });
      }
    }
  }
};
