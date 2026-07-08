const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, AttachmentBuilder } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMessages
    ] 
});

// معرفات الرتب التي سيتم منشنها
const supportRoles = ['1520054944034455713', '1520044608216891402', '1520057770395828305'];

client.on('ready', () => {
    console.log(`[VOID SUPPORT] البوت يعمل الآن: ${client.user.tag}`);
    client.user.setActivity('Void | Support System', { type: 'WATCHING' });
});

// الأمر الخاص بإرسال رسالة فتح التكت
client.on('messageCreate', async (message) => {
    if (message.content === '!ticket-setup') {
        const banner = new AttachmentBuilder('./void-banner.png');
        
        const embed = new EmbedBuilder()
            .setTitle('🌌 | Void Support Center')
            .setDescription('استكشف، تحدث، وتواصل معنا.\nاضغط على الزر أدناه لفتح تذكرة خاصة بك.')
            .setImage('attachment://void-banner.png')
            .setColor('#000000')
            .setFooter({ text: 'Void Server | Official Support' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('فتح تذكرة')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📩')
        );

        await message.channel.send({ embeds: [embed], components: [row], files: [banner] });
    }
});

// نظام التفاعل (الأزرار)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    // فتح التذكرة
    if (interaction.customId === 'open_ticket') {
        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                ...supportRoles.map(r => ({ id: r, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ]
        });

        const controlRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق التذكرة').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
            new ButtonBuilder().setCustomId('call_support').setLabel('استدعاء الدعم').setStyle(ButtonStyle.Primary).setEmoji('🔔')
        );

        await channel.send({
            content: `${supportRoles.map(r => `<@&${r}>`).join(' ')} - ${interaction.user} فتح تذكرة جديدة.`,
            embeds: [new EmbedBuilder().setTitle('Void Support').setDescription('يرجى شرح مشكلتك وسيقوم فريق الدعم بالرد عليك قريباً.').setColor('#000000')],
            components: [controlRow]
        });

        interaction.reply({ content: `✅ تم فتح تذكرتك بنجاح: ${channel}`, ephemeral: true });
    }

    // إغلاق التذكرة
    if (interaction.customId === 'close_ticket') {
        interaction.reply('🔒 سيتم حذف التذكرة خلال 5 ثوانٍ...');
        setTimeout(() => interaction.channel.delete(), 5000);
    }

    // استدعاء الدعم
    if (interaction.customId === 'call_support') {
        interaction.reply({ content: `🔔 تم استدعاء فريق الدعم: ${supportRoles.map(r => `<@&${r}>`).join(' ')}` });
    }
});

client.login(process.env.TOKEN);
