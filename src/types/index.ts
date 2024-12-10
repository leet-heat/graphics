import { z } from 'zod';

export const Question = z.object({
	episode: z.number(),
	round: z.number(),
	category: z.string(),
	id: z.number(),
	type: z.string(),
	question: z.object({
		text: z.string(),
		image: z.string().optional(),
		options: z
			.object({
				A: z.string(),
				B: z.string(),
				C: z.string(),
				D: z.string(),
			})
			.optional(),
		answer: z.string(),
	}),
});

export type Question = z.infer<typeof Question>;

export const ReadOnlyContestant = z.object({
	name: z.string(),
	correct: z
		.array(z.number())
		.transform((val) => new Set(val))
		.default([]),
	incorrect: z
		.array(z.number())
		.transform((val) => new Set(val))
		.default([]),
	score: z.number().default(0),
});

export type ReadOnlyContestant = z.infer<typeof ReadOnlyContestant>;

export const Contestant = ReadOnlyContestant.merge(
	z.object({
		addCorrect: z.function().args(Question).returns(z.void()),
		addIncorrect: z.function().args(Question).returns(z.void()),
	}),
);

export type Contestant = z.infer<typeof Contestant>;

export const GameServerContext = z.object({
	round: z.number().default(1),
	category: z.string().nullable().default(null),
	question: Question.nullable().default(null),
	chooser: ReadOnlyContestant.nullable().default(null),
	answered: z.set(z.number()).default(new Set()),
});

export type GameServerContext = z.infer<typeof GameServerContext>;
