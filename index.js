import { Client, GatewayIntentBits, Events, Collection, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
client.commands = new Collection();

const comandosPath = path.join(__dirname, 'comandos');
const commandFiles = fs.readdirSync(comandosPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(path.join(comandosPath, file));
  client.commands.set(command.default.data.name, command.default);
}

client.on(Events.InteractionCreate, async interaction => {
  // Slash commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Hubo un error ejecutando el comando.', ephemeral: true });
      }
    }
  }

  // Botones
  if (interaction.isButton()) {
    if (interaction.customId === 'crear_cuenta') {
      const modal = new ModalBuilder()
        .setCustomId('modal_crear')
        .setTitle('Crear cuenta')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('nombre_usuario')
              .setLabel('Nombre de usuario')
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('discord_usuario')
              .setLabel('Usuario de Discord')
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('contraseña')
              .setLabel('Contraseña')
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
        );
      await interaction.showModal(modal);
    } else if (interaction.customId === 'cambiar_contraseña') {
      const modal = new ModalBuilder()
        .setCustomId('modal_cambiar')
        .setTitle('Cambiar contraseña')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('usuario_cambiar')
              .setLabel('Usuario (ej: @usuario)')
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
        );
      await interaction.showModal(modal);
    }
  }

  // Modales
  if (interaction.isModalSubmit()) {
    // Importamos funciones Firestore y cliente Discord
    const { db, doc, getDoc, setDoc, updateDoc } = await import('./firebase.js');
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');

    if (interaction.customId === 'modal_crear') {
      // Obtener datos del modal
      const nombre_usuario = interaction.fields.getTextInputValue('nombre_usuario');
      const discord_usuario = interaction.fields.getTextInputValue('discord_usuario');
      const contraseña = interaction.fields.getTextInputValue('contraseña');

      // Obtener rol simple en texto
      const member = interaction.guild.members.cache.get(interaction.user.id);
      let rolSimple = 'Sin rol';
      const rolesPrioridad = ['Jefe', 'Secretario', 'Moderador', 'Chofer'];
      for (const r of rolesPrioridad) {
        if (member.roles.cache.some(role => role.name === r)) {
          rolSimple = r;
          break;
        }
      }

      // Guardar en Firestore
      await setDoc(doc(db, 'cuentas', interaction.user.id), {
        clave: contraseña,
        usuario: discord_usuario,
        rol: rolSimple,
        nombre_usuario: nombre_usuario,
      });

      await interaction.reply({ content: '✅ Cuenta creada correctamente.', ephemeral: true });
    }

    if (interaction.customId === 'modal_cambiar') {
      const usuario_cambiar = interaction.fields.getTextInputValue('usuario_cambiar');

      // Buscar cuenta en Firestore
      const refCuenta = doc(db, 'cuentas', interaction.user.id);
      const docSnap = await getDoc(refCuenta);
      if (!docSnap.exists()) {
        return interaction.reply({ content: '❌ No se encontró cuenta asociada.', ephemeral: true });
      }

      // Enviar DM con botón para confirmar cambio
      const usuarioDiscord = await client.users.fetch(interaction.user.id);
      const embedConfirm = new EmbedBuilder()
        .setTitle('Confirmar cambio de contraseña')
        .setDescription('Si solicitaste el cambio de contraseña, pulsa el botón para continuar.')
        .setColor('Yellow');

      const botonConfirm = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('confirmar_cambio')
          .setLabel('Confirmar')
          .setStyle(ButtonStyle.Success)
      );

      await usuarioDiscord.send({ embeds: [embedConfirm], components: [botonConfirm] });

      await interaction.reply({ content: 'Se envió un DM para confirmar el cambio.', ephemeral: true });
    }

    if (interaction.customId === 'modal_nueva_contraseña') {
      const nuevaContraseña = interaction.fields.getTextInputValue('nueva_contraseña');
      const userId = interaction.user.id;

      const refCuenta = doc(db, 'cuentas', userId);
      await updateDoc(refCuenta, { clave: nuevaContraseña });

      await interaction.reply({ content: '✅ Contraseña cambiada correctamente.', ephemeral: true });
    }
  }

  // Botón confirmar cambio de contraseña por DM
  if (interaction.isButton()) {
    if (interaction.customId === 'confirmar_cambio') {
      // Abrir modal para nueva contraseña
      const modalNueva = new ModalBuilder()
        .setCustomId('modal_nueva_contraseña')
        .setTitle('Nueva contraseña')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('nueva_contraseña')
              .setLabel('Ingresa la nueva contraseña')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
      await interaction.showModal(modalNueva);
    }
  }
});

// Eliminar cuenta Firestore si un usuario sale o es baneado
client.on(Events.GuildMemberRemove, async member => {
  const { doc, deleteDoc } = await import('firebase/firestore');
  const { db } = await import('./firebase.js');
  await deleteDoc(doc(db, 'cuentas', member.id));
});

client.on(Events.GuildBanAdd, async ban => {
  const { doc, deleteDoc } = await import('firebase/firestore');
  const { db } = await import('./firebase.js');
  await deleteDoc(doc(db, 'cuentas', ban.user.id));
});

import './deploy-commands.js';
client.login(process.env.DISCORD_TOKEN);
