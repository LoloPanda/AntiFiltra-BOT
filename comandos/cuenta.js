const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { doc, getDoc, setDoc } = require('firebase-admin/firestore');
const { db } = require('../firebase'); // Ruta según dónde tengas el archivo firebase.js

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cuenta')
    .setDescription('Registra o consulta tu cuenta en el sistema.')
    .addStringOption(option =>
      option.setName('clave')
        .setDescription('Clave de tu cuenta (si es tu primer registro)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const usuario = `<@${userId}>`;
    const clave = interaction.options.getString('clave');

    const cuentaRef = doc(db, 'cuentas', userId);
    const cuentaSnap = await getDoc(cuentaRef);

    // Detectar el rol principal (excluyendo @everyone)
    const roles = interaction.member.roles.cache;
    const rol = roles.map(r => r.name).find(name => name !== '@everyone') || 'Sin rol';

    if (cuentaSnap.exists()) {
      const datos = cuentaSnap.data();

      const embed = new EmbedBuilder()
        .setTitle('📄 Cuenta encontrada')
        .setColor('Green')
        .addFields(
          { name: '👤 Usuario', value: datos.usuario || usuario, inline: true },
          { name: '🔑 Clave', value: datos.clave || 'No registrada', inline: true },
          { name: '🎫 Viaje actual', value: datos.viaje || '0', inline: true },
          { name: '🧳 Viajes totales', value: datos.viajes || '0', inline: true },
          { name: '🛡️ Rol', value: datos.rol || 'Sin rol', inline: true },
        )
        .setFooter({ text: 'Sistema de cuentas GTG' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else if (clave) {
      await setDoc(cuentaRef, {
        usuario: usuario,
        clave: clave,
        viaje: "0",
        viajes: "0",
        rol: rol
      });

      const embed = new EmbedBuilder()
        .setTitle('✅ Cuenta registrada')
        .setColor('Blue')
        .setDescription(`Tu cuenta ha sido registrada correctamente.`)
        .addFields(
          { name: '👤 Usuario', value: usuario, inline: true },
          { name: '🔑 Clave', value: clave, inline: true },
          { name: '🛡️ Rol', value: rol, inline: true }
        )
        .setFooter({ text: 'Sistema de cuentas GTG' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({
        content: '❌ No tienes cuenta registrada. Usa `/cuenta clave:(Contraseña)` para registrarte.',
        ephemeral: true
      });
    }
  }
};
