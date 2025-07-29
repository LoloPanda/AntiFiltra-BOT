// deploy-commands.js
import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

import fs from 'node:fs';
import path from 'node:path';

const commands = [];
const commandsPath = path.join(process.cwd(), 'comandos');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(path.join(commandsPath, file));
  // Se asume que exportas con "export default { data, execute }"
  commands.push(command.default.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Registrando comandos slash en Discord...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.GUILD_ID), 
      { body: commands },
    );
    console.log('Comandos registrados correctamente');
  } catch (error) {
    console.error(error);
  }
})();
