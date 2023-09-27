const router = require('express').Router();
const { aprilFools } = require('../../../functions/utilities');

router
    .get('/player', async (req, res) => {
        const player = req.headers['x-player'];
        if (!player) return res.status(400).json({ error: 'Missing player header' });
        const AxiosReq = await req.axiosReq(`/game/all/all/${player}`, { baseURL: 'https://api.playhive.com/v0' })
        const formattedData = {
            hide: {
                xp: 0,
                played: 0,
                victories: 0,
                first_played: 0,
                deaths: 0,
                hider_kills: 0
            },
            main: {
                xuid: 0,
                username: "",
                username_cc: "",
                rank: "",
                first_played: 0,
                daily_login_streak: 0,
                longest_daily_login_streak: 0,
                hub_title_count: 0,
                hub_title_unlocked: [""],
                avatar_count: 0,
                avatar_unlocked: [{ url: "", name: "" }],
                costume_count: 0,
                friend_count: 0,
                equipped_hub_title: "",
                equipped_avatar: { url: "", name: "" },
                quest_count: 0,
                pets: [""],
                mounts: [""],
                hats: [""]
            },
            dr: {
                xp: 0,
                played: 0,
                victories: 0,
                first_played: 0,
                deaths: 0,
                checkpoints: 0,
                activated: 0,
                kills: 0
            },
            wars: {
                xp: 0,
                played: 0,
                first_played: 0,
                final_kills: 0,
                kills: 0,
                treasure_destroyed: 0,
                deaths: 0
            },
            murder: {
                xp: 0,
                played: 0,
                victories: 0,
                first_played: 0,
                deaths: 0,
                coins: 0,
                murders: 0,
                murderer_eliminations: 0
            },
            sg: {
                xp: 0,
                played: 0,
                first_played: 0,
                crates: 0,
                kills: 0,
                deaths: 0
            },
            sky: {
                xp: 0,
                played: 0,
                victories: 0,
                first_played: 0,
                ores_mined: 0,
                deaths: 0
            },
            ctf: {
                xp: 0,
                played: 0,
                victories: 0,
                first_played: 0,
                assists: 0,
                deaths: 0,
                flags_captured: 0,
                kills: 0,
                flags_returned: 0
            },
            drop: {
                xp: 0,
                played: 0,
                first_played: 0,
                blocks_destroyed: 0,
                powerups_collected: 0,
                vaults_used: 0,
                deaths: 0
            },
            ground: {
                xp: 0,
                played: 0,
                victories: 0,
                first_played: 0,
                blocks_destroyed: 0,
                powerups_collected: 0,
                vaults_used: 0,
                deaths: 0,
            },
            build: {
                xp: 0,
                played: 0,
                first_played: 0,
                rating_good_received: 0,
                rating_love_received: 0,
                rating_meh_received: 0,
                rating_okay_received: 0,
                rating_great_received: 0
            },
            party: {
                xp: 0,
                played: 0,
                victories: 0,
                first_played: 0,
                powerups_collected: 0,
                rounds_survived: 0
            },
            bridge: {
                xp: 0,
                first_played: 0,
            },
            grav: {
                xp: 0,
                played: 0,
                victories: 0,
                first_played: 0,
                deaths: 0,
                maps_completed: 0,
                maps_completed_without_dying: 0
            }
        };
        if (AxiosReq.status == 404) return res.sendError(13)
        Object
            .entries(JSON.parse(AxiosReq.data))
            .forEach(([key, value]) => {
                if (Array.isArray(value) && value.length == 0) return;
                if (typeof value === 'object') Object
                    .entries(value)
                    .filter(([key2]) => !(key2 === 'UUID'))
                    .forEach(([key2, value2]) => (formattedData[key][key2] = value2))
            })
        res.json(formattedData)
    })
    .get('/maps', async (req, res) => {
        const game = req.headers['x-game']
        if (!game) return res.status(400).json({ error: 'Missing game header' })
        const AxiosRes = await req.axiosReq
            .get(`/game/map/${game}`, { baseURL: 'https://api.playhive.com/v0' });
        if (AxiosRes.status == 404) return res.sendError(13)
        res.json(JSON.parse(AxiosRes.data))
    })
    .use((req, res, next) => {
        const { path } = req;
        const methodUsed = req.method.toUpperCase();
        let allowedMethods = router.stack.filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return next();
        allowedMethods.map(r => r.route.stack[0])
        allowedMethods = { ...allowedMethods[0] }
        allowedMethods = allowedMethods.route.methods;
        if (allowedMethods[methodUsed]) return next();
        res.status(405).render(
            `${aprilFools() ? 'aprilfools/' : ''}misc/405.pug`,
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
    })

module.exports = router;