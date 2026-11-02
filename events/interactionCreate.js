const db = require('../utils/database');
const { giveawayEmbed, successEmbed, errorEmbed, createEmbed } = require('../utils/embeds');
const config = require('../config.json');
const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // --- GESTION DES BOUTONS ---
    if (interaction.isButton()) {
      const customId = interaction.customId;

      // 1. Bouton Giveaway
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

        try {
          const updatedEmbed = giveawayEmbed({
            prize: gw.prize,
            winnersCount: gw.winnersCount,
            endsAt: gw.endsAt,
            host: `<@${gw.hostId}>`,
            participantsCount: result.count
          });

          await interaction.message.edit({ embeds: [updatedEmbed] });
        } catch (err) {
          console.error('Erreur mise à jour giveaway:', err);
        }

        if (result.joined) {
          return interaction.reply({
            embeds: [successEmbed('Participation Confirmée ! 🎉', `Bonne chance **${interaction.user.username}** ! Votre participation pour **${gw.prize}** a été enregistrée.`)],
            ephemeral: true
          });
        } else {
          return interaction.reply({
            embeds: [createEmbed({
              title: 'Participation Retirée',
              description: `> Vous ne participez plus au concours pour **${gw.prize}**.`,
              color: config.colors.warning
            })],
            ephemeral: true
          });
        }
      }

      // 2. Bouton Création de Ticket
      if (customId === 'ticket_create') {
        const existingTicket = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username.toLowerCase()}`);
        if (existingTicket) {
          return interaction.reply({
            content: `❌ Vous avez déjà un ticket ouvert dans ${existingTicket} !`,
            ephemeral: true
          });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
          const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: interaction.guild.roles.everyone,
                deny: [PermissionFlagsBits.ViewChannel]
              },
              {
                id: interaction.user.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory,
                  PermissionFlagsBits.AttachFiles
                ]
              },
              {
                id: client.user.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ManageChannels
                ]
              }
            ]
          });

          db.saveTicket(ticketChannel.id, {
            userId: interaction.user.id,
            guildId: interaction.guild.id,
            createdAt: Date.now()
          });

          const welcomeEmbed = createEmbed({
            title: `🎫 Ticket Ouvert - ${interaction.user.username}`,
            description: [
              `Bonjour ${interaction.user}, bienvenue dans votre salon d'assistance !`,
              `L'équipe du staff a été notifiée et va prendre en charge votre demande.`,
              '',
              `Pour fermer ce salon, utilisez le bouton **Fermer** ci-dessous.`
            ].join('\n'),
            color: config.colors.primary
          });

          const buttonsRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('ticket_close')
              .setLabel('Fermer le Ticket')
              .setStyle(ButtonStyle.Danger)
              .setEmoji('🔒'),
            new ButtonBuilder()
              .setCustomId('ticket_delete')
              .setLabel('Supprimer')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('🗑️')
          );

          await ticketChannel.send({
            content: `${interaction.user} | Staff`,
            embeds: [welcomeEmbed],
            components: [buttonsRow]
          });

          return interaction.editReply({
            content: `✅ Votre ticket a été créé avec succès : ${ticketChannel}`
          });
        } catch (err) {
          console.error('Erreur création ticket:', err);
          return interaction.editReply({
            content: '❌ Une erreur est survenue lors de la création du salon de ticket.'
          });
        }
      }

      // 3. Bouton Fermeture de Ticket
      if (customId === 'ticket_close') {
        const ticketInfo = db.getTicket(interaction.channel.id);
        if (ticketInfo && ticketInfo.userId) {
          await interaction.channel.permissionOverwrites.edit(ticketInfo.userId, {
            SendMessages: false
          }).catch(() => {});
        }

        await interaction.reply({
          embeds: [createEmbed({
            title: '🔒 Ticket Verrouillé',
            description: `Ce ticket a été fermé par ${interaction.user}. Vous pouvez maintenant le supprimer avec le bouton ci-dessous.`,
            color: config.colors.warning
          })]
        });
      }

      // 4. Bouton Suppression de Ticket
      if (customId === 'ticket_delete') {
        await interaction.reply({
          embeds: [createEmbed({
            title: '🗑️ Suppression en cours...',
            description: 'Ce salon sera supprimé définitivement dans 5 secondes.',
            color: config.colors.danger
          })]
        });
        db.deleteTicket(interaction.channel.id);
        setTimeout(() => {
          interaction.channel.delete().catch(() => {});
        }, 5000);
      }
    }

    // --- GESTION DU MENU DÉROULANT HELP ---
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'help_category_select') {
        const selected = interaction.values[0];
        const prefix = process.env.PREFIX || config.prefix || '=';

        let categoryEmbed;

        switch (selected) {
          case 'mod':
            categoryEmbed = createEmbed({
              title: `${config.emojis.shield} Modération & Sanctions`,
              description: 'Commandes de modération et de gestion des membres :',
              color: config.colors.danger,
              fields: [
                { name: `\`${prefix}ban <@user/ID> [raison]\``, value: 'Bannit définitivement un utilisateur.' },
                { name: `\`${prefix}unban <ID>\``, value: 'Débannit un utilisateur avec son identifiant.' },
                { name: `\`${prefix}kick <@user/ID> [raison]\``, value: 'Expulse un membre du serveur.' },
                { name: `\`${prefix}mute <@user> <temps> [raison]\``, value: 'Timeout Discord (ex: 10m, 2h, 1d).' },
                { name: `\`${prefix}unmute <@user>\``, value: 'Retire le timeout d\'un membre.' },
                { name: `\`${prefix}warn <@user> [raison]\``, value: 'Attribue un avertissement.' },
                { name: `\`${prefix}warns [@user]\``, value: 'Affiche la liste des avertissements.' },
                { name: `\`${prefix}clearwarns <@user>\``, value: 'Efface tous les avertissements.' },
                { name: `\`${prefix}lock [#salon]\``, value: 'Verrouille un salon textuel pour @everyone.' },
                { name: `\`${prefix}unlock [#salon]\``, value: 'Déverrouille un salon textuel.' },
                { name: `\`${prefix}clear <1-100>\``, value: 'Supprime un nombre précis de messages.' }
              ]
            });
            break;

          case 'tickets':
            categoryEmbed = createEmbed({
              title: '🎫 Système de Tickets',
              description: 'Outils de gestion d\'assistance et tickets privés :',
              color: config.colors.primary,
              fields: [
                { name: `\`${prefix}ticket-setup\``, value: 'Poste le panneau avec bouton pour que les membres ouvrent un ticket.' },
                { name: `\`${prefix}ticket close\``, value: 'Ferme et supprime le ticket actuel.' },
                { name: `\`${prefix}ticket add <@user>\``, value: 'Ajoute un utilisateur au ticket actuel.' },
                { name: `\`${prefix}ticket remove <@user>\``, value: 'Retire un utilisateur du ticket actuel.' }
              ]
            });
            break;

          case 'logs':
            categoryEmbed = createEmbed({
              title: '📜 Système de Logs Automatique',
              description: 'Surveillance et traçabilité en direct du serveur :',
              color: config.colors.info,
              fields: [
                { name: `\`${prefix}setlogs <#salon>\``, value: 'Configure le salon où seront envoyés tous les logs.' },
                { name: `\`${prefix}setlogs off\``, value: 'Désactive le système de logs.' },
                { name: 'Événements surveillés', value: '• Messages supprimés et modifiés\n• Arrivée et départ de membres\n• Création et suppression de salons\n• Création et suppression de rôles' }
              ]
            });
            break;

          case 'voice':
            categoryEmbed = createEmbed({
              title: '🎙️ Salons Vocaux VIP',
              description: 'Commandes vocales avancées :',
              color: config.colors.voice,
              fields: [
                { name: `\`${prefix}pv\``, value: 'Rend votre salon vocal actuel privé ou public.' },
                { name: `\`${prefix}mv <@user/ID>\``, value: 'Téléporte instantanément un membre dans votre salon vocal.' },
                { name: `\`${prefix}dog <@user/ID>\``, value: 'Mode chien de garde : la cible vous suit dans tous vos salons.' }
              ]
            });
            break;

          case 'giveaway':
            categoryEmbed = createEmbed({
              title: '🎉 Giveaways & Concours',
              description: 'Organisation de concours interactifs :',
              color: config.colors.giveaway,
              fields: [
                { name: `\`${prefix}gcreate <durée> <gagnants> <lot>\``, value: 'Crée un giveaway avec bouton interactif.' },
                { name: `\`${prefix}gend <ID_message>\``, value: 'Termine immédiatement un concours en cours.' },
                { name: `\`${prefix}greroll <ID_message>\``, value: 'Tire un nouveau gagnant.' }
              ]
            });
            break;

          default:
            categoryEmbed = createEmbed({
              title: '⚡ Panneau de Contrôle Principal',
              description: `Utilisez le menu déroulant ci-dessous pour afficher les détails de chaque module.`,
              color: config.colors.primary
            });
            break;
        }

        return interaction.update({
          embeds: [categoryEmbed]
        });
      }
    }
  }
};
