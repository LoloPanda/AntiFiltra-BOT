import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('cuenta')
    .setDescription('🔐 Abrir panel para crear o cambiar cuenta'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🛠️ Panel de Cuenta')
      .setDescription(
        'Selecciona una opción para administrar tu cuenta:\n\n' +
        '🆕 **Crear Cuenta:** Crea una nueva cuenta con usuario y contraseña.\n' +
        '🔑 **Cambiar Contraseña:** Cambia la contraseña de tu cuenta actual.'
      )
      .setColor('#0099ff')
      .setThumbnail('https://live.staticflickr.com/65535/54683564133_4910efc5be.jpg');

    const botones = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('crear_cuenta')
          .setLabel('🆕 Crear Cuenta')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('cambiar_contraseña')
          .setLabel('🔑 Cambiar Contraseña')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({
      embeds: [embed],
      components: [botones],
      ephemeral: true
    });
  }
};
