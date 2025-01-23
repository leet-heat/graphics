// @ts-nocheck ignore this for now to avoid build breaks
import { setup, assign, assertEvent } from 'xstate';
import { type Question, type Game, Categories } from '../../types';

export const events = [
	'game-start',
	'round.start',
	'category.start',
	'question.start',
	'question.buzz-in',
	'category.reveal-final',
	'category.wheel-select',
	'wheel.leet-heat',
	'question.no-buzzer',
	'question.answer-correct',
	'question.answer-incorrect',
	'question.',
	'contestant.place-wager',
	'CHANCE_FOR_OPPONENT',
	'ALL_CONTESTANTS_HAVE_ANSWERED_INCORRECTLY',
	'REMAINING_CONTESTANT_CAN_ANSWER',
	'NO_CATEGORIES_REMAIN',
	'CATEGORIES_REMAIN',
	'NO_QUESTIONS_REMAIN',
	'QUESTIONS_REMAIN',
	'UNDO_LEET_HEAT',
	'UNDO_INCORRECT',
	'UNDO_ROUND_CHANGE',
	'UNDO_CATEGORY',
	'UNDO_BUZZ_IN',
	'SET_CONTESTANT_SCORE',
	'SET_CONTESTANT_SPICE_LEVEL',
] as const;

export type GameEvents =
	| { type: 'BEGIN_GAME'; data: Game }
	| { type: 'START_ROUND' }
	| { type: 'CHOOSE_CATEGORY'; category: string }
	| { type: 'LAND_ON_CATEGORY'; category: string }
	| { type: 'LAND_ON_LEET_HEAT' }
	| { type: 'CONTESTANT_BUZZES_IN'; contestant: string }
	| { type: 'ANSWER_IS_INCORRECT' }
	| { type: 'CHANCE_FOR_OPPONENT' }
	| { type: 'ANSWER_IS_CORRECT' }
	| { type: 'REMAINING_CONTESTANT_CAN_ANSWER' }
	| { type: 'ALL_CONTESTANTS_HAVE_ANSWERED_INCORRECTLY' }
	| { type: 'NO_BUZZER_PRESSED' }
	| { type: 'NO_QUESTIONS_REMAIN' }
	| { type: 'QUESTIONS_REMAIN' }
	| { type: 'NO_CATEGORIES_REMAIN' }
	| { type: 'CATEGORIES_REMAIN'; params?: { allContestants?: boolean } }
	| { type: 'CHECK_ROUND_TYPE' }
	| { type: 'REVEAL_FINAL_CATEGORY' }
	| { type: 'PLACE_WAGER' }
	| { type: 'UNDO_LEET_HEAT' }
	| { type: 'UNDO_INCORRECT' }
	| { type: 'UNDO_ROUND_CHANGE' }
	| { type: 'UNDO_CATEGORY' }
	| {
			type: 'SET_CONTESTANT_SCORE';
			data: { contestant: string; score: number };
	  }
	| {
			type: 'SET_CONTESTANT_SPICE_LEVEL';
			data: { contestant: string; spiceLevel: number };
	  };

export const machine = setup({
	types: {
		context: {} as {},
		events: {} as
			| { type: 'contestant.override-score'; contestant: string; score: number }
			| {
					type: 'contestant.override-spice-level';
					contestant: string;
					spiceLevel: number;
			  }
			| { type: 'game.start' }
			| { type: 'wheel.leet-heat' }
			| { type: 'wheel.category' }
			| { type: 'category.choose' },
	},
	actions: {
		'override score': assign({}),
		'override spice level': assign({}),
		'load game context': assign({}),
		'increase spice level': assign({}),
		'set category': assign({}),
		'set question': assign({}),
	},
	guards: {
		isCategoryComplete: () => {
			return true;
		},
		isRoundComplete: () => {
			return true;
		},
		isQuestionComplete: () => {
			return true;
		},
		isFinalRound: () => {
			return true;
		},
	},
}).createMachine({
	id: 'Leet Heat Game Logic',
	description: '',
	context: {},
	initial: 'IDLE',
	states: {
		IDLE: {
			on: {
				'game.start': {
					target: 'round.spinning-wheel',
					actions: ['load game context'],
				},
			},
		},
		round: {
			states: {
				'spinning-wheel': {
					on: {
						'wheel.leet-heat': {
							target: 'spicy-bite.leet-heat',
							actions: ['increase spice level'],
						},
						'wheel.category': {
							target: 'round.announce-category',
							actions: ['set category', 'set question'],
						},
					},
				},
				'announce-category': {},
				'spicy-bite.leet-heat': {
					on: {
						'category.choose': {
							target: 'round.announce-category',
							actions: ['set category'],
						},
					},
				},
			},
		},
	},
	on: {
		'contestant.override-score': {
			actions: ['override score'],
		},
		'contestant.override-spice-level': {
			actions: ['override spice level'],
		},
	},
});

export const machineOld = setup({
	types: {
		context: {} as Game,
		events: {} as GameEvents,
	},
	actions: {
		beginGame: assign(({ event }) => {
			assertEvent(event, 'BEGIN_GAME');

			// TODO make a way to randomize first round leader
			// set a round leader if one isn't set
			event.data.contestants.at(0)!.isRoundLeader = true;

			return event.data;
		}),
		setCategory: assign({
			current_category: ({ event }) => {
				// TODO figure out how dynamic params work
				// @see https://stately.ai/docs/typescript#dynamic-parameters
				assertEvent(event, ['LAND_ON_CATEGORY', 'CHOOSE_CATEGORY']);

				return event.category;
			},
		}),
		clearCategory: assign({
			current_category: null,
		}),
		setQuestion: assign({
			current_question: ({ context }) => {
				console.log('setQuestion');
				return Object.values(context.questions).find((q) => {
					return (
						q.category === context.current_category &&
						q.complete !== true &&
						q.round === context.current_round
					);
				}) as Question;
			},
		}),
		setBuzzedInContestant: assign({
			questions: ({ context, event }) => {
				// TODO figure out how dynamic params work
				// @see https://stately.ai/docs/typescript#dynamic-parameters
				assertEvent(event, 'CONTESTANT_BUZZES_IN');

				if (!event.contestant || !context.current_question) {
					return context.questions;
				}

				context.questions[context.current_question.id].buzzedIn.push(
					event.contestant,
				);

				console.log(context.questions[context.current_question.id]);

				return context.questions;
			},
			contestants: ({ context, event }) => {
				// TODO figure out how dynamic params work
				// @see https://stately.ai/docs/typescript#dynamic-parameters
				assertEvent(event, 'CONTESTANT_BUZZES_IN');

				return context.contestants.map((contestant) => {
					return {
						...contestant,
						isBuzzedIn: contestant.name === event.contestant,
					};
				});
			},
		}),
		clearBuzzedInContestant: assign({
			contestants: ({ context }) => {
				console.log('clearBuzzedInContestant');
				return context.contestants.map((contestant) => {
					return {
						...contestant,
						isBuzzedIn: false,
					};
				});
			},
		}),
		undoBuzzedInContestant: assign({
			questions: ({ context }) => {
				const currentlyBuzzedIn = context.contestants.find((c) => c.isBuzzedIn);

				if (!currentlyBuzzedIn || !context.current_question) {
					return context.questions;
				}

				context.questions[context.current_question.id].buzzedIn =
					context.questions[context.current_question.id].buzzedIn.filter(
						(c) => c !== currentlyBuzzedIn.name,
					);

				return context.questions;
			},
			contestants: ({ context }) => {
				return context.contestants.map((contestant) => {
					return {
						...contestant,
						isBuzzedIn: false,
					};
				});
			},
		}),
		trackCorrectAnswer: assign({
			contestants: ({ context }) => {
				return context.contestants.map((contestant) => {
					if (contestant.isBuzzedIn && context.current_question) {
						return {
							...contestant,
							correct: contestant.correct.add(context.current_question.id),
						};
					}

					return { ...contestant, isRoundLeader: false };
				});
			},
		}),
		trackIncorrectAnswer: assign({
			contestants: ({ context }) => {
				return context.contestants.map((contestant) => {
					if (contestant.isBuzzedIn && context.current_question) {
						return {
							...contestant,
							incorrect: contestant.incorrect.add(context.current_question.id),
						};
					}

					return { ...contestant, isRoundLeader: false };
				});
			},
		}),
		increasePoints: assign({
			contestants: ({ context }) => {
				return context.contestants.map((contestant) => {
					if (contestant.isBuzzedIn) {
						return {
							...contestant,
							// TODO handle final round score increase
							score: contestant.score + context.current_round * 100,
						};
					}

					return { ...contestant, isRoundLeader: false };
				});
			},
		}),
		setAsRoundLeader: assign({
			contestants: ({ context }) => {
				return context.contestants.map((contestant) => {
					if (contestant.isBuzzedIn) {
						return {
							...contestant,
							isRoundLeader: true,
						};
					}

					return {
						...contestant,
						isRoundLeader: false,
					};
				});
			},
		}),
		reducePoints: assign({
			contestants: ({ context }) => {
				return context.contestants.map((contestant) => {
					if (contestant.isBuzzedIn) {
						return {
							...contestant,
							score: contestant.score - context.current_round * 100,
						};
					}

					return contestant;
				});
			},
		}),
		increaseSpiceLevel: assign({
			contestants: (
				{ context, event },
				params?: { allContestants?: boolean },
			) => {
				// TODO figure out how dynamic params work
				// @see https://stately.ai/docs/typescript#dynamic-parameters
				assertEvent(event, [
					'CHANCE_FOR_OPPONENT',
					'LAND_ON_LEET_HEAT',
					'CATEGORIES_REMAIN',
				]);

				return context.contestants.map((contestant) => {
					let spiceLevelIncrease = 0;
					if (event.type === 'LAND_ON_LEET_HEAT' && contestant.isRoundLeader) {
						spiceLevelIncrease = 1;
					}

					if (event.type === 'CHANCE_FOR_OPPONENT' && contestant.isBuzzedIn) {
						spiceLevelIncrease = 1;
					}

					if (
						event.type === 'CATEGORIES_REMAIN' &&
						params?.allContestants === true
					) {
						console.log('increasing spice level for everyone');
						spiceLevelIncrease = 1;
					}

					return {
						...contestant,
						spiceLevel: contestant.spiceLevel + spiceLevelIncrease,
					};
				});
			},
		}),
		decreaseSpiceLevel: assign({
			contestants: (
				{ context, event },
				params: { allContestants?: boolean },
			) => {
				// TODO figure out how dynamic params work
				// @see https://stately.ai/docs/typescript#dynamic-parameters
				assertEvent(event, [
					'UNDO_LEET_HEAT',
					'UNDO_INCORRECT',
					'UNDO_ROUND_CHANGE',
				]);

				return context.contestants.map((contestant) => {
					let spiceLevelDecrease = 0;
					if (event.type === 'UNDO_LEET_HEAT' && contestant.isRoundLeader) {
						spiceLevelDecrease = 1;
					}

					if (event.type === 'UNDO_INCORRECT' && contestant.isBuzzedIn) {
						spiceLevelDecrease = 1;
					}

					if (
						event.type === 'UNDO_ROUND_CHANGE' &&
						params?.allContestants === true
					) {
						console.log('decreasing spice level for everyone');
						spiceLevelDecrease = 1;
					}

					return {
						...contestant,
						spiceLevel: contestant.spiceLevel - spiceLevelDecrease,
					};
				});
			},
		}),
		clearQuestion: assign({
			current_question: null,
		}),
		markQuestionComplete: assign({
			questions: ({ context }) => {
				console.log('markQuestionComplete');
				const question = context.current_question;

				if (!question) {
					throw new Error('no question set');
				}

				return {
					...context.questions,
					[question.id]: {
						...question,
						complete: true,
					},
				};
			},
		}),
		markCategoryAsLeetHeat: assign({
			categories: ({ context }) => {
				const category = context.current_category;

				if (!category) {
					throw new Error('no category set');
				}

				const updatedCategories = {
					...context.categories,
					[category]: {
						...context.categories[category],
						isLeetHeat: true,
					},
				};

				console.log(updatedCategories);

				return updatedCategories;
			},
		}),
		resetCategories: assign({
			categories: ({ context }) => {
				let reset: Categories = {};

				for (let category of Object.values(context.categories)) {
					reset[category.name] = {
						...category,
						isLeetHeat: false,
					};
				}

				return reset;
			},
		}),
		increaseRoundNumber: assign({
			current_round: ({ context }) => context.current_round + 1,
		}),
		setWagerAmount: function ({ context, event }, params) {
			// Add your action code here
			// ...
		},
		calculateFinalScores: function ({ context, event }, params) {
			// Add your action code here
			// ...
		},
		setContestantScore: assign({
			contestants: ({ context, event }) => {
				// TODO figure out how dynamic params work
				// @see https://stately.ai/docs/typescript#dynamic-parameters
				assertEvent(event, 'SET_CONTESTANT_SCORE');

				return context.contestants.map((contestant) => {
					if (contestant.name === event.data.contestant) {
						return {
							...contestant,
							score: event.data.score,
						};
					}

					return contestant;
				});
			},
		}),
		setContestantSpiceLevel: assign({
			contestants: ({ context, event }) => {
				// TODO figure out how dynamic params work
				// @see https://stately.ai/docs/typescript#dynamic-parameters
				assertEvent(event, 'SET_CONTESTANT_SPICE_LEVEL');

				return context.contestants.map((contestant) => {
					if (contestant.name === event.data.contestant) {
						return {
							...contestant,
							spiceLevel: event.data.spiceLevel,
						};
					}

					return contestant;
				});
			},
		}),
	},
	guards: {
		hasRemainingQuestions: function ({ context }) {
			return Object.values(context.questions).some(
				(question) =>
					question.category === context.current_category &&
					question.complete === false &&
					question.round === context.current_round,
			);
		},
		isCategoryComplete: function ({ context }) {
			return Object.values(context.questions)
				.filter(
					(question) =>
						question.category === context.current_category &&
						question.round === context.current_round,
				)
				.every((question) => question.complete === true);
		},
		hasRemainingCategories: function ({ context }) {
			return Object.values(context.categories).some(
				(category) =>
					!category.isLeetHeat &&
					Object.values(context.questions).filter(
						(q) =>
							q.category === category.name && q.round === context.current_round,
					).length > 0,
			);
		},
		hasRemainingContestants: function ({ context }) {
			const contestants = context.contestants.map((c) => c.name);

			return !contestants.every((name) =>
				context.questions[context.current_question!.id].buzzedIn.includes(name),
			);
		},
		isFinalRound: function ({ context }) {
			return context.current_round + 1 > 2;
		},
		isCorrect: function ({ context, event }) {
			// Add your guard condition here
			return true;
		},
	},
}).createMachine({
	context: {
		current_round: 1,
		current_question: null,
		current_category: null,
		categories: {},
		questions: {},
		contestants: [],
	},
	id: 'Leet Heat Game Logic',
	initial: 'READY_TO_BEGIN',
	description:
		'This machine is the engine of Leet Heat. The game flow and rules are managed here.',
	states: {
		READY_TO_BEGIN: {
			on: {
				BEGIN_GAME: {
					target: 'SPINNING_WHEEL',
					actions: [
						{
							// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
							type: 'beginGame',
						},
					],
				},
			},
			description:
				'To begin the game and continue after depleting a category, the wheel must be spun.',
		},
		SPINNING_WHEEL: {
			on: {
				LAND_ON_LEET_HEAT: {
					target: 'CONTESTANT_EATING_LEET_HEAT_SPICY_BITE',
					actions: [
						{
							// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
							type: 'increaseSpiceLevel',
						},
					],
				},
				LAND_ON_CATEGORY: {
					target: 'HOST_ANNOUNCING_CATEGORY',
					actions: [
						{
							// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
							type: 'setCategory',
						},
						{
							type: 'setQuestion',
						},
					],
				},
			},
		},
		CONTESTANT_EATING_LEET_HEAT_SPICY_BITE: {
			on: {
				CHOOSE_CATEGORY: {
					target: 'HOST_ANNOUNCING_CATEGORY',
					actions: {
						// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
						type: 'setCategory',
					},
				},
				UNDO_LEET_HEAT: {
					target: 'SPINNING_WHEEL',
					actions: [
						{
							// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
							type: 'clearCategory',
						},
						{ type: 'decreaseSpiceLevel' },
					],
				},
			},
			description:
				'A contestant is required to eat a spicy bite at their current spice level.',
		},
		HOST_ANNOUNCING_CATEGORY: {
			on: {
				START_ROUND: {
					target: 'HOST_READING_QUESTION',
					actions: {
						// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
						type: 'setQuestion',
					},
				},
				UNDO_CATEGORY: {
					target: 'SPINNING_WHEEL',
					actions: [
						{
							// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
							type: 'clearCategory',
						},
						{
							type: 'clearQuestion',
						},
					],
				},
			},
			description:
				'After spinning the wheel, we need to set the category, either by spin or by choice after landing on a "Leet Heat" tile.',
		},
		HOST_READING_QUESTION: {
			always: {
				guard: 'isCategoryComplete',
				target: 'CATEGORY_COMPLETE',
				actions: [
					{
						// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
						type: 'markCategoryAsLeetHeat',
					},
					{
						type: 'clearCategory',
					},
				],
			},
			on: {
				CONTESTANT_BUZZES_IN: {
					target: 'CONTESTANT_ANSWERING',
					actions: {
						// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
						type: 'setBuzzedInContestant',
					},
				},
				NO_BUZZER_PRESSED: {
					target: 'HOST_READING_CORRECT_ANSWER',
				},
			},
			description: 'Display the question for contestants.',
		},
		CONTESTANT_ANSWERING: {
			on: {
				ANSWER_IS_CORRECT: {
					target: 'QUESTION_COMPLETE',
					actions: [
						{
							// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
							type: 'increasePoints',
						},
						{
							type: 'trackCorrectAnswer',
						},
						{
							type: 'setAsRoundLeader',
						},
						{
							type: 'clearBuzzedInContestant',
						},
						{
							type: 'markQuestionComplete',
						},
						{
							type: 'clearQuestion',
						},
					],
				},
				ANSWER_IS_INCORRECT: {
					target: 'CONTESTANT_EATING_WRONG_ANSWER_SPICY_BITE',
					actions: [
						{
							// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
							type: 'trackIncorrectAnswer',
						},
						{
							type: 'reducePoints',
						},
					],
				},
				UNDO_BUZZ_IN: {
					target: 'HOST_READING_QUESTION',
					actions: [
						{
							type: 'undoBuzzedInContestant',
						},
					],
				},
			},
		},
		CONTESTANT_EATING_WRONG_ANSWER_SPICY_BITE: {
			on: {
				CHANCE_FOR_OPPONENT: [
					{
						target: 'WAITING_FOR_BUZZER',
						actions: [
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'increaseSpiceLevel',
							},
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'clearBuzzedInContestant',
							},
						],
						guard: {
							type: 'hasRemainingContestants',
						},
					},
					{
						target: 'HOST_READING_CORRECT_ANSWER',
					},
				],
				UNDO_INCORRECT: {
					// TODO add an undo that rolls back points and spice level
				},
			},
		},
		HOST_READING_CORRECT_ANSWER: {
			on: {
				QUESTIONS_REMAIN: [
					{
						target: 'HOST_READING_QUESTION',
						actions: [
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'markQuestionComplete',
							},
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'clearQuestion',
							},
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'setQuestion',
							},
						],
						guard: {
							type: 'hasRemainingQuestions',
						},
					},
					{
						target: 'CATEGORY_COMPLETE',
						actions: [
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'clearBuzzedInContestant',
							},
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'markQuestionComplete',
							},
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'clearQuestion',
							},
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'markCategoryAsLeetHeat',
							},
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'clearCategory',
							},
						],
					},
				],
			},
		},
		QUESTION_COMPLETE: {
			always: {
				guard: 'isCategoryComplete',
				target: 'CATEGORY_COMPLETE',
				actions: [
					{
						// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
						type: 'markCategoryAsLeetHeat',
					},
					{
						type: 'clearCategory',
					},
				],
			},
			on: {
				QUESTIONS_REMAIN: [
					{
						target: 'HOST_READING_QUESTION',
						actions: [
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'setQuestion',
							},
						],
						guard: {
							type: 'hasRemainingQuestions',
						},
					},
					{
						target: 'CATEGORY_COMPLETE',
						actions: [
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'markCategoryAsLeetHeat',
							},
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'clearCategory',
							},
						],
					},
				],
				UNDO_CORRECT: {
					actions: {
						// TODO how do we track what the most recent question answered was?
						type: 'undoAnswerQuestion',
					},
				},
			},
		},
		WAITING_FOR_BUZZER: {
			on: {
				CONTESTANT_BUZZES_IN: {
					target: 'CONTESTANT_ANSWERING',
					actions: {
						// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
						type: 'setBuzzedInContestant',
					},
				},
				NO_BUZZER_PRESSED: {
					target: 'HOST_READING_CORRECT_ANSWER',
				},
			},
		},
		CATEGORY_COMPLETE: {
			on: {
				CATEGORIES_REMAIN: [
					{
						target: 'SPINNING_WHEEL',
						guard: {
							type: 'hasRemainingCategories',
						},
					},
					{
						target: 'FINAL_ROUND_START',
						actions: [
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'increaseRoundNumber',
							},
						],
						guard: {
							type: 'isFinalRound',
						},
					},
					{
						target: 'SPINNING_WHEEL',
						actions: [
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'increaseRoundNumber',
							},
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'increaseSpiceLevel',
								params: { allContestants: true },
							},
							{
								// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
								type: 'resetCategories',
							},
						],
					},
				],
			},
		},
		FINAL_ROUND_START: {
			on: {
				REVEAL_FINAL_CATEGORY: {
					target: 'READY_TO_BET',
				},
			},
		},
		READY_TO_BET: {
			on: {
				PLACE_WAGER: {
					target: 'FINAL_SPICY_BITE',
					actions: [
						{
							// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
							type: 'setWagerAmount',
						},
						{
							type: 'increaseSpiceLevel',
						},
					],
				},
			},
		},
		FINAL_SPICY_BITE: {
			after: {
				'90000': [
					{
						target: 'GAME_END',
						actions: {
							// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
							type: 'increasePoints',
						},
						guard: {
							type: 'isCorrect',
						},
					},
					{
						target: 'GAME_END',
						actions: {
							type: 'reducePoints',
						},
					},
				],
			},
		},
		GAME_END: {
			type: 'final',
			entry: {
				// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
				type: 'calculateFinalScores',
			},
		},
	},
	on: {
		SET_CONTESTANT_SCORE: {
			actions: [
				{
					// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
					type: 'setContestantScore',
				},
			],
		},
		SET_CONTESTANT_SPICE_LEVEL: {
			actions: [
				{
					// @ts-expect-error see https://github.com/statelyai/xstate/issues/5164
					type: 'setContestantSpiceLevel',
				},
			],
		},
	},
});
