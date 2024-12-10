import { createLazyFileRoute } from '@tanstack/react-router';
import { useGame } from '../../hooks/use-game';
import { type Contestant as ContestantSchema } from '../../types';

function Contestant({ contestant }: { contestant: ContestantSchema }) {
	const game = useGame();

	if (!game) {
		return null;
	}

	const { chooser, round } = game;

	const isChooser = chooser?.name === contestant.name;

	return (
		<div className={`contestant ${isChooser ? 'chooser' : ''}`}>
			<h2>
				{isChooser ? '➡️ ' : null}
				{contestant.name}
			</h2>

			<p className="score">Score: {contestant.score}</p>

			<div className="incorrect-answers">
				<span role="img" aria-label="fire">
					🔥
				</span>{' '}
				&times; {contestant.incorrect.size + round}
			</div>
		</div>
	);
}

function ContestantControls({ contestant }: { contestant: ContestantSchema }) {
	const context = useGame();

	if (!context) {
		return null;
	}

	const { question } = context;

	if (!question) {
		return null;
	}

	return (
		<>
			<button onClick={() => contestant.addCorrect(question)}>
				✅ {contestant.name} correct
			</button>

			<button onClick={() => contestant.addIncorrect(question)}>
				❌ {contestant.name} incorrect
			</button>
		</>
	);
}

function ProducerView() {
	const game = useGame();

	if (!game) {
		return null;
	}

	const {
		categories,
		questions,
		round,
		question,
		answered,
		updateAnswered,
		updateRound,
		updateCategory,
		updateQuestion,
		category,
		contestant1,
		contestant2,
	} = game;

	const currentQuestions = questions
		.filter((q) => q.category === category)
		.filter((q) => q.round === round);

	const remaining = currentQuestions.filter((q) => !answered.has(q.id));
	const completed = currentQuestions.filter((q) => answered.has(q.id));

	return (
		<main>
			<section className="scoreboard">
				{contestant1 ? <Contestant contestant={contestant1} /> : null}

				{contestant2 ? <Contestant contestant={contestant2} /> : null}
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

						<div className="options">
							{answered.has(question.id) ? null : (
								<>
									<ContestantControls contestant={contestant1} />
									<ContestantControls contestant={contestant2} />

									<button
										onClick={() =>
											updateAnswered(new Set(answered.add(question.id)))
										}
									>
										no answer
									</button>
								</>
							)}
						</div>
					</>
				) : (
					<p>no question selected</p>
				)}
			</section>

			<section>
				{[1, 2].map((r) => {
					return (
						<button
							key={`round-${r}`}
							onClick={() => updateRound(r)}
							className={round === r ? 'selected' : ''}
						>
							Round {r}
						</button>
					);
				})}
			</section>

			<section>
				{categories.map((c) => {
					return (
						<button
							key={`category-${c}`}
							className={category === c ? 'selected' : ''}
							onClick={() => updateCategory(c)}
						>
							{c}
						</button>
					);
				})}
			</section>

			<section className="questions">
				{remaining.length > 0 ? (
					<>
						{remaining.map((q) => {
							return (
								<div className="question" key={`question-${q.id}`}>
									<button
										onClick={() => updateQuestion(q)}
										className={
											q.id === question?.id ? 'question active' : 'question'
										}
									>
										mark active
									</button>

									<p>{q.question.text}</p>
								</div>
							);
						})}
					</>
				) : (
					<p className="all-complete">
						all questions complete for this round of this category
					</p>
				)}

				<details>
					<summary>Completed</summary>

					{completed.map((q) => {
						return (
							<div className="question" key={`question-${q.id}`}>
								<p>{q.question.text}</p>
							</div>
						);
					})}
				</details>
			</section>
		</main>
	);
}

export const Route = createLazyFileRoute('/$room/producer')({
	component: ProducerView,
});
