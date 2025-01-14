import { createLazyFileRoute } from '@tanstack/react-router';

function Host() {
	return <main className="host-display">Host</main>;
}

export const Route = createLazyFileRoute('/$room/host')({
	component: Host,
});
