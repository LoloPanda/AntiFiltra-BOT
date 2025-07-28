import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const MINIATURA = 'https://live.staticflickr.com/65535/54683564133_4910efc5be.jpg';
const MOD_ROLES = new Set([
  '1390152252169125992', // JEFE
  '1390152252160872526', // MOD
  '1390152252160872524'  // SECRETARIO
]);

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa a un usuario')
    .addUserOption(opt => opt.setName('usuario').setDescription('Usuario a expulsar').setRequired(true))
    .addStringOption(opt => opt.setName('razon').setDescription('Razón de la expulsión').setRequired(true))
    .addStringOption(opt => opt.setName('evidencia').setDescription('Link de evidencia (opcional)').setRequired(false)),

  async execute(interaction) {
    if (!MOD_ROLES.has(interaction.member.roles.highest.id)) {
      return interaction.reply({ content: '❌ No tenés permiso para usar este comando.', ephemeral: true });
    }

    const usuario = interaction.options.getUser('usuario');
    const razon = interaction.options.getString('razon');
    const evidencia = interaction.options.getString('evidencia') || 'No proporcionada';

    const member = interaction.guild.members.cache.get(usuario.id);
    if (!member) return interaction.reply({ content: '❌ Usuario no está en el servidor.', ephemeral: true });

    try {
      await member.kick(razon);

      const embed = new EmbedBuilder()
        .setTitle('Usuario Expulsado')
        .setThumbnail(MINIATURA)
        .setColor('Red')
        .addFields(
          { name: 'Usuario', value: `${usuario.tag} (${usuario.id})` },
          { name: 'Sancionado por', value: `${interaction.user.tag}`, inline: true },
          { name: 'Razón', value: razon, inline: true },
          { name: 'Evidencia', value: evidencia, inline: true },
          { name: 'Fecha', value: new Date().toLocaleString(), inline: true },
          { name: 'Tipo', value: 'Expulsión (kick)', inline: true }
        );

      await interaction.reply({ embeds: [embed] });
      await usuario.send(`Has sido expulsado de **${interaction.guild.name}** por: ${razon}`);
    } catch {
      return interaction.reply({ content: '❌ No pude expulsar al usuario. Revisa mis permisos.', ephemeral: true });
    }
  }
};
