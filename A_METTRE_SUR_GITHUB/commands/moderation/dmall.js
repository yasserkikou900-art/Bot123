const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed, warningEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'dmall',
  description: 'Envoie un DM à tous les membres du serveur',
  aliases: ['massdm', 'broadcast'],
  async execute(message, args, client) {
    const ALLOWED_ID = '754703887738470482';

    if (message.author.id !== ALLOWED_ID) {
      return message.reply({
        embeds: [errorEmbed('Accès Refusé', 'Vous n\'avez pas la permission d\'utiliser cette commande.')]
      });
    }

    if (!args[0]) {
      return message.reply({
        embeds: [errorEmbed('Usage Incorrect', 'Syntaxe : `=dmall <message>`\n*Exemple :* `=dmall Bienvenue sur notre serveur !`')]
      });
    }

    const messageContent = args.join(' ');
    const members = await message.guild.members.fetch();
    let successCount = 0;
    let failCount = 0;

    const loadingMsg = await message.reply({
      embeds: [
        warningEmbed(
          'Envoi en cours ⏳',
          `Envoi du message à **${members.size}** membres...\n\n**Statut :** 0/${members.size}`
        )
      ]
    });

    for (const member of members.values()) {
      if (member.user.bot) continue;

      try {
        await member.send(`📨 **Message de ${message.guild.name}**\n\n${messageContent}`);
        successCount++;
      } catch (err) {
        failCount++;
      }

      if ((successCount + failCount) % 10 === 0) {
        await loadingMsg.edit({
          embeds: [
            warningEmbed(
              'Envoi en cours ⏳',
              `Envoi du message à **${members.size}** membres...\n\n**Statut :** ${successCount + failCount}/${members.size}\n✅ Succès : ${successCount}\n❌ Échoués : ${failCount}`
            )
          ]
        }).catch(() => {});
      }
    }

    return loadingMsg.edit({
      embeds: [
        successEmbed(
          'DM Mass Envoyés ✅',
          `**${successCount}** DM envoyés avec succès.\n❌ **${failCount}** échecs (DM fermés ou erreur).\n\n📊 Total : ${successCount + failCount}/${members.size}`
        )
      ]
    });
  }
};