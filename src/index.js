import { Client, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { Jimp } from "jimp";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`${readyClient.user.tag} としてログインしました`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.attachments.size === 0) return;



  for (const attachment of message.attachments.values()) {
    const isImage =
      attachment.contentType?.startsWith("image/") ||
      /\.(png|jpe?g|gif|webp)$/i.test(attachment.name ?? "");

    if (!isImage) continue;

    console.log("画像ファイル名:", attachment.name);
    console.log("画像URL:", attachment.url);

    try {
      const response = await fetch(attachment.url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const image = await Jimp.read(buffer);

      

      // 白黒加工
      image.greyscale();

      // 加工した画像をバッファに変換
      const outputBuffer = await image.getBuffer("image/png");

      // Discordへ加工後の画像を返信
      await message.reply({
        content: "白黒画像に変換しました！",
        files: [
          {
            attachment: outputBuffer,
            name: "converted.png",
          },
        ],
      });

    } catch (err) {
      console.error(err);
      await message.reply("画像の読み込みに失敗しました。");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);