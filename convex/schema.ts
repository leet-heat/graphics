import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { type Game } from '../src/types';
import { Snapshot } from 'xstate';

const Question = v.object({
	id: v.string(),
	category: v.string(),
	round: v.number(),
	text: v.string(),
	options: v.optional(
		v.object({
			A: v.string(),
			B: v.string(),
			C: v.string(),
			D: v.string(),
		}),
	),
	image: v.optional(v.string()),
	answer: v.string(),
	complete: v.boolean(),
	buzzedIn: v.array(v.string()),
});

export const Contestant = v.object({
	id: v.string(),
	name: v.string(),
	score: v.number(),
	spiceLevel: v.number(),
	correct: v.array(v.string()),
	incorrect: v.array(v.string()),
	isBuzzedIn: v.boolean(),
	isRoundLeader: v.boolean(),
});

export const Category = v.object({
	name: v.string(),
	sponsor: v.string(),
	isLeetHeat: v.boolean(),
});

export const Categories = v.record(v.string(), Category);

export const gameContext = v.object({
	slug: v.string(),
	categories: Categories,
	questions: v.record(v.string(), Question),
	contestants: v.array(Contestant),
	current_round: v.number(),
	current_category: v.union(v.string(), v.null()),
	current_question: v.union(Question, v.null()),
});

export const game = v.object({
	status: v.string(),
	context: gameContext,
	value: v.string(),
	children: v.record(v.string(), v.object({})),
	historyValue: v.record(v.string(), v.string()),
	tags: v.optional(v.array(v.string())),
});

const context = defineTable(game);

// const contestants = defineTable({
// 	name: v.string(),
// });

// const categories = defineTable({
// 	name: v.string(),
// });

// const questions = defineTable({
// 	category: v.id('categories'),
// 	round: v.number(),
// 	text: v.string(),
// 	options: v.optional(
// 		v.object({
// 			A: v.string(),
// 			B: v.string(),
// 			C: v.string(),
// 			D: v.string(),
// 		}),
// 	),
// 	image: v.optional(v.string()),
// 	answer: v.string(),
// });

// const games = defineTable({
// 	status: v.union(
// 		v.literal('scheduled'),
// 		v.literal('active'),
// 		v.literal('finished'),
// 	),
// 	categories: v.record(v.id('categories'), v.boolean()),
// 	questions: v.record(v.id('questions'), v.boolean()),
// 	contestants: v.record(
// 		v.id('contestants'),
// 		v.object({
// 			id: v.id('contestants'),
// 			name: v.string(),
// 			score: v.number(),
// 			spiceLevel: v.number(),
// 			correct: v.array(v.id('questions')),
// 			incorrect: v.array(v.id('questions')),
// 		}),
// 	),
// 	state: v.object({
// 		round: v.number(),
// 		up: v.id('contestants'),
// 		category: v.id('categories'),
// 		question: v.id('questions'),
// 	}),
// });

export default defineSchema({
	context,
});
