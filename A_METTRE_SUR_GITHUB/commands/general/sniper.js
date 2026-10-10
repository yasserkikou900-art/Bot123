const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('Cherche des usernames Discord disponibles (lentement)')
    .addIntegerOption(opt =>
      opt.setName('length')
        .setDescription('Longueur du username (3, 4, 5...)')
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(6)
    )
    .addStringOption(opt =>
      opt.setName('charset')
        .setDescription('Type de caractères')
        .addChoices(
          { name: 'Lettres seulement (a-z)', value: 'letters' },
          { name: 'Lettres + chiffres (a-z0-9)', value: 'alphanum' },
          { name: 'Lettres + chiffres + _', value: 'full' }
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    const length = interaction.options.getInteger('length');
    const charsetType = interaction.options.getString('charset') || 'letters';

    // On limite volontairement pour pas exploser
    if (length >= 5 && charsetType !== 'letters') {
      return interaction.reply({
        content: 'Trop de combinaisons. Pour length 5+ utilise seulement `letters`.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    // Définition des caractères
    let chars = '';
    if (charsetType === 'letters') chars = 'abcdefghijklmnopqrstuvwxyz';
    else if (charsetType === 'alphanum') chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    else chars = 'abcdefghijklmnopqrstuvwxyz0123456789_';

    const total = Math.pow(chars.length, length);
    console.log(`Total combinaisons : ${total}`);

    // On génère les combinaisons
    function* generateCombinations(len) {
      const max = Math.pow(chars.length, len);
      for (let i = 0; i < max; i++) {
        let num = i;
        let str = '';
        for (let j = 0; j < len; j++) {
          str = chars[num % chars.length] + str;
          num = Math.floor(num / chars.length);
        }
        yield str;
      }
    }

    const found = [];
    let checked = 0;
    const delay = 1800; // 1.8 seconde entre chaque requête (très safe)

    await interaction.editReply({
      content: `Lancement du snipe...\nLongueur : **\( {length}**\nCharset : ** \){charsetType}**\nTotal : **\( {total}** combinaisons\nDélai : ** \){delay}ms** entre chaque check`
    });

    for (const username of generateCombinations(length)) {
      try {
        const res = await axios.get('https://discord.com/api/v9/unique-username/username-attempt-unauthed', {
          params: { username },
          headers: { 'User-Agent': 'Mozilla/5.0' },
          validateStatus: () => true,
          timeout: 5000
        });

        checked++;

        if (res.status === 200 && res.data?.taken === false) {
          found.push(username);
          console.log(`[FOUND] ${username}`);

          // On envoie une notif dès qu'on en trouve un
          await interaction.followUp({
            content: `🎯 **Trouvé :** \`${username}\``,
            ephemeral: true
          });
        }

        // Progress toutes les 25 checks
        if (checked % 25 === 0) {
          await interaction.editReply({
            content: `Progression : **\( {checked}/ \){total}**\nTrouvés : **\( {found.length}**\nDernier check : \` \){username}\``
          });
        }

        // Délai anti rate-limit
        await new Promise(r => setTimeout(r, delay));

      } catch (err) {
        console.log(`Erreur sur ${username}, on attend un peu...`);
        await new Promise(r => setTimeout(r, 5000)); // pause plus longue en cas d'erreur
      }
    }

    // Fin
    const embed = new EmbedBuilder()
      .setTitle('Snipe terminé')
      .setColor(found.length > 0 ? 0x57F287 : 0xED4245)
      .setDescription(found.length > 0 
        ? `**\( {found.length} username(s) disponible(s) :**\n\`\`\`\n \){found.join('\n')}\n\`\`\``
        : 'Aucun username disponible trouvé.')
      .addFields(
        { name: 'Combinaisons checkées', value: `${checked}`, inline: true },
        { name: 'Longueur', value: `${length}`, inline: true }
      );

    await interaction.editReply({ content: null, embeds: [embed] });
  }
};