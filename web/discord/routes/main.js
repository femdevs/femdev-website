/* eslint-disable camelcase */
require("dotenv").config();
const crypto = require("crypto");
const axios = require("axios");
const router = require("express").Router();
const { SQL } = require("sql-template-strings");
/** @type {Map<string, TokenSet>} */
const store = new Map();
class TokenSet {
	constructor({ access_token, refresh_token, expires_in }) {
		this.access_token = access_token;
		this.refresh_token = refresh_token;
		this.expires_in = expires_in;
	}
	access = async () => {
		if (Date.now() > this.expires_in) {
			const token = (await Axios.post(
				"oauth2/token",
				new URLSearchParams(
					new Request("refresh_token", {
						refresh_token: this.refresh_token,
					}),
				),
			).then(res => res.data));
			this.access_token = token.access_token;
			this.refresh_token = token.refresh_token;
			this.expires_in = Date.now() + token.expires_in * 1e3;
		}
		return this.access_token;
	};
	refresh = () => this.refresh_token;
	expires = () => this.expires_in;
	set = (token, value) => {
		this[token] = value;
		return this;
	};
}
const Axios = axios.create({
	baseURL: "https://discord.com/api/v10",
	validateStatus: status => status >= 200 && status < 400,
	headers: { "Content-Type": "application/x-www-form-urlencoded" },
	responseType: "json",
});
const configs = new Map()
	.set("DiscordToken", process.env.DISCORD_TOKEN)
	.set("DiscordClientId", process.env.DISCORD_CLIENT_ID)
	.set("DiscordClientSecret", process.env.DISCORD_CLIENT_SECRET)
	.set("DiscordRedirectUri", process.env.DISCORD_REDIRECT_URI);
class Request {
	constructor(grantType, extra) {
		this.client_id = configs.get("DiscordClientId");
		this.client_secret = configs.get("DiscordClientSecret");
		this.grant_type = grantType;
		Object.assign(this, extra);
	}
}
const getOAuthUrl = () => {
	const url = new URL("/api/v10/oauth2/authorize", "https://discord.com");
	url.search = new URLSearchParams({
		client_id: configs.get("DiscordClientId"),
		redirect_uri: configs.get("DiscordRedirectUri"),
		response_type: "code",
		scope: ["role_connections.write", "identify", "email", "connections", "guilds"].join(" "),
		prompt: "consent",
	}).toString();
	return url.toString();
};
const getOAuthTokens = async code =>
	new TokenSet(
		await Axios
			.post(
				new URL("/api/v10/oauth2/token", "https://discord.com"),
				new URLSearchParams(
					new Request("authorization_code", {
						code,
						redirect_uri: configs.get("DiscordRedirectUri"),
					}),
				),
			)
			.then(res => res.data),
	);
const getUserData = async req =>
	await Axios
		.get("oauth2/@me", { headers: { Authorization: `Bearer ${await req.session.token.access()}` } })
		.then(res => res.data);
const updateMetadata = async req => {
	const connection = await req.Database.pool.connect();
	const { rows: StaffRows } = await connection.query(SQL`SELECT * FROM public.staff WHERE userid = ${req.session.userId}`);
	await Axios
		.put(
			`users/@me/applications/${configs.get("DiscordClientId")}/role-connection`,
			{
				platform_name: "FemDevs Internals",
				platform_username: StaffRows[0]?.displayname,
				metadata: {
					isvolunteer: String(Number(StaffRows.length > 0)),
					isowner: String(Number(StaffRows.length > 0 && StaffRows[0].role === "Owner")),
				},
			},
			{
				headers: {
					Authorization: `Bearer ${await req.session.token.access()}`,
					"Content-Type": "application/json",
				},
			},
		);
};

router
	.get("/lr", async (req, res) => {
		res.redirect(getOAuthUrl());
	})
	.get("/oauth2", async (req, res) => {
		try {
			const { code } = req.query;
			const token = await getOAuthTokens(code);
			req.session.token = token.set("expires_at", Date.now() + token.expires() * 1000);
			const meData = await getUserData(req);
			req.session.userId = meData.user.id;
			await updateMetadata(req);
			res.send("You did it! Now go back to Discord.");
		} catch (err) {
			res.sendStatus(500);
		}
	})
	.post("/update-metadata", async (req, res) => {
		try {
			await updateMetadata(req);
			res.sendStatus(204);
		} catch (err) {
			res.sendStatus(500);
		}
	});

module.exports = router;
