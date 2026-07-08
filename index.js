const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

// تأكد من وضع معرفات الرتب بشكل صحيح هنا
const supportRoles = ['1520054944034455713', '1520044608216891402', '1520057770395828305'];

client.on('ready', () => {
    console.log(`[VOID SUPPORT] البوت يعمل الآن: ${client.user.tag}`);
});

// أمر إرسال رسالة التكت
client.on('messageCreate', async (message) => {
    if (message.content === '!ticket-setup') {
        const embed = new EmbedBuilder()
            .setTitle('🎫 | Void Support Center')
            .setDescription('اضغط على الزر أدناه لفتح تذكرة خاصة.')
            .setColor('#000000');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('فتح تذكرة')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// نظام فتح التكت
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'open_ticket') {
        
        // 1. تعريف صلاحيات القناة
        let permissions = [
            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ];

        // إضافة صلاحيات الرتب
        supportRoles.forEach(roleId => {
            permissions.push({ id: roleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] });
        });

        // 2. إنشاء القناة
        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            permissionOverwrites: permissions
        });

        // 3. إرسال المنشن والرسالة
        const roleMentions = supportRoles.map(roleId => `<@&${roleId}>`).join(' ');
        
        await channel.send({
            content: `${roleMentions} - مستخدم جديد فتح تذكرة: ${interaction.user}`,
            embeds: [
                new EmbedBuilder()
                    .setTitle('تذكرة جديدة')
                    .setDescription('يرجى الانتظار حتى يرد عليك أحد أعضاء فريق الدعم.')
                    .setColor('#000000')
            ]
        });

        await interaction.reply({ content: `✅ تم فتح التذكرة: ${channel}`, ephemeral: true });
    }
});

client.login(process.env.TOKEN);
