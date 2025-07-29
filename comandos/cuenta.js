import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } from 'discord.js';
import { db } from '../firebase.js';
import { collection, addDoc, getDoc, doc, updateDoc } from 'firebase/firestore';

export default {
  data: new SlashCommandBuilder()
    .setName('cuenta')
    .setDescription('Gestiona tu cuenta del sistema GTG.'),
  async execute(interaction) {
    const crearBtn = new ButtonBuilder()
      .setCustomId('crear_cuenta')
      .setLabel('Crear cuenta')
      .setStyle(ButtonStyle.Success);
    const cambiarBtn = new ButtonBuilder()
      .setCustomId('cambiar_pass')
      .setLabel('Cambiar contraseña')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(crearBtn, cambiarBtn);
    await interaction.reply({ content: 'Elige una opción:', components: [row], ephemeral: true });
  }
};

// Interacciones con botones y modals en index.js
