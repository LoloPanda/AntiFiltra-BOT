import { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { db } from '../firebase.js';
import { collection, addDoc } from 'firebase/firestore';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Advierte a un usuario.')
    .addUserOption(opt => opt.setName('usuario').setDescription('Usuario a advertir').setRequired(true))
    .addStringOption(opt => opt.setName('razon').setDescription('Razón del warn').setRequired(true))
    .addAttachmentOption(opt => opt.setName('evidencia').setDescription('Evidencia de la advertencia').setRequired(true)),
  async execute(interaction) {
    const mod = interaction.member;
    const rolesPermitidos = ['Jefe', 'Secretario', 'Moderador'];
    if (!mod.roles.cache.some(r => rolesPermitidos.includes(r.name))) {
      return interaction.reply({ content: 'No tenés permisos.', ephemeral: true });
    }

    const user = interaction.options.getUser('usuario');
    const razon = interaction.options.getString('razon');
    const evidencia = interaction.options.getAttachment('evidencia');

    const embed = new EmbedBuilder()
      .setTitle('🟦 Usuario ADVERTIDO')
      .addFields(
        { name: 'Usuario sancionado', value: `<@${user.id}>` },
        { name: 'Moderador', value: `${interaction.user}` },
        { name: 'Razón', value: razon },
        { name: 'Fecha', value: new Date().toLocaleString() },
        { name: 'Tipo de Sanción', value: 'Advertencia' }
      )
      .setImage(evidencia.url)
      .setColor(0x3498db);

    await interaction.guild.channels.cache.find(c => c.name === 'sanciones')?.send({ embeds: [embed] });
    await addDoc(collection(db, 'sanciones'), {
      tipo: 'Advertencia',
      user: user.id,
      mod: interaction.user.id,
      razon,
      evidencia: evidencia.url,
      fecha: Date.now()
    });

    await interaction.reply({ content: 'Sanción registrada.', ephemeral: true });
  }
};
