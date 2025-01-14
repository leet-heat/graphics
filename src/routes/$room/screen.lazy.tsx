import { createLazyFileRoute } from '@tanstack/react-router';

function Screen() {
	return <main className="screen-display">Screen</main>;
}

export const Route = createLazyFileRoute('/$room/screen')({
	component: Screen,
});
