const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('ready', () => {
    console.log(`[VOID SUPPORT] البوت يعمل الآن: ${client.user.tag}`);
    client.user.setActivity('Void Server | Support', { type: 'WATCHING' });
});

// أمر إنشاء رسالة فتح التذكرة
client.on('messageCreate', async (message) => {
    if (message.content === '!ticket-setup') {
        const embed = new EmbedBuilder()
            .setTitle('🎫 | Void Support Center')
            .setDescription('اضغط على الزر أدناه لفتح تذكرة جديدة. سيقوم فريقنا بالرد عليك قريباً.')
            .setColor('#000000') // اللون الأسود الفخم لاسم Void
            .setFooter({ text: 'Void Server Support' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('فتح تذكرة')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📩')
        );

        message.channel.send({ embeds: [embed], components: [row] });
    }
});

// نظام الأزرار (فتح وإغلاق التذاكر)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    // حالة فتح التذكرة
    if (interaction.customId === 'open_ticket') {
        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });

        const closeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('إغلاق التذكرة')
                .setStyle(ButtonStyle.Danger)
        );

        channel.send({ content: `مرحباً ${interaction.user}، فريق الدعم سيصلك قريباً.`, components: [closeRow] });
        interaction.reply({ content: `تم إنشاء تذكرتك: ${channel}`, ephemeral: true });
    }

    // حالة إغلاق التذكرة
    if (interaction.customId === 'close_ticket') {
        interaction.reply('سيتم إغلاق القناة وحذفها بعد 5 ثوانٍ...');
        setTimeout(() => interaction.channel.delete(), 5000);
    }
});

client.login(process.env.TOKEN);
