const db = require('../utils/database');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    const member = newState.member;
    if (!member || member.user.bot) return;

    const guild = newState.guild;

    // CAS 1 : Le "Maître" change de salon vocal -> la cible (le dog) doit le suivre immédiatement !
    const dogTargetId = db.getDog(member.id);
    if (dogTargetId && newState.channelId && oldState.channelId !== newState.channelId) {
      try {
        const targetMember = await guild.members.fetch(dogTargetId).catch(() => null);
        if (targetMember && targetMember.voice.channelId && targetMember.voice.channelId !== newState.channelId) {
          // Téléporte la cible dans le même salon vocal que le maître
          await targetMember.voice.setChannel(newState.channelId).catch(err => {
            console.error(`Impossible de déplacer le follower ${targetMember.user.tag}:`, err.message);
          });
        }
      } catch (err) {
        console.error('Erreur dog mode (maître déplacé):', err);
      }
    }

    // CAS 2 : La cible essaie de s'enfuir dans un autre salon vocal alors que le maître est en vocal !
    const allDogs = db.getAllDogs();
    for (const [masterId, targetId] of Object.entries(allDogs)) {
      if (member.id === targetId && newState.channelId && oldState.channelId !== newState.channelId) {
        try {
          const masterMember = await guild.members.fetch(masterId).catch(() => null);
          if (masterMember && masterMember.voice.channelId && masterMember.voice.channelId !== newState.channelId) {
            // Ramène de force la cible dans le salon du maître
            await member.voice.setChannel(masterMember.voice.channelId).catch(err => {
              console.error(`Impossible de ramener le follower ${member.user.tag}:`, err.message);
            });
          }
        } catch (err) {
          console.error('Erreur dog mode (cible enfuie):', err);
        }
      }
    }
  }
};
