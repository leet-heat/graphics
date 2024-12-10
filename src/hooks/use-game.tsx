import { createContext, useContext, useEffect, useState } from 'react';
import usePartySocket from 'partysocket/react';
import categories from '../data/s1e1/categories.json';
import contestants from '../data/s1e1/contestants.json';
import questions from '../data/s1e1/questions.json';
import { type Question, type Contestant } from '../types';
import { json } from '../util/json';

type GameContextObject = {
	round: number;
	category: string;
	question: Question | null;
	answered: Set<number>;
	contestant1: Contestant;
	contestant2: Contestant;
	chooser: Contestant | null;
	setRound: React.Dispatch<React.SetStateAction<number>>;
	setCategory: React.Dispatch<React.SetStateAction<string>>;
	setQuestion: React.Dispatch<React.SetStateAction<Question | null>>;
	setAnswered: React.Dispatch<React.SetStateAction<Set<number>>>;
	setChooser: React.Dispatch<React.SetStateAction<Contestant | null>>;
	sendUpdate: ({ type, data }: { type: string; data: unknown }) => void;
};

type UseGameObject = {
	categories: Array<string>;
	questions: Array<Question>;
	round: number;
	updateRound: (round: number) => void;
	category: string;
	updateCategory: (category: string) => void;
	question: Question | null;
	updateQuestion: (question: Question) => void;
	answered: Set<number>;
	updateAnswered: (answered: Set<number>) => void;
	contestant1: Contestant;
	contestant2: Contestant;
	chooser: Contestant | null;
	updateChooser: (chooser: Contestant) => void;
};

const GameContext = createContext<GameContextObject | null>(null);

function useContestant(
	name: string,
	round: number,
	setAnswered: (a: Set<number>) => void,
	answered: Set<number>,
	setChooser: (c: Contestant) => void,
) {
	const [contestant, setContestant] = useState<Contestant>({
		name,
		correct: new Set(),
		incorrect: new Set(),
		score: 0,
		addCorrect: () => {},
		addIncorrect: () => {},
	});

	usePartySocket({
		host: import.meta.env.VITE_PARTY_URL,
		room: import.meta.env.VITE_PARTY_ROOM,
		onMessage(event) {
			const data = JSON.parse(event.data);

			let c;
			if (data.contestant1?.name === contestant.name) {
				c = data.contestant1;
			} else if (data.contestant2?.name === contestant.name) {
				c = data.contestant2;
			} else {
				return;
			}

			if (
				contestant.score !== parseInt(c.score) ||
				Array.from(contestant.correct).join('') !== c.correct.join('') ||
				Array.from(contestant.incorrect).join('') !== c.incorrect.join('')
			) {
				setContestant({
					...contestant,
					score: parseInt(c.score),
					correct: new Set(c.correct),
					incorrect: new Set(c.incorrect),
				});
			}
		},
	});

	return {
		...contestant,
		addCorrect(question: Question) {
			const updated = {
				...contestant,
				score: (contestant.score += round * 100),
			};

			setAnswered(new Set(answered.add(question.id)));
			setChooser(updated);
			setContestant(updated);
		},
		addIncorrect(question: Question) {
			if (!question) {
				return;
			}

			if (round === 1 && contestant.incorrect.size >= 5) {
				return;
			}

			const updated = {
				...contestant,
				incorrect: contestant.incorrect.add(question.id),
			};

			setContestant(updated);
		},
	};
}

export function useGame(): UseGameObject | null {
	// const [categories, setCategories] = useState<Array<string>>([]);
	const context = useContext(GameContext);

	if (!context) {
		return null;
	}

	const {
		round,
		category,
		question,
		answered,
		contestant1,
		contestant2,
		chooser,
		setRound,
		setCategory,
		setQuestion,
		setAnswered,
		setChooser,
		sendUpdate,
	} = context;

	useEffect(() => {
		if (
			question &&
			contestant1.incorrect.has(question.id) &&
			contestant2.incorrect.has(question.id)
		) {
			if (answered.has(question.id)) {
				return;
			}

			answered.add(question.id);

			setAnswered(new Set(answered));
		}
	}, [contestant1, contestant2]);

	useEffect(() => {
		// async function loadData() {
		// 	const { default: categories } = await import(
		// 		`../data/${import.meta.env.VITE_PARTY_ROOM}/categories.json`
		// 	);

		// 	setCategories(categories);
		// }

		// loadData();

		// initialize any connected clients
		sendUpdate({ type: 'category', data: category });
		sendUpdate({ type: 'round', data: round });
		sendUpdate({ type: 'question', data: question });
		sendUpdate({ type: 'chooser', data: chooser });
	}, []);

	return {
		categories,
		questions,
		round,
		category,
		question,
		answered,
		contestant1,
		contestant2,
		chooser,

		updateRound: (round: number) => {
			setRound(round);
			sendUpdate({ type: 'round', data: round });
		},
		updateCategory: (category: string) => {
			setCategory(category);
			sendUpdate({ type: 'category', data: category });
		},
		updateQuestion: (question: Question | null) => {
			setQuestion(question);
			sendUpdate({ type: 'question', data: question });
		},
		updateAnswered: (answered: Set<number>) => {
			setAnswered(answered);
		},
		updateChooser: (chooser: Contestant) => {
			setChooser(chooser);
			sendUpdate({ type: 'chooser', data: chooser });
		},
	};
}

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
	const [round, setRound] = useState<number>(1);
	const [category, setCategory] = useState(categories.at(0) as string);
	const [question, setQuestion] = useState<Question | null>(null);
	const [answered, setAnswered] = useState<Set<number>>(new Set());
	const [chooser, setChooser] = useState<Contestant | null>(null);

	const contestant1 = useContestant(
		contestants.at(0)!,
		round,
		setAnswered,
		answered,
		setChooser,
	);

	const contestant2 = useContestant(
		contestants.at(1)!,
		round,
		setAnswered,
		answered,
		setChooser,
	);

	const socket = usePartySocket({
		host: import.meta.env.VITE_PARTY_URL,
		room: import.meta.env.VITE_PARTY_ROOM,
	});

	const sendUpdate = (message: { type: string; data: unknown }) => {
		socket.send(json(message));
	};

	useEffect(() => {
		setChooser(contestant1);
	}, []);

	useEffect(() => {
		sendUpdate({ type: 'chooser', data: chooser });
	}, [chooser]);

	useEffect(() => {
		sendUpdate({ type: 'round', data: round });
	}, [round]);

	useEffect(() => {
		sendUpdate({ type: 'question', data: question });
	}, [question]);

	useEffect(() => {
		sendUpdate({ type: 'category', data: category });
	}, [category]);

	useEffect(() => {
		sendUpdate({ type: 'contestant', data: contestant1 });
	}, [contestant1]);

	useEffect(() => {
		sendUpdate({ type: 'contestant', data: contestant2 });
	}, [contestant2]);

	return (
		<GameContext.Provider
			value={{
				round,
				category,
				question,
				answered,
				contestant1,
				contestant2,
				chooser,
				setRound,
				setCategory,
				setQuestion,
				setAnswered,
				setChooser,
				sendUpdate,
			}}
		>
			{children}
		</GameContext.Provider>
	);
};
