const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PREFIX = '=';

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(PREFIX)) return;

  const command = message.content.slice(PREFIX.length).trim().split(/\s+/)[0].toLowerCase();
  if (command !== 'nuke') return;

  const guild = message.guild;

  if (message.author.id !== guild.ownerId) {
    return message.reply('❌ Réservé au propriétaire du serveur.');
  }

  await message.reply('⚠️ Tous les salons vont être supprimés. Tape `oui` dans les 15 secondes pour confirmer.');

  try {
    const collected = await message.channel.awaitMessages({
      filter: (m) => m.author.id === message.author.id && m.content.toLowerCase() === 'oui',
      max: 1,
      time: 15_000,
      errors: ['time'],
    });
  } catch {
    return message.channel.send('⏱️ Annulé, temps écoulé.');
  }

  // On crée le nouveau salon d'abord
  const general = await guild.channels.create({
    name: 'kanay',
    type: ChannelType.GuildText,
  });

  const channels = await guild.channels.fetch();
  for (const [, channel] of channels) {
    if (channel.id === general.id) continue;
    await channel.delete('Nuke').catch(console.error);
  }

  await general.send('💥 Serveur nuke ! Tout est à refaire à zéro.');
});

client.login('TON_TOKEN');