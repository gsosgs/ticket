const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, AttachmentBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

// ضع هنا معرفات الرتب (Roles IDs) التي تريد منشنها
const supportRoles = [
    '1520054944034455713', // رتبة 1
    '1520044608216891402', // رتبة 2
    '1520057770395828305'  // رتبة 3
];

client.on('ready', () => {
    console.log(`[VOID SUPPORT] البوت يعمل الآن: ${client.user.tag}`);
});

// أمر إنشاء رسالة التكت (Setup)
client.on('messageCreate', async (message) => {
    if (message.content === '!ticket-setup') {
        const embed = new EmbedBuilder()
            .setTitle('🎫 | Void Support Center')
            .setDescription('اضغط على الزر أدناه لفتح تذكرة خاصة. سيقوم فريق الدعم بالرد عليك قريباً.')
            .setColor('#000000')
            .setFooter({ text: 'Void Server | Support System' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('فتح تذكرة')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📩')
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// نظام الأزرار والمنشن
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'open_ticket') {
        // 1. إنشاء القناة
        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                // إعطاء صلاحية للرتب المحددة ليروا التكت
                ...supportRoles.map(roleId => ({
                    id: roleId,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                }))
            ]
        });

        // 2. تحضير الصورة (تأكد أن الصورة موجودة في نفس مجلد الكود)
        const attachment = new AttachmentBuilder('image_0.png');

        // 3. تحضير نص المنشن
        const roleMentions = supportRoles.map(roleId => `<@&${roleId}>`).join(' ');

        // 4. إرسال الصورة والمنشن داخل التكت الجديد
        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`مرحباً بك في التذكرة الخاصة بك، ${interaction.user.username}`)
            .setDescription(`يرجى الانتظار، سيقوم أحد أعضاء فريق الدعم بالرد عليك قريباً.\n\n**المسؤولون عن التذكرة:** ${roleMentions}`)
            .setColor('#000000')
            .setImage('attachment://image_0.png'); // عرض الصورة من المرفقات

        const closeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('إغلاق التذكرة')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒')
        );

        await channel.send({
            content: roleMentions, // منشن للرتب ليظهر الإشعار
            embeds: [welcomeEmbed],
            files: [attachment]      // رفع الصورة
        });

        // 5. الرد على المستخدم الذي ضغط الزر
        interaction.reply({ content: `✅ تم إنشاء تذكرتك بنجاح: ${channel}`, ephemeral: true });
    }

    // نظام الإغلاق (كما هو)
    if (interaction.customId === 'close_ticket') {
        await interaction.reply('🔒 جاري إغلاق التذكرة وحذف القناة خلال 5 ثوانٍ...');
        setTimeout(() => interaction.channel.delete(), 5000);
    }
});

// لا تنسَ وضع التوكن هنا
client.login(process.env.TOKEN);
