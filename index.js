const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] 
});

const supportRoles = ['1520054944034455713', '1520044608216891402', '1520057770395828305'];

client.on('ready', () => {
    console.log(`[VOID] البوت يعمل: ${client.user.tag}`);
});

// أمر !ticket-setup
client.on('messageCreate', async (message) => {
    if (message.content === '!ticket-setup') {
        const embed = new EmbedBuilder()
            .setTitle('🌌 VOID | مركز الدعم الفني')
            .setDescription('أهلاً بك في سيرفر VOID.\nاضغط على الزر أدناه لفتح تذكرة خاصة بك وسيقوم فريقنا بالرد عليك في أقرب وقت.')
            .setColor('#2C2F33')
            .setFooter({ text: 'Void Support System • Powered by Space' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_ticket').setLabel('فتح تذكرة جديدة').setStyle(ButtonStyle.Primary).setEmoji('📩')
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// نظام الأزرار
client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;

    if (i.customId === 'open_ticket') {
        const channel = await i.guild.channels.create({
            name: `ticket-${i.user.username}`,
            permissionOverwrites: [
                { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                ...supportRoles.map(r => ({ id: r, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }))
            ]
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
            new ButtonBuilder().setCustomId('call_support').setLabel('استدعاء الدعم').setStyle(ButtonStyle.Secondary).setEmoji('🔔')
        );

        await channel.send({
            content: `${supportRoles.map(r => `<@&${r}>`).join(' ')} - تذكرة جديدة من: ${i.user}`,
            embeds: [new EmbedBuilder().setTitle('📩 | تذكرة جديدة').setDescription('يرجى كتابة مشكلتك هنا بوضوح.').setColor('#0099FF')],
            components: [row]
        });

        i.reply({ content: `✅ تم فتح التذكرة: ${channel}`, ephemeral: true });
    }

    if (i.customId === 'close_ticket') {
        await i.reply('🔒 سيتم إغلاق التذكرة خلال 5 ثوانٍ...');
        setTimeout(() => i.channel.delete(), 5000);
    }

    if (i.customId === 'call_support') {
        await i.reply({ content: `🔔 تم استدعاء فريق الدعم: ${supportRoles.map(r => `<@&${r}>`).join(' ')}` });
    }
});

client.login(process.env.TOKEN);
