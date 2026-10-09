const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

const OWNER_ID = '754703887738470482';
const backupDir = path.join(__dirname, '../../backups');

// Créer le dossier backups s'il n'existe pas
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

module.exports = {
  name: 'backup',
  description: 'Sauvegarde la configuration du serveur',
  aliases: ['bk'],
  async execute(message, args, client) {
    if (message.author.id !== OWNER_ID) {
      return message.reply({
        content: '❌ Seul le propriétaire peut utiliser cette commande.'
      });
    }

    const guild = message.guild;

    try {
      const statusMsg = await message.reply({
        content: '⏳ Sauvegarde en cours...'
      });

      // Collecter les données
      const backup = {
        guildName: guild.name,
        guildIcon: guild.iconURL(),
        createdAt: new Date().toISOString(),
        channels: [],
        roles: [],
        members: []
      };

      // 1. Sauvegarder les salons
      for (const channel of guild.channels.cache.values()) {
        backup.channels.push({
          name: channel.name,
          type: channel.type,
          topic: channel.topic || null,
          nsfw: channel.nsfw,
          position: channel.position,
          permissionOverwrites: channel.permissionOverwrites.cache.map(po => ({
            id: po.id,
            type: po.type,
            allow: po.allow.bitfield,
            deny: po.deny.bitfield
          }))
        });
      }

      // 2. Sauvegarder les rôles (sauf @everyone)
      for (const role of guild.roles.cache.values()) {
        if (role.name !== '@everyone') {
          backup.roles.push({
            name: role.name,
            color: role.color,
            hoist: role.hoist,
            position: role.position,
            permissions: role.permissions.bitfield,
            mentionable: role.mentionable
          });
        }
      }

      // 3. Sauvegarder les membres (juste les infos basiques)
      for (const member of guild.members.cache.values()) {
        if (!member.user.bot) {
          backup.members.push({
            username: member.user.username,
            id: member.user.id,
            roles: member.roles.cache.map(r => r.name)
          });
        }
      }

      // Sauvegarder dans un fichier JSON
      const timestamp = Date.now();
      const filename = `backup_${guild.name}_${timestamp}.json`;
      const filepath = path.join(backupDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));

      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('✅ Backup Complète')
        .setDescription(`Backup sauvegardée avec succès !`)
        .addFields(
          { name: 'Serveur', value: guild.name, inline: true },
          { name: 'Salons', value: `${backup.channels.length}`, inline: true },
          { name: 'Rôles', value: `${backup.roles.length}`, inline: true },
          { name: 'Membres', value: `${backup.members.length}`, inline: true },
          { name: 'Fichier', value: `\`${filename}\``, inline: false }
        )
        .setTimestamp();

      await statusMsg.edit({
        content: null,
        embeds: [embed]
      });

      console.log(`✅ Backup sauvegardée: ${filename}`);

    } catch (err) {
      console.error('Erreur backup:', err);
      return message.reply({
        content: '❌ Erreur lors de la sauvegarde.'
      });
    }
  }
};