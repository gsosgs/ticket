const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] 
});

// الرتب الثلاث والإيموجي
const supportRoles = ['1520054944034455713', '1520057770395828305', '1520044608216891402'];
const ticketEmoji = '<a:AcC_ticket:1524572003523362906>';

client.on('ready', () => { console.log(`[VOID] البوت يعمل: ${client.user.tag}`); });

// 1. أمر التهيئة
client.on('messageCreate', async (message) => {
    if (message.content === '!ticket-setup') {
        const embed = new EmbedBuilder()
            .setTitle('🌌 | VOID Support Center')
            .setDescription('مرحباً بك في مركز دعم VOID.\nاضغط على الزر أدناه لفتح تذكرة.')
            .setColor('#000000');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_ticket').setLabel('فتح تذكرة').setStyle(ButtonStyle.Primary).setEmoji('📩')
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// 2. نظام التفاعل
client.on('interactionCreate', async (i) => {
    if (!i.isButton() || i.customId !== 'open_ticket') return;

    const ticketNum = Math.floor(1000 + Math.random() * 9000);
    const channel = await i.guild.channels.create({
        name: `ticket-${ticketNum}`,
        permissionOverwrites: [
            { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            ...supportRoles.map(r => ({ id: r, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
        ]
    });

    const embed = new EmbedBuilder()
        .setColor('#2F3136')
        .addFields(
            { name: '👤 | مالك التذكرة', value: `<@${i.user.id}>`, inline: false },
            { name: '🛡️ | مشرف التذاكر', value: 'بانتظار "اتفضل"...', inline: false },
            { name: '🔢 | رقم التذكرة', value: ticketNum.toString(), inline: true }
        );

    const mentionString = supportRoles.map(r => `<@&${r}>`).join(' ');
    await channel.send({ content: `${mentionString}`, embeds: [embed] });
    i.reply({ content: `✅ تم فتح التذكرة: ${channel}`, ephemeral: true });
});

// 3. نظام "اتفضل" التلقائي
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // شرط القناة والكلمة (يجب أن يكتب المشرف كلمة: اتفضل)
    if (message.channel.name.startsWith('ticket-') && message.content.trim() === 'اتفضل') {
        // التأكد أن المرسل لديه إحدى رتب الدعم
        const hasRole = message.member.roles.cache.some(r => supportRoles.includes(r.id));
        if (!hasRole) return;

        await message.delete().catch(() => {}); // حذف رسالة المشرف

        const messages = await message.channel.messages.fetch({ limit: 10 });
        const botEmbedMessage = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0);
        
        if (botEmbedMessage) {
            const embed = EmbedBuilder.from(botEmbedMessage.embeds[0])
                .spliceFields(1, 1, { name: '🛡️ | مشرف التذاكر', value: `${ticketEmoji} <@${message.author.id}>`, inline: false });
            await botEmbedMessage.edit({ embeds: [embed] });
        }
    }
});

client.login(process.env.TOKEN);
