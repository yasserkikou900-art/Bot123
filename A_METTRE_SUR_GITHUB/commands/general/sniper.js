const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('Cherche des usernames Discord disponibles (lentement)')
    .addIntegerOption(opt =>
      opt.setName('length')
        .setDescription('Longueur du username (3 ou 4 recommandé)')
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(5)
    )
    .addStringOption(opt =>
      opt.setName('charset')
        .setDescription('Type de caractères')
        .addChoices(
          { name: 'Lettres seulement (a-z)', value: 'letters' },
          { name: 'Lettres + chiffres', value: 'alphanum' },
          { name: 'Lettres + chiffres + _', value: 'full' }
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    const length = interaction.options.getInteger('length');
    const charsetType = interaction.options.getString('charset') || 'letters';

    if (length >= 5 && charsetType !== 'letters') {
      return interaction.reply({
        content: 'Trop de combinaisons. Pour 5 caractères utilise seulement `letters`.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    let chars = '';
    if (charsetType === 'letters') chars = 'abcdefghijklmnopqrstuvwxyz';
    else if (charsetType === 'alphanum') chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    else chars = 'abcdefghijklmnopqrstuvwxyz0123456789_';

    const total = Math.pow(chars.length, length);

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
    const delay = 2000; // 2 secondes = très safe

    await interaction.editReply({
      content: `Snipe lancé...\nLongueur: **\( {length}**\nCharset: ** \){charsetType}**\nTotal: **\( {total}**\nDélai: ** \){delay}ms**`
    });

    for (const username of generateCombinations(length)) {
      try {
        const res = await fetch(`https://discord.com/api/v9/unique-username/username-attempt-unauthed?username=${encodeURIComponent(username)}`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const data = await res.json().catch(() => null);
        checked++;

        if (res.status === 200 && data && data.taken === false) {
          found.push(username);
          console.log(`[FOUND] ${username}`);

          await interaction.followUp({
            content: `🎯 **Trouvé :** \`${username}\``,
            ephemeral: true
          }).catch(() => {});
        }

        if (checked % 20 === 0) {
          await interaction.editReply({
            content: `Progression: **\( {checked}/ \){total}**\nTrouvés: **\( {found.length}**\nDernier: \` \){username}\``
          }).catch(() => {});
        }

        await new Promise(r => setTimeout(r, delay));

      } catch (err) {
        console.log(`Erreur sur ${username}, pause 6s...`);
        await new Promise(r => setTimeout(r, 6000));
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('Snipe terminé')
      .setColor(found.length > 0 ? 0x57F287 : 0xED4245)
      .setDescription(found.length > 0
        ? `**\( {found.length} username(s) trouvé(s) :**\n\`\`\`\n \){found.join('\n')}\n\`\`\``
        : 'Aucun username disponible trouvé.')
      .addFields(
        { name: 'Checkés', value: `${checked}`, inline: true },
        { name: 'Longueur', value: `${length}`, inline: true }
      );

    await interaction.editReply({ content: null, embeds: [embed] }).catch(() => {});
  }
};