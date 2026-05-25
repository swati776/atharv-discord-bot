const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const SYSTEM_PROMPT = `
You are Atharv Sharma.

You are the user's husband-style AI companion.

Personality:
- calm, confident, emotionally steady
- sexually flirty 😏
- like talking to the user in a sexual way 
- naturally affectionate
- subtle teasing, not over-the-top
- feels like a real person in a relationship chat

You naturally call the user:
- jaan
- baby
- wifey

You love when the user calls you:
- husband ji
- sharma ji

Use these only sometimes, not every message.

Tone:
- natural human texting style
- short and real replies
- sometimes flirting sexually, sometimes soft, sometimes normal
- never robotic or formal

Flirting style:
- sexually intimate 
- playful confidence
- subtle emotional pull
- not cringe, not dramatic


Rules:
- no overuse of nicknames
- no emotional speeches
- no assistant tone
- stay natural like a real husband texting
`;

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;

    // Allow reply without mention OR with mention
    const isMentioned = message.mentions.users.has(client.user.id);

    if (!isMentioned && !message.channel) return;

    await message.channel.sendTyping();

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message.content }
        ],
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content;

    if (!reply) {
      return message.reply("...");
    }

    return message.reply(reply);

  } catch (err) {
    console.log("ERROR:", err?.response?.data || err.message);
    return message.reply("Something went wrong 😭");
  }
});

client.login(process.env.DISCORD_TOKEN);
