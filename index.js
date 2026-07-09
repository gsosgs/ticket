const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] 
});

client.on('ready', () => {
    console.log(`[VOID] البوت يعمل الآن: ${client.user.tag}`);
});

// 1. أمر تهيئة التكت
client.on('messageCreate', async (message) => {
    if (message.content === '!ticket-setup') {
        const embed = new EmbedBuilder()
            .setTitle('🌌 | VOID Support Center')
            .setDescription('مرحباً بك في مركز دعم VOID.\nاضغط على الزر أدناه لفتح تذكرة خاصة بك.')
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
        const ticketNum = Math.floor(1000 + Math.random() * 9000);
        const channel = await i.guild.channels.create({
            name: `ticket-${ticketNum}`,
            permissionOverwrites: [
                { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });

        const embed = new EmbedBuilder()
            .setColor('#2F3136')
            .addFields(
                { name: '👤 | مالك التذكرة', value: `<@${i.user.id}>`, inline: false },
                { name: '🛡️ | مشرف التذاكر', value: 'بانتظار الاستلام...', inline: false },
                { name: '📅 | تاريخ التذكرة', value: new Date().toLocaleDateString(), inline: true },
                { name: '🔢 | رقم التذكرة', value: ticketNum.toString(), inline: true },
                { name: '❓ | قسم التذكرة', value: 'الدعم الفني', inline: false }
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
            new ButtonBuilder().setCustomId('claim').setLabel('استلام').setStyle(ButtonStyle.Success).setEmoji('💼')
        );

        await channel.send({ content: `مرحباً <@${i.user.id}>`, embeds: [embed], components: [row] });
        i.reply({ content: `✅ تم فتح التذكرة: ${channel}`, ephemeral: true });
    }

    // زر الاستلام مع الإيموجي الخاص بك
    if (i.customId === 'claim') {
        const ticketEmoji = '<a:AcC_ticket:1524572003523362906>';
        const embed = EmbedBuilder.from(i.message.embeds[0])
            .spliceFields(1, 1, { name: '🛡️ | مشرف التذاكر', value: `${ticketEmoji} <@${i.user.id}>`, inline: false });
        
        await i.update({ embeds: [embed] });
        await i.channel.send(`تم استلام التذكرة بواسطة ${i.user} ${ticketEmoji}`);
    }

    // زر الإغلاق
    if (i.customId === 'close_ticket') {
        await i.reply('🔒 سيتم حذف التذكرة خلال 5 ثوانٍ...');
        setTimeout(() => i.channel.delete(), 5000);
    }
});

client.login(process.env.TOKEN);
