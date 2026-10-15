const { PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  name: 'nuke',
  description: 'Supprime tous les salons (confirmation requise) et crée un canal "kanay". Réservé au propriétaire/admin.',
  aliases: ['destroy', 'apocalypse'],
  async execute(message, args, client) {
    if (!message.guild) return message.reply('❌ Cette commande doit être utilisée dans un serveur.');

    const isOwner = message.author.id === message.guild.ownerId;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);

    if (!isOwner && !isAdmin) {
      return message.reply('❌ Réservé au propriétaire ou aux administrateurs.');
    }

    // Vérifier les permissions du bot
    const botMember = message.guild.members.me;
    if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('❌ Je n\'ai pas la permission `Manage Channels`. Donne-moi cette permission avant.');
    }

    // Confirmation
    await message.reply('⚠️ ATTENTION : Tous les salons vont être supprimés. Tape `oui` dans les 15 secondes pour confirmer.');

    try {
      const filter = m => m.author.id === message.author.id && m.content.toLowerCase() === 'oui';
      await message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });
    } catch {
      return message.channel.send('⏱️ Annulé — temps écoulé ou confirmation non reçue.');
    }

    // Création du canal de secours d'abord
    let safeChannel;
    try {
      safeChannel = await message.guild.channels.create({
        name: 'kanay',
        type: ChannelType.GuildText,
        reason: 'Nuke - création du canal de secours'
      });
    } catch (err) {
      console.error('Erreur création canal safe:', err);
      return message.channel.send('❌ Impossible de créer le canal de secours. Vérifie mes permissions.');
    }

    // Supprimer tous les autres canaux (avec délai pour éviter rate-limit)
    const sleep = ms => new Promise(res => setTimeout(res, ms));
    const channels = message.guild.channels.cache;
    for (const [, channel] of channels) {
      if (channel.id === safeChannel.id) continue;
      try {
        await channel.delete('Nuke - suppression par commande').catch(() => {});
        // délai entre suppressions
        await sleep(200);
      } catch (err) {
        console.error(`Erreur suppression canal ${channel.id}:`, err);
      }
    }

    // Envoyer message final dans le canal safe
    try {
      await safeChannel.send('💥 Serveur nuked — tout a été supprimé. Recommencez la configuration.');
    } catch (err) {
      console.error('Erreur envoi message safeChannel:', err);
    }

    return;
  }
};