import { createLazyFileRoute } from '@tanstack/react-router';
import { PodiumDisplay } from '../../../components/podium-display';

function ContestantLeft() {
	return <PodiumDisplay contestantIndex={0} />;
}

export const Route = createLazyFileRoute('/$room/contestant/left')({
	component: ContestantLeft,
});
