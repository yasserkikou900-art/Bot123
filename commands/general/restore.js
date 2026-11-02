const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json');

const OWNER_ID = '754703887738470482';
const backupDir = path.join(__dirname, '../../backups');

module.exports = {
  name: 'restore',
  description: 'Restaure une backup sauvegardée',
  aliases: ['rst'],
  async execute(message, args, client) {
    if (message.author.id !== OWNER_ID) {
      return message.reply({
        content: '❌ Seul le propriétaire peut utiliser cette commande.'
      });
    }

    if (!args[0]) {
      // Lister les backups disponibles
      const files = fs.readdirSync(backupDir);
      if (files.length === 0) {
        return message.reply({
          content: '❌ Aucune backup trouvée.'
        });
      }

      const list = files.map((f, i) => `${i + 1}. \`${f}\``).join('\n');
      return message.reply({
        content: `📋 **Backups disponibles:**\n${list}\n\nUtilise: \`=restore <numéro ou nom>\``
      });
    }

    try {
      const statusMsg = await message.reply({
        content: '⏳ Restauration en cours...'
      });

      let backupFile;
      const files = fs.readdirSync(backupDir);

      if (/^\d+$/.test(args[0])) {
        // Si c'est un numéro
        backupFile = files[Number(args[0]) - 1];
      } else {
        // Si c'est un nom
        backupFile = files.find(f => f.includes(args[0]));
      }

      if (!backupFile) {
        return statusMsg.edit({
          content: '❌ Backup non trouvée.'
        });
      }

      const backupPath = path.join(backupDir, backupFile);
      const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

      const guild = message.guild;

      // 1. Restaurer les rôles
      const roleMap = {};
      for (const roleData of backup.roles) {
        const role = await guild.roles.create({
          name: roleData.name,
          color: roleData.color,
          hoist: roleData.hoist,
          permissions: roleData.permissions,
          mentionable: roleData.mentionable,
          reason: 'Restauration de backup'
        });
        roleMap[roleData.name] = role;
      }

      // 2. Restaurer les salons
      for (const channelData of backup.channels) {
        try {
          const channelType = channelData.type === 'GUILD_VOICE' ? ChannelType.GuildVoice : ChannelType.GuildText;

          const newChannel = await guild.channels.create({
            name: channelData.name,
            type: channelType,
            topic: channelData.topic,
            nsfw: channelData.nsfw,
            position: channelData.position,
            reason: 'Restauration de backup'
          });

          // Restaurer les permissions
          for (const po of channelData.permissionOverwrites) {
            try {
              await newChannel.permissionOverwrites.create(po.id, {
                allow: BigInt(po.allow),
                deny: BigInt(po.deny)
              });
            } catch (err) {}
          }
        } catch (err) {}
      }

      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('✅ Restore Complète')
        .setDescription(`Backup restaurée avec succès !`)
        .addFields(
          { name: 'Serveur', value: guild.name, inline: true },
          { name: 'Salons créés', value: `${backup.channels.length}`, inline: true },
          { name: 'Rôles créés', value: `${backup.roles.length}`, inline: true }
        )
        .setTimestamp();

      await statusMsg.edit({
        content: null,
        embeds: [embed]
      });

      console.log(`✅ Backup restaurée: ${backupFile}`);

    } catch (err) {
      console.error('Erreur restore:', err);
      return message.reply({
        content: '❌ Erreur lors de la restauration.'
      });
    }
  }
};