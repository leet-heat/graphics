import { createLazyFileRoute } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { GameSnapshot } from '../../types';

const PlaceholderScreen = () => {
	return (
		<main>
			<img
				src="https://res.cloudinary.com/jlengstorf/image/upload/f_auto/q_auto/w_500/v1733784577/leet-heat/LeetHeat_Lockup_Pixelated_HiRes.png"
				alt="Leet Heat"
			/>
		</main>
	);
};

function DisplayedData() {
	const snapshot = useQuery(api.context.load, {
		slug: 's1e3',
	}) as GameSnapshot;

	if (!snapshot) {
		return <PlaceholderScreen />;
	}

	const { value, context } = snapshot;

	switch (value) {
		case 'READY_TO_BEGIN':
		case 'SAVE_GAME_CONTEXT':
		case 'LOAD_GAME_CONTEXT':
		case 'SPINNING_WHEEL':
		case 'CATEGORY_COMPLETE':
		case 'QUESTION_COMPLETE':
		case 'CONTESTANT_EATING_LEET_HEAT_SPICY_BITE':
			return <PlaceholderScreen />;

		case 'HOST_ANNOUNCING_CATEGORY':
			return <h1>{context.current_category}</h1>;

		case 'HOST_READING_QUESTION':
		case 'WAITING_FOR_BUZZER':
		case 'CONTESTANT_ANSWERING':
			if (!context.current_question) {
				return null;
			}

			const makeSmaller = context.current_question.text.length > 60;

			return (
				<>
					<h2 className={makeSmaller ? 'smaller' : ''}>
						{context.current_question.text}
					</h2>

					{context.current_question.image ? (
						<img src={context.current_question.image} alt="" />
					) : null}

					{context.current_question.options ? (
						<div className="question-options">
							{Object.entries(context.current_question.options).map(
								([label, value]) => {
									return (
										<div
											key={`answer-${context.current_question?.id}-${label}`}
											className={`question-option ${makeSmaller ? ' smaller' : ''}`}
										>
											{label}: {value}
										</div>
									);
								},
							)}
						</div>
					) : null}
				</>
			);

		case 'CONTESTANT_EATING_WRONG_ANSWER_SPICY_BITE':
		case 'FINAL_SPICY_BITE':
			return <h1>🔥</h1>;

		case 'REVEAL_FINAL_CATEGORY':
		case 'PLACE_WAGER':
			return <h1>Name That Logo!</h1>;

		default:
			return <PlaceholderScreen />;
	}
}

function Screen() {
	return (
		<main className="screen-display">
			<DisplayedData />
		</main>
	);
}

export const Route = createLazyFileRoute('/$room/screen')({
	component: Screen,
});
