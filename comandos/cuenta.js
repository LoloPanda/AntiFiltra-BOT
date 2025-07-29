import { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('cuenta')
    .setDescription('Gestiona tu cuenta de la Web'),

  async execute(interaction) {
    const crear = new ButtonBuilder()
      .setCustomId('crear_cuenta')
      .setLabel('🆕 Crear cuenta')
      .setStyle(ButtonStyle.Success);

    const cambiar = new ButtonBuilder()
      .setCustomId('cambiar_contraseña')
      .setLabel('🔑 Cambiar contraseña')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(crear, cambiar);

    await interaction.reply({
      content: '🧾 Elige una opción:',
      components: [row],
      ephemeral: true,
    });
  }
};
