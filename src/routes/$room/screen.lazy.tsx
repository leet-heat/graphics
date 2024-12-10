import { useState } from 'react';
import usePartySocket from 'partysocket/react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Question } from '../../types';

function Host() {
	const [question, setQuestion] = useState<Question | null>(null);

	usePartySocket({
		// TODO: add env var
		host: 'http://localhost:1999',

		// TODO set this somewhere (URL?)
		room: 's1e1',
		onMessage(event) {
			const parsed = JSON.parse(event.data);

			switch (parsed.type) {
				case 'question':
					const newQuestion = Question.parse(parsed.data);
					setQuestion(newQuestion);
					break;

				default:
					break;
			}
		},
	});

	return (
		<main className="screen-display">
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
					</>
				) : null}
			</section>
		</main>
	);
}

export const Route = createLazyFileRoute('/$room/screen')({
	component: Host,
});
