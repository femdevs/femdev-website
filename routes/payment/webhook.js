const express = require('express')
const router = express.Router()
const DiscordJS = require('discord.js')
require('dotenv').config()

router
    .use(express.json())
    .post('/', async (req, res) => {
        // accept Stripe webhook events and forward them to discord in a proper format
        const DiscordWebhook = new DiscordJS.WebhookClient({ url: process.env.DISCORD_WEBHOOK })
        const { body: {type} } = req;
        const embed = new DiscordJS.EmbedBuilder()
            .setTitle(`Stripe Webhook Event`)
            .setColor('#00FF00')
            .setDescription(`**Event Type:** ${type}`)
            .setTimestamp()
            .setFooter(`Stripe Webhook Event`)
        DiscordWebhook.send({
            embeds: [embed],
            username: 'Stripe',
            avatarURL: 'https://b.stripecdn.com/manage-statics-srv/assets/public/favicon.ico'
        })
        res.status(200).send()
    })
    .use((req, res, next) => {
        const { path } = req;
        const methodUsed = req.method.toUpperCase();
        let allowedMethods = router.stack.filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return next();
        allowedMethods.map(r => r.route.stack[0])
        allowedMethods = { ...allowedMethods[0] }
        allowedMethods = allowedMethods.route.methods;
        if (req.method === 'OPTIONS') return res.setHeader('Allow', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).status(204).send();
        if (allowedMethods[methodUsed]) return next();
        res.status(405).render(
            `${require('../functions/utilities').aprilFools() ? 'aprilfools/' : ''}misc/405.pug`,
            {
                errData: {
                    path,
                    allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                    methodUsed: methodUsed,
                },
                meta: {
                    title: '405 - Method Not Allowed',
                    desc: '405 - Method Not Allowed',
                    url: 'https://thefemdevs.com/errors/405',
                }
            }
        );
    });

module.exports = router