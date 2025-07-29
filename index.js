import { Client, GatewayIntentBits, Partials, Collection, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, InteractionType } from 'discord.js';
import { config } from 'dotenv';
import { db } from './firebase.js';
import fs from 'node:fs';
import path from 'node:path';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();

// Cargar comandos
const commandsPath = path.join('./comandos');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./comandos/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

client.on('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, client, db);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Error al ejecutar el comando.', ephemeral: true });
    }
  }

  // Botones
  if (interaction.isButton()) {
    const { customId, user } = interaction;

    if (customId === 'crearCuenta') {
      const modal = new ModalBuilder()
        .setCustomId('modalCrearCuenta')
        .setTitle('Crear cuenta');

      const inputs = [
        new TextInputBuilder().setCustomId('usuario').setLabel('Nombre de Usuario').setStyle(TextInputStyle.Short).setRequired(true),
        new TextInputBuilder().setCustomId('discord').setLabel('Usuario de Discord').setStyle(TextInputStyle.Short).setRequired(true),
        new TextInputBuilder().setCustomId('clave').setLabel('Contraseña').setStyle(TextInputStyle.Short).setRequired(true)
      ];

      modal.addComponents(inputs.map(input => new ActionRowBuilder().addComponents(input)));
      await interaction.showModal(modal);

    } else if (customId === 'cambiarClave') {
      const modal = new ModalBuilder()
        .setCustomId('modalVerificarCuenta')
        .setTitle('Verificación');

      const usuario = new TextInputBuilder()
        .setCustomId('usuarioVerificar')
        .setLabel('Usuario registrado')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(usuario));
      await interaction.showModal(modal);

    } else if (customId.startsWith('confirmarCambio_')) {
      const usuario = customId.split('_')[1];
      const modal = new ModalBuilder()
        .setCustomId(`modalNuevaClave_${usuario}`)
        .setTitle('Nueva contraseña');

      const nuevaClave = new TextInputBuilder()
        .setCustomId('nuevaClave')
        .setLabel('Nueva Contraseña')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(nuevaClave));
      await interaction.showModal(modal);
    }
  }

  // Modals
  if (interaction.type === InteractionType.ModalSubmit) {
    if (interaction.customId === 'modalCrearCuenta') {
      const usuario = interaction.fields.getTextInputValue('usuario');
      const discord = interaction.fields.getTextInputValue('discord');
      const clave = interaction.fields.getTextInputValue('clave');
      const member = await interaction.guild.members.fetch(interaction.user.id);
      const rol = member.roles.cache.find(r => ['Jefe', 'Secretario', 'Chofer', 'Moderador'].includes(r.name))?.name || 'Sin Rol';

      try {
        await db.collection('cuentas').doc(usuario).set({
          usuario,
          discord,
          clave,
          rol
        });
        await interaction.reply({ content: '✅ Cuenta creada con éxito.', ephemeral: true });
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ Error al guardar la cuenta.', ephemeral: true });
      }

    } else if (interaction.customId === 'modalVerificarCuenta') {
      const usuario = interaction.fields.getTextInputValue('usuarioVerificar');
      const doc = await db.collection('cuentas').doc(usuario).get();
      if (!doc.exists) return interaction.reply({ content: '❌ Usuario no encontrado.', ephemeral: true });

      try {
        const embed = new EmbedBuilder()
          .setTitle('Confirmación de cambio de contraseña')
          .setDescription(`¿Confirmás que querés cambiar la contraseña de la cuenta **${usuario}**?`)
          .setColor('Blue');

        const button = new ButtonBuilder()
          .setLabel('Sí, confirmar')
          .setStyle(ButtonStyle.Success)
          .setCustomId(`confirmarCambio_${usuario}`);

        await interaction.user.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(button)] });
        await interaction.reply({ content: '✅ Te enviamos un mensaje privado para confirmar.', ephemeral: true });
      } catch (err) {
        await interaction.reply({ content: '❌ No pudimos enviarte un DM.', ephemeral: true });
      }

    } else if (interaction.customId.startsWith('modalNuevaClave_')) {
      const usuario = interaction.customId.split('_')[1];
      const nuevaClave = interaction.fields.getTextInputValue('nuevaClave');

      try {
        await db.collection('cuentas').doc(usuario).update({ clave: nuevaClave });
        await interaction.reply({ content: '✅ Contraseña actualizada.', ephemeral: true });
      } catch (err) {
        await interaction.reply({ content: '❌ Error al actualizar.', ephemeral: true });
      }
    }
  }
});

// Login
client.login(process.env.TOKEN);
