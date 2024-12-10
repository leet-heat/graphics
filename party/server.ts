import type * as Party from 'partykit/server';
import { GameServerContext, ReadOnlyContestant, Question } from '../src/types';
import { z } from 'zod';
import { json } from '../src/util/json';

export default class GameServer implements Party.Server {
	options: Party.ServerOptions = { hibernate: true };
	game: GameServerContext = {
		round: 1,
		category: null,
		question: null,
		chooser: null,
		answered: new Set<number>(),
	};
	contestants: Map<string, ReadOnlyContestant> = new Map();

	constructor(readonly room: Party.Room) {}

	onConnect(conn: Party.Connection) {
		// on WebSocket connection, send the current reaction counts
		// console.log(conn.id);
		if (this.game.category) {
			conn.send(json({ type: 'category', data: this.game.category }));
		}

		if (this.game.question) {
			conn.send(json({ type: 'question', data: this.game.question }));
		}

		if (this.game.chooser) {
			conn.send(json({ type: 'chooser', data: this.game.chooser }));
		}

		if (this.game.round) {
			conn.send(json({ type: 'round', data: this.game.round }));
		}

		this.contestants.forEach((c, k) => {
			conn.send(json({ type: 'contestant', data: { ...c, position: k } }));
		});
	}

	onMessage(message: string, sender: Party.Connection) {
		const parsed = JSON.parse(message);

		try {
			switch (parsed.type) {
				case 'round':
					const newRound = z.number().parse(parsed.data);
					this.game.round = newRound;
					break;

				case 'category':
					const newCategory = z.string().parse(parsed.data);
					this.game.category = newCategory;
					break;

				case 'question':
					if (!parsed.data) {
						break;
					}

					const newQuestion = Question.parse(parsed.data);
					this.game.question = newQuestion;
					break;

				case 'chooser':
					const newChooser = ReadOnlyContestant.parse(parsed.data);
					this.game.chooser = newChooser;
					break;

				case 'contestant':
					console.log(parsed.data);
					const updatedContestant = ReadOnlyContestant.parse(parsed.data);
					this.contestants.set(updatedContestant.name, updatedContestant);
					break;

				default:
					console.log(`unknown type ${parsed.type}`);
			}
		} catch (err) {
			console.error(`error handling ${parsed.type}`);
			console.log(parsed.data);
		}

		this.room.broadcast(message, [sender.id]);
	}
}

GameServer satisfies Party.Worker;
