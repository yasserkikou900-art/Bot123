const db = require('../utils/database');
const { giveawayEmbed, successEmbed, errorEmbed, createEmbed } = require('../utils/embeds');
const config = require('../config.json');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Gestion des Boutons
    if (interaction.isButton()) {
      const customId = interaction.customId;

      // Bouton de participation Giveaway : giveaway_join_<messageId>
      if (customId.startsWith('giveaway_join_')) {
        const messageId = customId.replace('giveaway_join_', '');
        const gw = db.getGiveaway(messageId);

        if (!gw || gw.ended) {
          return interaction.reply({
            embeds: [errorEmbed('Giveaway Terminé', 'Ce concours est déjà terminé ou n\'existe plus !')],
            ephemeral: true
          });
        }

        const result = db.addParticipant(messageId, interaction.user.id);
        if (!result.success) {
          return interaction.reply({
            embeds: [errorEmbed('Erreur', 'Impossible d\'enregistrer votre participation.')],
            ephemeral: true
          });
        }

        // Mettre à jour l'embed avec le nouveau compteur
        try {
          const updatedEmbed = giveawayEmbed({
            prize: gw.prize,
            winnersCount: gw.winnersCount,
            endsAt: gw.endsAt,
            host: `<@${gw.hostId}>`,
            participantsCount: result.count
          });

          await interaction.message.edit({
            embeds: [updatedEmbed]
          });
        } catch (err) {
          console.error('Erreur mise à jour message giveaway:', err);
        }

        if (result.joined) {
          return interaction.reply({
            embeds: [
              successEmbed(
                'Participation Confirmée ! 🎉',
                `Bonne chance **${interaction.user.username}** ! Votre participation pour **${gw.prize}** a bien été validée.\n*(Recliquez sur le bouton si vous souhaitez vous retirer)*`
              )
            ],
            ephemeral: true
          });
        } else {
          return interaction.reply({
            embeds: [
              createEmbed({
                title: 'Participation Retirée',
                description: `> Vous ne participez plus au concours pour **${gw.prize}**.`,
                color: config.colors.warning
              })
            ],
            ephemeral: true
          });
        }
      }
    }

    // Gestion des Menus de Sélection (ex: Menu =help)
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'help_category_select') {
        const selected = interaction.values[0];
        const prefix = process.env.PREFIX || config.prefix;

        let categoryEmbed;

        switch (selected) {
          case 'mod':
            categoryEmbed = createEmbed({
              title: `${config.emojis.shield} Système de Modération`,
              description: `Voici la liste des commandes administratives et de sanction :`,
              color: config.colors.danger,
              fields: [
                { name: `\`${prefix}ban <@user/ID> [raison]\``, value: `Bannit définitivement un utilisateur du serveur.` },
                { name: `\`${prefix}kick <@user/ID> [raison]\``, value: `Expulse un membre du serveur.` },
                { name: `\`${prefix}mute <@user/ID> <temps> [raison]\``, value: `Exécute un tempmute (timeout Discord) : ex. \`${prefix}mute @user 10m Pub\`` },
                { name: `\`${prefix}unmute <@user/ID>\``, value: `Retire le timeout / mute d'un membre.` },
                { name: `\`${prefix}bl <add/remove/list> <@user/ID> [raison]\``, value: `Système de Blacklist complète du bot et du serveur.` },
                { name: `\`${prefix}clear <nombre (1-100)>\``, value: `Supprime rapidement un nombre de messages dans le salon.` }
              ]
            });
            break;

          case 'voice':
            categoryEmbed = createEmbed({
              title: `${config.emojis.voice} Salons Vocaux & Rôles VIP`,
              description: `Commandes avancées de gestion et d'interaction vocale :`,
              color: config.colors.voice,
              fields: [
                { name: `\`${prefix}pv\``, value: `Verrouille instantanément votre salon vocal actuel aux autres membres (privé). Tapez à nouveau pour déverrouiller.` },
                { name: `\`${prefix}mv <@user/ID>\``, value: `Téléporte et déplace immédiatement un utilisateur dans votre salon vocal.` },
                { name: `\`${prefix}dog <@user/ID>\``, value: `Active/Désactive le **mode Dog** ! La cible vous suit automatiquement à chaque changement de salon vocal !` }
              ]
            });
            break;

          case 'giveaway':
            categoryEmbed = createEmbed({
              title: `${config.emojis.giveaway} Système de Giveaways & Concours`,
              description: `Gérez des tirages au sort avec boutons interactifs et animations en temps réel :`,
              color: config.colors.giveaway,
              fields: [
                { name: `\`${prefix}gcreate <durée> <gagnants> <lot>\``, value: `Lance un concours stylé avec bouton 🎉.\n*Exemple :* \`${prefix}gcreate 30m 1 Nitro Boost\`` },
                { name: `\`${prefix}greroll <ID_Message>\``, value: `Retire un nouveau gagnant au sort pour un concours terminé.` },
                { name: `\`${prefix}gend <ID_Message>\``, value: `Termine immédiatement un concours en cours et tire les gagnants.` }
              ]
            });
            break;

          case 'security':
            categoryEmbed = createEmbed({
              title: `${config.emojis.link} Sécurité & Anti-Link Automatique`,
              description: `Protection anti-liens et surveillance en temps réel :`,
              color: config.colors.warning,
              fields: [
                { name: `\`${prefix}antilink <on/off/status>\``, value: `Active ou désactive la suppression automatique des liens d'invitation Discord et URL non autorisées.` },
                { name: `\`Permissions Bypass\``, value: `Les Administrateurs et Modérateurs autorisés ignorent les filtres de sécurité.` }
              ]
            });
            break;

          case 'general':
          default:
            categoryEmbed = createEmbed({
              title: `${config.emojis.sparkles} Informations Générales & Utilitaires`,
              description: `Commandes basiques et statut du système :`,
              color: config.colors.primary,
              fields: [
                { name: `\`${prefix}help\``, value: `Affiche le panneau d'aide interactif avec menu déroulant.` },
                { name: `\`${prefix}ping\``, value: `Affiche la latence de l'API Discord et du serveur.` }
              ]
            });
            break;
        }

        await interaction.update({
          embeds: [categoryEmbed]
        });
      }
    }
  }
};
