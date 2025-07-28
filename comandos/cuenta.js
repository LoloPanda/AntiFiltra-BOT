import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export default {
  data: new SlashCommandBuilder()
    .setName('cuenta')
    .setDescription('Administrar tu cuenta'),

  async execute(interaction) {
    // Al ejecutar /cuenta, enviamos un panel con botones para crear cuenta o cambiar contraseña
    const botones = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('crear_cuenta')
          .setLabel('🆕 Crear cuenta')
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId('cambiar_contraseña')
          .setLabel('🔑 Cambiar contraseña')
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({
      content: '🔐 Panel de administración de cuenta:\n\nSelecciona una opción:',
      components: [botones],
      ephemeral: true,
    });
  },

  // Este módulo no maneja modales ni botones, eso va en index.js o en un handler.
};
