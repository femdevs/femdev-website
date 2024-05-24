/* eslint-disable camelcase */
/* eslint-disable max-len */
const router = require('express').Router();

const User = require('../../../../functions/userMgr');

class HivePlayer {
	constructor(data) {
		this.hide = new HivePlayerGame({ victories: 0, deaths: 0, hider_kills: 0 });
		this.main = new HivePlayerGlobal();
		this.dr = new HivePlayerGame({ victories: 0, deaths: 0, checkpoints: 0, activated: 0, kills: 0 });
		this.wars = new HivePlayerGame({ final_kills: 0, kills: 0, treasure_destroyed: 0, deaths: 0 });
		this.murder = new HivePlayerGame({ victories: 0, deaths: 0, coins: 0, murders: 0, murderer_eliminations: 0 });
		this.sg = new HivePlayerGame({ crates: 0, kills: 0, deaths: 0 });
		this.sky = new HivePlayerGame({ victories: 0, ores_mined: 0, deaths: 0 });
		this.ctf = new HivePlayerGame({ victories: 0, assists: 0, deaths: 0, flags_captured: 0, kills: 0, flags_returned: 0 });
		this.drop = new HivePlayerGame({ blocks_destroyed: 0, powerups_collected: 0, vaults_used: 0, deaths: 0 });
		this.ground = new HivePlayerGame({ victories: 0, blocks_destroyed: 0, powerups_collected: 0, vaults_used: 0, deaths: 0 });
		this.build = new HivePlayerGame({ rating_good_received: 0, rating_love_received: 0, rating_meh_received: 0, rating_okay_received: 0, rating_great_received: 0 });
		this.party = new HivePlayerGame({ victories: 0, powerups_collected: 0, rounds_survived: 0 });
		this.bridge = new HivePlayerGame({});
		this.grav = new HivePlayerGame({ victories: 0, deaths: 0, maps_completed: 0, maps_completed_without_dying: 0 });
	}
}

class HivePlayerGlobal {
	constructor() {
		this.xuid = 0;
		this.username = "";
		this.username_cc = "";
		this.rank = "";
		this.first_played = 0;
		this.daily_login_streak = 0;
		this.longest_daily_login_streak = 0;
		this.hub_title_count = 0;
		this.hub_title_unlocked = [""];
		this.avatar_count = 0;
		this.avatar_unlocked = [{ url: "", name: "" }];
		this.costume_count = 0;
		this.friend_count = 0;
		this.equipped_hub_title = "";
		this.equipped_avatar = { url: "", name: "" };
		this.quest_count = 0;
		this.pets = [""];
		this.mounts = [""];
		this.hats = [""];
	}
}

class HivePlayerGame {
	constructor(data) {
		this.xp = 0;
		this.played = 0;
		this.first_played = 0;
		Object.assign(this, data);
	}
}

router
	.get('/player', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Minecraft::Hive.Player', allowMgr: true }))) return;
		const player = req.headers['x-player'];
		if (!player) return res.status(400).json({ error: 'Missing player header' });
		const AxiosReq = await req.axiosReq(`/game/all/all/${player}`, { baseURL: 'https://api.playhive.com/v0' });
		if (AxiosReq.status === 404) return res.sendError(22);
		const PlayerData = new HivePlayer();
		Object
			.entries(JSON.parse(AxiosReq.data))
			.forEach(([key, value]) => {
				if (Array.isArray(value) && value.length === 0) return;
				if (typeof value === 'object') {
					Object
						.entries(value)
						.filter(([key2]) => !(key2 === 'UUID'))
						.forEach(([key2, value2]) => (PlayerData[key][key2] = value2));
				}
			});
		res.json(PlayerData);
	})
	.get('/maps', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Minecraft::Hive.Map', allowMgr: true }))) return;
		const game = req.headers['x-game'];
		if (!game) return res.status(400).json({ error: 'Missing game header' });
		const AxiosRes = await req.axiosReq(`/game/map/${game}`, { baseURL: 'https://api.playhive.com/v0' });
		if (AxiosRes.status === 404) return res.sendError(22);
		res.json(JSON.parse(AxiosRes.data));
	})
	.use((req, res, next) => {
		const { path } = req;
		const methodUsed = req.method.toUpperCase();
		let allowedMethods = router.stack.filter(routerObj => routerObj.route && routerObj.route.path === path);
		if (allowedMethods.length === 0) return next();
		allowedMethods.map(routerObj => routerObj.route.stack[0]);
		allowedMethods = { ...allowedMethods[0] };
		allowedMethods = allowedMethods.route.methods;
		if (req.method === 'OPTIONS')
			return res.setHeader('Allow', Object.keys(allowedMethods)
				.map(verb => verb.toUpperCase()).join(', '))
				.setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(verb => verb.toUpperCase()).join(', '))
				.status(204)
				.send();
		if (allowedMethods[methodUsed]) return next();
		return res.status(405).render(
			`misc/405.pug`,
			req.getErrPage(405, { path, allowedMethods, methodUsed }),
		);
	});

module.exports = router;
