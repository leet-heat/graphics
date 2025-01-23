import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { GameSnapshot } from '../types';

export const PodiumDisplay = ({
	contestantIndex,
}: {
	contestantIndex: number;
}) => {
	const snapshot = useQuery(api.context.load, {
		slug: 's1e3',
	}) as GameSnapshot;

	if (!snapshot) {
		return null;
	}

	const { context } = snapshot;
	const contestant = context.contestants.at(contestantIndex);

	if (!contestant) {
		return null;
	}

	return (
		<main className="podium-display">
			<h1>{contestant.name}</h1>

			<div className="scores">
				<p className="contestant-score">
					{new Intl.NumberFormat('en-US').format(contestant.score)}
				</p>
				<p className="contestant-spice-level">🌶️ x {contestant.spiceLevel}</p>
			</div>
		</main>
	);
};
