import { z } from 'zod';

export const Question = z.object({
	id: z.string(),
	category: z.string(),
	round: z.number().int().default(1),
	text: z.string(),
	options: z
		.object({
			A: z.string(),
			B: z.string(),
			C: z.string(),
			D: z.string(),
		})
		.optional(),
	image: z.string().url().optional(),
	answer: z.string(),
	complete: z.boolean().default(false),
	buzzedIn: z.array(z.string()).default([]),
});

export const Contestant = z.object({
	id: z.string(),
	name: z.string(),
	score: z.number().int().default(0),
	spiceLevel: z.number().int().default(0),
	correct: z.set(z.string()).default(new Set()),
	incorrect: z.set(z.string()).default(new Set()),
	isBuzzedIn: z.boolean().default(false),
	isRoundLeader: z.boolean().default(false),
});

export const Category = z.object({
	name: z.string(),
	sponsor: z.string(),
	isLeetHeat: z.boolean().default(false),
});

export const Categories = z.record(z.string(), Category);

export const Game = z.object({
	categories: Categories,
	questions: z.record(z.string(), Question),
	contestants: z.array(Contestant).length(2),
	current_round: z.number().int().default(1),
	current_category: z.string().nullable().default(null),
	current_question: Question.nullable().default(null),
});

export type Question = z.infer<typeof Question>;
export type Contestant = z.infer<typeof Contestant>;
export type Categories = z.infer<typeof Categories>;
export type Game = z.infer<typeof Game>;
