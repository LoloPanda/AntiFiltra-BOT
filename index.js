import { Client, GatewayIntentBits, Events, Collection, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- FIREBASE CONFIG (sin .env) ---
const firebaseConfig = {
  apiKey: 'TU_API_KEY',
  authDomain: 'TU_AUTH_DOMAIN',
  projectId: 'TU_PROJECT_ID',
  storageBucket: 'TU_STORAGE_BUCKET',
  messagingSenderId: 'TU_MSG_ID',
  appId: 'TU_APP_ID',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- CLIENT DISCORD ---
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
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, client, db);
    } catch (error) {
      console.error(error);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Hubo un error ejecutando el comando.', ephemeral: true });
      }
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
    }

    if (interaction.customId.startsWith('confirmar_cambio_')) {
      const userId = interaction.customId.split('_')[2];
      const modal = new ModalBuilder()
        .setCustomId(`nueva_contraseña_${userId}`)
        .setTitle('Nueva Contraseña')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('nueva_pass')
              .setLabel('Nueva contraseña')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
      await interaction.showModal(modal);
    }

    if (interaction.customId === 'cambiar_contraseña') {
      const modal = new ModalBuilder()
        .setCustomId('modal_cambiar')
        .setTitle('Cambiar contraseña')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('usuario')
              .setLabel('Usuario registrado')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
      await interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'modal_crear') {
      const nombre = interaction.fields.getTextInputValue('nombre_usuario');
      const pass = interaction.fields.getTextInputValue('contraseña');
      const miembro = interaction.member;

      const rolTexto = miembro.roles.cache.find(r =>
        ['Jefe', 'Secretario', 'Moderador', 'Chofer'].includes(r.name)
      )?.name || 'Desconocido';

      await setDoc(doc(db, 'cuentas', interaction.user.id), {
        usuario: nombre,
        contraseña: pass,
        rol: rolTexto,
        viaje: '',
        viajes: [],
      });

      await interaction.reply({ content: `✅ Cuenta creada como ${nombre} con rol ${rolTexto}`, ephemeral: true });
    }

    if (interaction.customId === 'modal_cambiar') {
      const usuario = interaction.fields.getTextInputValue('usuario');
      const snapshot = await getDoc(doc(db, 'cuentas', interaction.user.id));

      if (!snapshot.exists() || snapshot.data().usuario !== usuario) {
        return await interaction.reply({ content: '❌ Usuario no encontrado o no coincide con tu ID.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('Confirmación de cambio de contraseña')
        .setDescription('Haz clic en el botón para confirmar el cambio de contraseña.')
        .setColor('Orange');

      const boton = new ButtonBuilder()
        .setLabel('Confirmar')
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`confirmar_cambio_${interaction.user.id}`);

      await interaction.user.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(boton)] });
      await interaction.reply({ content: '📩 Te enviamos un DM para confirmar.', ephemeral: true });
    }

    if (interaction.customId.startsWith('nueva_contraseña_')) {
      const userId = interaction.customId.split('_')[2];
      const nuevaPass = interaction.fields.getTextInputValue('nueva_pass');
      await updateDoc(doc(db, 'cuentas', userId), {
        contraseña: nuevaPass,
      });

      await interaction.reply({ content: '✅ Contraseña actualizada con éxito.', ephemeral: true });
    }
  }
});

client.on(Events.GuildMemberRemove, async member => {
  await deleteDoc(doc(db, 'cuentas', member.id));
});

client.on(Events.GuildBanAdd, async ban => {
  await deleteDoc(doc(db, 'cuentas', ban.user.id));
});

// --- LOGIN ---
client.login('TU_TOKEN_DE_DISCORD');
