import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`Bot listo! Logueado como ${client.user.tag}`);
  console.log('Token Discord:', process.env.DISCORD_TOKEN ? '✅' : '❌');
  console.log('Firebase API Key:', process.env.FIREBASE_API_KEY ? '✅' : '❌');
  // Puedes imprimir otras vars de entorno para test
});

client.login(process.env.DISCORD_TOKEN);
