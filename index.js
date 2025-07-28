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
  // Comandos slash
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
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('contraseña')
              .setLabel('Contraseña')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
      await interaction.showModal(modal);
    } else if (interaction.customId === 'cambiar_contraseña') {
      const modal = new ModalBuilder()
        .setCustomId('modal_cambiar')
        .setTitle('Cambiar contraseña')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('nueva_contraseña')
              .setLabel('Nueva contraseña')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
      await interaction.showModal(modal);
    }
  }

  // Modales
  if (interaction.isModalSubmit()) {
    // IMPORTANTE: Importa firebase.js donde tengas las funciones para Firestore
    // Por ejemplo:
    // import { db, doc, getDoc, setDoc, updateDoc } from './firebase.js';
    // Como no puedo hacer import dinámico aquí, asegúrate que firebase esté importado en este archivo o maneja este código en comandos.

    // Aquí pondremos la lógica para crear y cambiar contraseña (ideal manejarla en comando o módulo aparte).

    // Para que funcione, podés disparar eventos o usar handlers en el comando /cuenta.

    // Para simplificar, este código lo manejarás dentro del comando /cuenta que te paso a continuación.
  }
});

// Cuando un miembro sale o es baneado, borrar su cuenta de Firestore
client.on(Events.GuildMemberRemove, async member => {
  const { remove, doc } = await import('firebase/firestore');
  const { db } = await import('./firebase.js');
  await remove(doc(db, 'cuentas', member.id));
});

client.on(Events.GuildBanAdd, async ban => {
  const { remove, doc } = await import('firebase/firestore');
  const { db } = await import('./firebase.js');
  await remove(doc(db, 'cuentas', ban.user.id));
});

client.login(process.env.DISCORD_TOKEN);
