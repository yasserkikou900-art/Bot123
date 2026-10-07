const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'serverinfo',
  description: 'Affiche les informations du serveur',
  aliases: ['info', 'guild'],
  async execute(message, args, client) {
    const guild = message.guild;
    const owner = await guild.fetchOwner();
    const bans = await guild.bans.fetch().catch(() => null);
    const invites = await guild.invites.fetch().catch(() => null);

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`📊 Informations du serveur : ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '👑 Propriétaire', value: `${owner.user.tag} (\`${owner.id}\`)`, inline: true },
        { name: '🆔 ID du serveur', value: `\`${guild.id}\``, inline: true },
        { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
        { name: '👥 Membres', value: `${guild.memberCount} membres`, inline: true },
        { name: '🚀 Boost', value: `${guild.premiumSubscriptionCount} boost (Level ${guild.premiumTier})`, inline: true },
        { name: '📢 Salons', value: `${guild.channels.cache.size} salons`, inline: true },
        { name: '🎭 Rôles', value: `${guild.roles.cache.size} rôles`, inline: true },
        { name: '🔨 Bans', value: `${bans ? bans.size : '?'} utilisateurs bannis`, inline: true },
        { name: '🔗 Invitations', value: `${invites ? invites.size : '?'} invitations actives`, inline: true }
      )
      .setFooter({
        text: `${config.emojis.shield} Commande exécutée par ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};