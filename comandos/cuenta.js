import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('cuenta')
    .setDescription('Administrá tu cuenta de acceso'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🧾 Panel de cuenta personal')
      .setDescription('Desde este panel podés crear o administrar tu cuenta para acceder a zonas privadas de nuestra web.')
      .addFields(
        {
          name: '✅ Crear cuenta',
          value: 'Crea una nueva cuenta ingresando un nombre de usuario y contraseña.',
        },
        {
          name: '🔁 Cambiar contraseña',
          value: 'Si ya tenés cuenta, podés actualizar tu contraseña.',
        },
        {
          name: '⚠️ Importante',
          value: 'Tu cuenta se eliminará automáticamente si abandonás el servidor o sos kickeado/baneado.',
        }
      )
      .setColor('#2F3136')
      .setFooter({ text: 'Tu información está vinculada a tu cuenta de Discord.' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('crear_cuenta')
        .setLabel('Crear cuenta')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('cambiar_contraseña')
        .setLabel('Cambiar contraseña')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  },
};
