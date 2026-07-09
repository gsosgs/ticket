const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const fs = require('fs');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] 
});

const supportRoles = ['1520054944034455713', '1520057770395828305', '1520044608216891402'];
const ticketEmoji = '<a:AcC_ticket:1524572003523362906>';

// دالة لجلب الرقم التصاعدي
function getNextTicketNumber() {
    let data = { lastNumber: 0 };
    if (fs.existsSync('./tickets.json')) {
        data = JSON.parse(fs.readFileSync('./tickets.json', 'utf8'));
    }
    data.lastNumber += 1;
    fs.writeFileSync('./tickets.json', JSON.stringify(data));
    return data.lastNumber;
}

client.on('ready', () => { console.log(`[VOID] البوت يعمل: ${client.user.tag}`); });

// 1. أمر التهيئة
client.on('messageCreate', async (message) => {
    if (message.content === '!ticket-setup') {
        const embed = new EmbedBuilder()
            .setTitle('🌌 | VOID Support Center')
            .setDescription('مرحباً بك في مركز دعم VOID.\nاضغط الزر أدناه لفتح تذكرة.')
            .setColor('#000000');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_ticket').setLabel('فتح تذكرة').setStyle(ButtonStyle.Primary).setEmoji('📩')
        );
        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// 2. نظام التفاعل
client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;

    // فتح التذكرة
    if (i.customId === 'open_ticket') {
        const ticketNum = getNextTicketNumber();
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
                { name: '📅 | تاريخ التذكرة', value: new Date().toLocaleDateString(), inline: true },
                { name: '🔢 | رقم التذكرة', value: ticketNum.toString(), inline: true }
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_btn').setLabel('استلام').setStyle(ButtonStyle.Success).setEmoji('💼'),
            new ButtonBuilder().setCustomId('close_btn').setLabel('إغلاق').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        const mentionString = supportRoles.map(r => `<@&${r}>`).join(' ');
        await channel.send({ content: `${mentionString}`, embeds: [embed], components: [row] });
        i.reply({ content: `✅ تم فتح التذكرة رقم ${ticketNum}`, ephemeral: true });
    }

    // زر الاستلام (للمشرفين فقط)
    if (i.customId === 'claim_btn') {
        const isSupport = i.member.roles.cache.some(r => supportRoles.includes(r.id));
        if (!isSupport) return i.reply({ content: '❌ أنت لست مشرفاً!', ephemeral: true });

        const embed = EmbedBuilder.from(i.message.embeds[0])
            .spliceFields(1, 1, { name: '🛡️ | مشرف التذاكر', value: `${ticketEmoji} <@${i.user.id}>`, inline: false });
        
        await i.update({ embeds: [embed] });
    }

    // زر الإغلاق
    if (i.customId === 'close_btn') {
        await i.reply('🔒 سيتم حذف التذكرة خلال 3 ثوانٍ...');
        setTimeout(() => i.channel.delete(), 3000);
    }
});

client.login(process.env.TOKEN);
