import { Client, GatewayIntentBits, Events, Collection, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

import { db, ref, set, get, update, remove } from './firebase.js';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
client.commands = new Collection();

const comandosPath = path.join(__dirname, 'comandos');
const commandFiles = fs.readdirSync(comandosPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(path.join(comandosPath, file));
  client.commands.set(command.default.data.name, command.default);
}

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Hubo un error ejecutando el comando.', ephemeral: true });
    }
  }

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

  if (interaction.isModalSubmit()) {
    const userId = interaction.user.id;
    const userRef = ref(db, `cuentas/${userId}`);

    if (interaction.customId === 'modal_crear') {
      const nombre = interaction.fields.getTextInputValue('nombre_usuario');
      const contraseña = interaction.fields.getTextInputValue('contraseña');

      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        return interaction.reply({ content: '❌ Ya tenés una cuenta registrada.', ephemeral: true });
      }

      await set(userRef, { nombre, contraseña });
      return interaction.reply({ content: '✅ Cuenta creada correctamente.', ephemeral: true });
    }

    if (interaction.customId === 'modal_cambiar') {
      const nueva = interaction.fields.getTextInputValue('nueva_contraseña');

      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        return interaction.reply({ content: '⚠️ No tenés cuenta registrada.', ephemeral: true });
      }

      await update(userRef, { contraseña: nueva });
      return interaction.reply({ content: '🔐 Contraseña actualizada.', ephemeral: true });
    }
  }
});

client.on(Events.GuildMemberRemove, async member => {
  await remove(ref(db, `cuentas/${member.id}`));
});

client.on(Events.GuildBanAdd, async ban => {
  await remove(ref(db, `cuentas/${ban.user.id}`));
});

client.login(process.env.DISCORD_TOKEN);
