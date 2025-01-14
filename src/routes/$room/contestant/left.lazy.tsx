import { createLazyFileRoute } from '@tanstack/react-router';

function ContestantLeft() {
	return <div>ContestantLeft</div>;
}

export const Route = createLazyFileRoute('/$room/contestant/left')({
	component: ContestantLeft,
});
