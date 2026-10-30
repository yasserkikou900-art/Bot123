// create_channels.js
// Nécessite: npm install discord.js
// Lance avec: node create_channels.js

const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

// === CONFIG (variables d'env sur Railway) ===
const TOKEN = process.env.TOKEN;         // Variable Railway: TOKEN
const NB_SALONS = process.env.NB_SALONS ? parseInt(process.env.NB_SALONS) : 30;
const PREFIX_NOM = process.env.PREFIX_NOM || 'salon';
const IMAGE_URL = process.env.IMAGE_URL || 'https://cdn.discordapp.com/attachments/1565348315846021261/1565863619927871679/image0.jpg';
const COMMANDE = '=halloween';
const AUTHORIZED_USER_ID = '754703887738470482';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
  console.log(`Tape "${COMMANDE}" dans un salon du serveur pour lancer la création.`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content.trim() !== COMMANDE) return;
  if (message.author.id !== AUTHORIZED_USER_ID) return;

  const guild = message.guild;
  if (!guild) return;

  await message.reply(`Création de ${NB_SALONS} salons en cours...`);

  for (let i = 1; i <= NB_SALONS; i++) {
    try {
      const channel = await guild.channels.create({
        name: `${PREFIX_NOM}-${i}`,
        type: ChannelType.GuildText,
      });

      await channel.send(IMAGE_URL);

      console.log(`✅ Créé: ${channel.name}`);
    } catch (err) {
      console.error(`❌ Erreur sur salon ${i}:`, err.message);
    }

    // petite pause pour éviter le rate limit Discord
    await new Promise((r) => setTimeout(r, 500));
  }

  await message.channel.send('Terminé.');
  console.log('Terminé.');
});

client.login(TOKEN);
