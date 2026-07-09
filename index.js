const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] 
});

const supportRoles = ['1520054944034455713', '1520057770395828305', '1520044608216891402'];
const ticketEmoji = '<a:AcC_ticket:1524572003523362906>';

client.on('ready', () => { console.log(`[VOID] البوت يعمل: ${client.user.tag}`); });

// 1. أمر التهيئة
client.on('messageCreate', async (message) => {
    if (message.content === '!ticket-setup') {
        const embed = new EmbedBuilder()
            .setTitle('🌌 | VOID Support Center')
            .setDescription('اضغط الزر أدناه لفتح تذكرة.')
            .setColor('#000000');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_ticket').setLabel('فتح تذكرة').setStyle(ButtonStyle.Primary).setEmoji('📩')
        );
        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// 2. التفاعل بالأزرار
client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;

    // فتح التذكرة
    if (i.customId === 'open_ticket') {
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
                { name: '🛡️ | مشرف التذاكر', value: 'بانتظار الاستلام...', inline: false },
                { name: '🔢 | رقم التذكرة', value: ticketNum.toString(), inline: true }
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_btn').setLabel('استلام التذكرة').setStyle(ButtonStyle.Success).setEmoji('💼'),
            new ButtonBuilder().setCustomId('close_btn').setLabel('إغلاق').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        const mentionString = supportRoles.map(r => `<@&${r}>`).join(' ');
        await channel.send({ content: `${mentionString}`, embeds: [embed], components: [row] });
        i.reply({ content: `✅ تم فتح التذكرة: ${channel}`, ephemeral: true });
    }

    // زر الاستلام (تحديث الإيمبد فوراً)
    if (i.customId === 'claim_btn') {
        const embed = EmbedBuilder.from(i.message.embeds[0])
            .spliceFields(1, 1, { name: '🛡️ | مشرف التذاكر', value: `${ticketEmoji} <@${i.user.id}>`, inline: false });
        
        await i.update({ embeds: [embed], components: [] }); // حذف الأزرار بعد الاستلام
        await i.channel.send(`تم استلام التذكرة بواسطة ${i.user} ${ticketEmoji}`);
    }

    // زر الإغلاق
    if (i.customId === 'close_btn') {
        await i.reply('🔒 سيتم حذف القناة...');
        setTimeout(() => i.channel.delete(), 3000);
    }
});

client.login(process.env.TOKEN);
