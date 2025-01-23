import { createLazyFileRoute } from '@tanstack/react-router';
import { useActor } from '@xstate/react';
import { Fragment, useEffect, useState } from 'react';
import { machine, events } from '../../lib/state/game';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Snapshot } from 'xstate';
import { Game } from '../../types';
import { Doc } from '../../../convex/_generated/dataModel';

function ProducerView() {
	const [timer, setTimer] = useState(5);
	const [state, send, actor] = useActor(machine);
	const createOrReplaceContext = useMutation(api.context.createOrReplace);

	useEffect(() => {
		const subscription = actor.subscribe(async (snapshot) => {
			// TODO figure out if there's a way to actually get Xstate and Convex
			// types to play well together
			const persistedSnapshot = snapshot.machine.getPersistedSnapshot(
				snapshot,
			) as unknown;

			const result = await createOrReplaceContext(
				persistedSnapshot as Doc<'context'>,
			);

			console.log(result);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [actor]);

	useEffect(() => {
		let timerInterval = undefined;
		if (
			// @ts-expect-error
			state.matches('HOST_READING_QUESTION') ||
			// @ts-expect-error I don't even know what this is
			state.matches('WAITING_FOR_BUZZER') ||
			// @ts-expect-error
			state.matches('CONTESTANT_ANSWERING')
		) {
			setTimer(5);

			timerInterval = setInterval(() => {
				setTimer((tVal) => tVal - 1);
			}, 1000);
		}

		return () => clearInterval(timerInterval);
	}, [state]);

	async function handleEvent(event: (typeof events)[number]) {
		if (!events.includes(event)) {
			return;
		}

		switch (event) {
			default:
				// @ts-expect-error how do I fix this properly?
				send({ type: event });
				break;
		}
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
					{
						// @ts-expect-error I don't even know what this is
						state.matches('SPINNING_WHEEL') ? (
							<>
								<h2>
									Have{' '}
									{state.context.contestants.find((c) => c.isRoundLeader)?.name}{' '}
									spin the wheel.
								</h2>
								<p>Then click the tile they landed on:</p>
							</>
						) : null
					}
					{
						// @ts-expect-error I don't even know what this is
						state.matches('HOST_ANNOUNCING_CATEGORY') ? (
							<>
								<h2>Announce the category and sponsor.</h2>
								<p>
									Do the overview read for{' '}
									{
										state.context.categories[state.context.current_category!]
											.sponsor
									}
									, then click continue.
								</p>
							</>
						) : null
					}
					{
						// @ts-expect-error I don't even know what this is
						state.matches('CONTESTANT_EATING_LEET_HEAT_SPICY_BITE') ? (
							<>
								<h2>
									🔥 Spicy bite time for{' '}
									{state.context.contestants.find((c) => c.isRoundLeader)?.name}
									!
								</h2>
								<p>
									After they've eaten their bite, let them choose a category.
								</p>
							</>
						) : null
					}
					{
						// @ts-expect-error I don't even know what this is
						state.matches('CONTESTANT_EATING_WRONG_ANSWER_SPICY_BITE') ? (
							<>
								<h2>
									🔥 Spicy bite time for{' '}
									{state.context.contestants.find((c) => c.isBuzzedIn)?.name}!
								</h2>
								<p>After they've eaten their bite, press continue.</p>
							</>
						) : null
					}
					{
						// @ts-expect-error I don't even know what this is
						state.matches('QUESTION_COMPLETE') ? (
							<>
								<h2>Ready for the next question?</h2>
							</>
						) : null
					}
					{
						// @ts-expect-error I don't even know what this is
						state.matches('HOST_READING_QUESTION') ||
						// @ts-expect-error I don't even know what this is
						state.matches('WAITING_FOR_BUZZER') ||
						// @ts-expect-error
						state.matches('CONTESTANT_ANSWERING') ? (
							<>
								<h2>
									{state.context.current_question?.text} (
									{timer > 0 ? `${timer}` : "Time's up!"})
								</h2>

								{state.context.current_question?.image ? (
									<img src={state.context.current_question.image} alt="" />
								) : null}

								{state.context.current_question?.options ? (
									<div className="question-options">
										{Object.entries(state.context.current_question.options).map(
											([label, value]) => {
												const answerProp =
													state.context.current_question?.answer
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

								{
									// @ts-expect-error
									state.matches('CONTESTANT_ANSWERING') ? (
										<p className="description">
											Is{' '}
											{
												state.context.contestants.find((c) => c.isBuzzedIn)
													?.name
											}
											's answer correct?
										</p>
									) : null
								}

								{!state.context.current_question?.options ? (
									<p className="question-answer">
										Answer: {state.context.current_question?.answer}
									</p>
								) : null}
							</>
						) : null
					}

					{
						// @ts-expect-error I don't even know what this is
						state.matches('HOST_READING_CORRECT_ANSWER') ? (
							<>
								<h2>No one got the answer.</h2>
								<p>Make sure the correct answer gets read out!</p>
								<p>
									Answer:
									<br />
									{state.context.current_question?.answer}
								</p>
							</>
						) : null
					}

					{
						// @ts-expect-error I don't even know what this is
						state.matches('CATEGORY_COMPLETE') ? (
							<>
								<h2>That's the end of the category!</h2>
								<p>When you're ready, click continue.</p>
							</>
						) : null
					}
				</div>

				<div className="buttons">
					{events.map((event) => {
						// @ts-expect-error how do I fix this properly?
						if (state.can({ type: event })) {
							switch (event) {
								case 'SET_CONTESTANT_SCORE':
								case 'SET_CONTESTANT_SPICE_LEVEL':
									break;

								case 'BEGIN_GAME':
									return (
										<button
											key={`event-${event}`}
											onClick={() => handleEvent(event)}
											title={event}
										>
											Begin Game
										</button>
									);

								case 'LAND_ON_LEET_HEAT':
									return (
										<button
											title={event}
											key={`event-${event}`}
											onClick={() => send({ type: 'LAND_ON_LEET_HEAT' })}
										>
											🔥 Leet Heat
										</button>
									);

								case 'LAND_ON_CATEGORY':
								case 'CHOOSE_CATEGORY':
									return (
										<Fragment key={`event-${event}`}>
											{Object.values(state.context.categories).map(
												(category) => {
													if (category.isLeetHeat) {
														return null;
													}

													if (
														Object.values(state.context.questions).filter(
															(q) =>
																q.category === category.name &&
																q.round === state.context.current_round,
														).length <= 0
													) {
														return null;
													}

													return (
														<button
															title={event}
															key={`category-${category.name}`}
															onClick={() =>
																send({ type: event, category: category.name })
															}
														>
															{category.name}
														</button>
													);
												},
											)}
										</Fragment>
									);

								case 'CONTESTANT_BUZZES_IN':
									return Object.values(state.context.contestants).map(
										(contestant) => {
											if (!state.context.current_question) {
												console.log(state.output);
												return null;
											}

											return !state.context.questions[
												state.context.current_question!.id
											].buzzedIn.includes(contestant.name) ? (
												<button
													title={event}
													key={`contestant-${contestant.id}`}
													onClick={() =>
														send({
															type: 'CONTESTANT_BUZZES_IN',
															contestant: contestant.name,
														})
													}
												>
													{contestant.name} Buzzes In
												</button>
											) : null;
										},
									);

								case 'QUESTIONS_REMAIN':
								case 'CHANCE_FOR_OPPONENT':
								case 'CATEGORIES_REMAIN':
									return (
										<button
											key={`event-${event}`}
											onClick={() => handleEvent(event)}
											title={event}
										>
											Continue
										</button>
									);

								case 'NO_BUZZER_PRESSED':
									return (
										<button
											title={event}
											key={`event-${event}`}
											onClick={() => handleEvent(event)}
										>
											Time Is Up
										</button>
									);

								case 'ANSWER_IS_CORRECT':
									return (
										<button
											title={event}
											key={`event-${event}`}
											onClick={() => handleEvent(event)}
										>
											✅ Correct
										</button>
									);

								case 'ANSWER_IS_INCORRECT':
									return (
										<button
											title={event}
											key={`event-${event}`}
											onClick={() => handleEvent(event)}
										>
											❌ Incorrect
										</button>
									);

								case 'UNDO_BUZZ_IN':
									return (
										<button
											title={event}
											key={`event-${event}`}
											onClick={() => handleEvent(event)}
										>
											Undo Buzz In
										</button>
									);

								case 'UNDO_LEET_HEAT':
									return (
										<button
											title={event}
											key={`event-${event}`}
											onClick={() => handleEvent(event)}
										>
											Undo Leet Heat (misclick)
										</button>
									);

								case 'START_ROUND':
									return (
										<button
											title={event}
											key={`event-${event}`}
											onClick={() => handleEvent(event)}
										>
											Begin Round
										</button>
									);

								case 'UNDO_CATEGORY':
									return (
										<button
											title={event}
											key={`event-${event}`}
											onClick={() => handleEvent(event)}
										>
											Go Back (misclick)
										</button>
									);

								default:
									return (
										<button
											title={event}
											key={`event-${event}`}
											onClick={() => handleEvent(event)}
										>
											{event}
										</button>
									);
							}
						}
					})}
				</div>
			</section>

			{state.context.contestants.length > 0 ? (
				<section className="contestants">
					{state.context.contestants.map((contestant) => {
						return (
							<div className="contestant" key={contestant.id}>
								<div className="name">
									<h2>{contestant.name}</h2>
									<button
										onClick={() => {
											const dialog = document.querySelector(
												`#overrides-${contestant.id}`,
											) as HTMLDialogElement;

											dialog.showModal();
										}}
									>
										override values
									</button>
								</div>
								<div className="state">
									<p className="score">
										<span className="score-label">Score:</span>
										<span>{contestant.score}</span>
									</p>
									<p>
										<span className="score-label">🌶️ &times;</span>
										<span>{contestant.spiceLevel}</span>
									</p>
								</div>

								<dialog id={`overrides-${contestant.id}`} className="overrides">
									<header>
										<h2>
											Override score or spice level for {contestant.name}:
										</h2>
									</header>

									<form
										method="dialog"
										onSubmit={(event) => {
											const data = new FormData(event.currentTarget);
											const contestant = data.get('contestant') as string;
											const score = Number(data.get('score') ?? 0);

											if (!contestant) {
												return;
											}

											send({
												type: 'SET_CONTESTANT_SCORE',
												data: { contestant, score },
											});

											event.currentTarget.reset();
										}}
									>
										<label>
											Override Score:
											<input
												type="number"
												name="score"
												defaultValue={contestant.score}
												step={100}
											/>
										</label>

										<input
											name="contestant"
											type="hidden"
											value={contestant.name}
										/>

										<button type="submit">Update</button>
									</form>

									<form
										method="dialog"
										onSubmit={(event) => {
											const data = new FormData(event.currentTarget);
											const contestant = data.get('contestant') as string;
											const spiceLevel = Number(data.get('spiceLevel') ?? 0);

											if (!contestant) {
												return;
											}

											send({
												type: 'SET_CONTESTANT_SPICE_LEVEL',
												data: { contestant, spiceLevel },
											});

											event.currentTarget.reset();
										}}
									>
										<label>
											Override Spice Level:
											<input
												type="number"
												name="spiceLevel"
												defaultValue={contestant.spiceLevel}
												min={0}
												max={10}
											/>
										</label>

										<input
											name="contestant"
											type="hidden"
											value={contestant.name}
										/>

										<button type="submit">Update</button>
									</form>

									<div>
										<button
											onClick={() => {
												const dialog = document.querySelector(
													`#overrides-${contestant.id}`,
												) as HTMLDialogElement;

												dialog.close();
											}}
										>
											cancel
										</button>
									</div>
								</dialog>
							</div>
						);
					})}
				</section>
			) : null}

			<footer>
				<p>Current state: {state.value.toString()}</p>
				<details>
					<summary>Full Debug Dump</summary>
					<pre>{JSON.stringify(state, null, 2)}</pre>
				</details>
			</footer>
		</main>
	);
}

export const Route = createLazyFileRoute('/$room/producer')({
	component: ProducerView,
});
