import { Contestant } from '../hooks/use-game';

export const PodiumDisplay = ({ contestant }: { contestant: Contestant }) => {
	return (
		<main className="podium-display">
			<h1>{contestant.name}</h1>

			<div className="scores">
				<p className="contestant-score">
					{new Intl.NumberFormat('en-US').format(contestant.score)}
				</p>
				<p className="contestant-spice-level">
					🌶️ x {parseInt(contestant.incorrect.size) + 1}
				</p>
			</div>
		</main>
	);
};
