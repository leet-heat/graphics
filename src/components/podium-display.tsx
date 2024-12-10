import { ReadOnlyContestant } from '../types';

export const PodiumDisplay = ({
	contestant,
}: {
	contestant: ReadOnlyContestant;
}) => {
	return (
		<main className="podium-display">
			<h1>{contestant.name}</h1>

			<div className="scores">
				<p className="contestant-score">
					{new Intl.NumberFormat('en-US').format(contestant.score)}
				</p>
				<p className="contestant-spice-level">
					🌶️ x {contestant.incorrect.size + 1}
				</p>
			</div>
		</main>
	);
};
