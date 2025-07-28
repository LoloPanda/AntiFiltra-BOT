import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const MINIATURA = 'https://live.staticflickr.com/65535/54683564133_4910efc5be.jpg';
const MOD_ROLES = new Set([
  '1390152252169125992',
  '1390152252160872526',
  '1390152252160872524'
]);

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Amonesta a un usuario')
    .addUserOption(opt => opt.setName('usuario').setDescription('Usuario a advertir').setRequired(true))
    .addStringOption(opt => opt.setName('razon').setDescription('Razón de la advertencia').setRequired(true))
    .addStringOption(opt => opt.setName('evidencia').setDescription('Link de evidencia (opcional)').setRequired(false)),

  async execute(interaction) {
    if (!MOD_ROLES.has(interaction.member.roles.highest.id)) {
      return interaction.reply({ content: '❌ No tenés permiso para usar este comando.', ephemeral: true });
    }

    const usuario = interaction.options.getUser('usuario');
    const razon = interaction.options.getString('razon');
    const evidencia = interaction.options.getString('evidencia') || 'No proporcionada';

    const embed = new EmbedBuilder()
      .setTitle('Usuario Advertido')
      .setThumbnail(MINIATURA)
      .setColor('Orange')
      .addFields(
        { name: 'Usuario', value: `${usuario.tag} (${usuario.id})` },
        { name: 'Sancionado por', value: `${interaction.user.tag}`, inline: true },
        { name: 'Razón', value: razon, inline: true },
        { name: 'Evidencia', value: evidencia, inline: true },
        { name: 'Fecha', value: new Date().toLocaleString(), inline: true },
        { name: 'Tipo', value: 'Advertencia (warn)', inline: true }
      );

    await interaction.reply({ embeds: [embed] });
    await usuario.send(`Has recibido una advertencia en **${interaction.guild.name}** por: ${razon}`);
  }
};
