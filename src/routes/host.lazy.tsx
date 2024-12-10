import { useState } from 'react';
import usePartySocket from 'partysocket/react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { ReadOnlyContestant, Question } from '../types';
import { z } from 'zod';

function Host() {
	const [chooser, setChooser] = useState<ReadOnlyContestant | null>(null);
	const [category, setCategory] = useState<string | null>(null);
	const [question, setQuestion] = useState<Question | null>(null);
	const [round, setRound] = useState<number>(1);

	usePartySocket({
		// TODO: add env var
		host: 'http://localhost:1999',

		// TODO set this somewhere (URL?)
		room: 's1e1',
		onMessage(event) {
			const parsed = JSON.parse(event.data);

			console.log(parsed);

			switch (parsed.type) {
				case 'chooser':
					const newChooser = ReadOnlyContestant.parse(parsed.data);
					setChooser(newChooser);
					break;

				case 'round':
					const newRound = z.number().parse(parsed.data);
					setRound(newRound);
					break;

				case 'question':
					const newQuestion = Question.parse(parsed.data);
					setQuestion(newQuestion);
					break;

				case 'category':
					const newCategory = z.string().parse(parsed.data);
					setCategory(newCategory);
					break;

				default:
					break;
			}
		},
	});

	return (
		<main className="host-display">
			<section className="host-details">
				<p>Choosing: {chooser?.name ?? `pending...`}</p>
				<p>
					Category: {category ?? 'pending...'}, Round {round ?? 'pending...'}
				</p>
			</section>
			<section className="active-question">
				{question ? (
					<>
						<p className="question-text">{question.question.text}</p>

						{question.question.image ? (
							<img src={question.question.image} alt="code snippet" />
						) : null}

						{question.question.options ? (
							<div className="multi-choices">
								{Object.entries(question.question.options).map(([key, val]) => {
									return (
										<div className="choice" key={`${question.id}-${key}`}>
											{key}) {val}
										</div>
									);
								})}
							</div>
						) : null}

						<div className="answer">Answer: {question.question.answer}</div>
					</>
				) : (
					<p>no question selected</p>
				)}
			</section>
		</main>
	);
}

export const Route = createLazyFileRoute('/host')({
	component: Host,
});
