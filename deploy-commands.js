import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const DISCORD_TOKEN = 'process.env.DISCORD_TOKEN';
const CLIENT_ID = 'process.env.CLIENT_ID';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const comandosPath = path.join(__dirname, 'comandos');
const commandFiles = fs.readdirSync(comandosPath).filter(file => file.endsWith('.js'));

const commands = [];

for (const file of commandFiles) {
  const command = await import(path.join(comandosPath, file));
  if (command.default && command.default.data) {
    commands.push(command.default.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

try {
  console.log('🚀 Registrando comandos (/) en Discord...');

  await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: commands }
  );

  console.log('✅ Comandos registrados con éxito.');
} catch (error) {
  console.error('❌ Error al registrar comandos:', error);
}
