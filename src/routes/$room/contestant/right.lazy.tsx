import { createLazyFileRoute } from '@tanstack/react-router';

function ContestantRight() {
	return <div>ContestantRight</div>;
}

export const Route = createLazyFileRoute('/$room/contestant/right')({
	component: ContestantRight,
});
