import { webhook, accounts, delay, color } from '../../config.json';
import { WebhookClient, MessageEmbed } from 'discord.js';
import axios from 'axios';

export default class Monitor {
	protected store = new Map();

	public async init(): Promise<void> {
		setInterval(async () => {
			for (const a of accounts) {
				const id = a.replace(/\r?\n|\r/g, '');
				try {
					const req = await axios.get(`https://instagram.com/${id}/`);
					const json = JSON.parse(req.data.match(/<script type="text\/javascript">window\._sharedData = (.*)<\/script>/)[1].slice(0, -1));
					if (json.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges[0]) {
						const latest = json.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges[0].node;
						if (!latest) return;
						if (this.store.has(id)) {
							const current = this.store.get(id);
							if (current !== latest.id) {
								this.store.set(id, latest.id);
								this.post(id, `https://instagram.com/${id}`, latest.display_url, 'Caption unavailable.');
							}
							this.store.set(id, latest.id);
							this.post(id, `https://instagram.com/${id}`, latest.display_url, 'Caption unavailable.');
						}
					}
				} catch (err) {
					console.error(err);
				}
			}
		}, delay);
		console.info('[MONITOR] Monitor initialized.');
	}

	public async post(id: string, url: string, img: string | undefined, caption: string): Promise<void> {
		const embed = new MessageEmbed()
			.setColor(color)
			.setFooter('© Sycer Development')
			.setTitle(`New Post from ${id}!`)
			.setDescription(caption)
			.setURL(url)
			.setTimestamp();
		if (img) {
			embed.setImage(img);
		}
		const hook = webhook.link.split('/');
		const whID = hook[hook.length - 2];
		const whToken = hook[hook.length - 1];
		try {
			new WebhookClient(whID, whToken).send({ embeds: [embed] });
		} catch (err) {
			console.error;
		}
	}
}
