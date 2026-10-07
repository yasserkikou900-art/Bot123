const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'renew',
  description: 'Renouvelle le salon',
  aliases: ['refresh'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Vous n\'avez pas la permission de gérer les salons.')]
      });
    }

    const channel = message.channel;

    try {
      const oldName = channel.name;
      const oldTopic = channel.topic;
      const oldType = channel.type;
      const oldPosition = channel.position;
      const oldParent = channel.parentId;
      const oldNsfw = channel.nsfw;
      const oldRateLimit = channel.rateLimitPerUser;
      const oldPermissions = Array.from(channel.permissionOverwrites.cache.entries());

      const newChannel = await message.guild.channels.create({
        name: oldName,
        type: oldType,
        topic: oldTopic,
        nsfw: oldNsfw,
        rateLimitPerUser: oldRateLimit,
        parent: oldParent,
        position: oldPosition
      });

      for (const [id, overwrite] of oldPermissions) {
        await newChannel.permissionOverwrites.create(id, {
          allow: overwrite.allow,
          deny: overwrite.deny
        });
      }

      await channel.delete('Renouvellement du salon demandé par un modérateur');

      const sent = await newChannel.send({
        embeds: [
          successEmbed(
            'Salon Renouvelé ✨',
            `Le salon **#${newChannel.name}** a été renouvelé.`
          )
        ]
      });

      setTimeout(() => sent.delete().catch(() => {}), 10000);
    } catch (err) {
      console.error('Erreur renew:', err);
      return message.reply({
        embeds: [errorEmbed('Erreur', 'Impossible de renouveler ce salon.')]
      });
    }
  }
};