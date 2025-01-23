import { createLazyFileRoute } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { GameSnapshot } from '../../types';

function Host() {
	const state = useQuery(api.context.load, {
		slug: 's1e3',
	}) as GameSnapshot;

	if (!state || !state.context || !state.value) {
		return null;
	}

	return (
		<main>
			{state.context.contestants.length > 0 ? (
				<section className="overview">
					<div className="detail">
						<h3>Current Round:</h3>
						<p>{state.context.current_round}</p>
					</div>
					<div className="detail">
						<h3>Current Category:</h3>
						<p>{state.context.current_category ?? 'n/a'}</p>
					</div>
					<div className="detail">
						<h3>Questions Left in Category:</h3>
						<p>
							{Object.values(state.context.questions).filter(
								(q) =>
									q.round === state.context.current_round &&
									q.category === state.context.current_category &&
									q.complete === false,
							).length ?? 'n/a'}
						</p>
					</div>
					<div className="detail">
						<h3>Next to Spin:</h3>
						<p>
							{state.context.contestants.find((c) => c.isRoundLeader)?.name ??
								'n/a'}
						</p>
					</div>
					<div className="detail">
						<h3>Buzzed In:</h3>
						<p>
							{state.context.contestants.find((c) => c.isBuzzedIn)?.name ??
								'n/a'}
						</p>
					</div>
				</section>
			) : null}

			<section className="controls">
				<div className="heading">
					{state.value === 'SPINNING_WHEEL' ? (
						<>
							<h2>
								Have{' '}
								{state.context.contestants.find((c) => c.isRoundLeader)?.name}{' '}
								spin the wheel.
							</h2>
						</>
					) : null}
					{state.value === 'HOST_ANNOUNCING_CATEGORY' ? (
						<>
							<h2>Announce the category: {state.context.current_category}</h2>
							{state.context.categories[state.context.current_category!]
								.sponsor ? (
								<p>
									Ask Jason to do the overview read for{' '}
									{
										state.context.categories[state.context.current_category!]
											.sponsor
									}
									.
								</p>
							) : null}
						</>
					) : null}
					{state.value === 'CONTESTANT_EATING_LEET_HEAT_SPICY_BITE' ? (
						<>
							<h2>
								🔥 Spicy bite time for{' '}
								{state.context.contestants.find((c) => c.isRoundLeader)?.name}!
							</h2>
							<p>After they've eaten their bite, let them choose a category.</p>
						</>
					) : null}
					{state.value === 'CONTESTANT_EATING_WRONG_ANSWER_SPICY_BITE' ? (
						<>
							<h2>
								🔥 Spicy bite time for{' '}
								{state.context.contestants.find((c) => c.isBuzzedIn)?.name}!
							</h2>
						</>
					) : null}
					{state.value === 'QUESTION_COMPLETE' ? (
						<>
							<h2>Ready for the next question?</h2>
						</>
					) : null}
					{state.value === 'HOST_READING_QUESTION' ||
					state.value === 'WAITING_FOR_BUZZER' ||
					state.value === 'CONTESTANT_ANSWERING' ? (
						<>
							<h2>{state.context.current_question?.text}</h2>

							{state.context.current_question?.image ? (
								<img src={state.context.current_question.image} alt="" />
							) : null}

							{state.context.current_question?.options ? (
								<div className="question-options">
									{Object.entries(state.context.current_question.options).map(
										([label, value]) => {
											const answerProp = state.context.current_question?.answer
												.split(':')
												.at(0);

											return (
												<div
													key={`answer-${state.context.current_question?.id}-${label}`}
													className={`question-option${label === answerProp ? ' correct-answer' : ''}`}
												>
													{label}: {value}
												</div>
											);
										},
									)}
								</div>
							) : null}

							{state.value === 'CONTESTANT_ANSWERING' ? (
								<p className="description">
									Is {state.context.contestants.find((c) => c.isBuzzedIn)?.name}
									's answer correct?
								</p>
							) : null}

							{!state.context.current_question?.options ? (
								<p className="question-answer">
									Answer: {state.context.current_question?.answer}
								</p>
							) : null}
						</>
					) : null}

					{state.value === 'HOST_READING_CORRECT_ANSWER' ? (
						<>
							<h2>No one got the answer.</h2>
							<p>Make sure the correct answer gets read out!</p>
							<p>
								Answer:
								<br />
								{state.context.current_question?.answer}
							</p>
						</>
					) : null}

					{state.value === 'CATEGORY_COMPLETE' ? (
						<>
							<h2>That's the end of the category!</h2>
							<p>Time for banter, etc., then we'll keep going.</p>
						</>
					) : null}
				</div>
			</section>
		</main>
	);
}

export const Route = createLazyFileRoute('/$room/host')({
	component: Host,
});
