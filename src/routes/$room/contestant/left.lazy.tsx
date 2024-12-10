import { useState } from 'react';
import usePartySocket from 'partysocket/react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { PodiumDisplay } from '../../../components/podium-display';
import { ReadOnlyContestant } from '../../../types';
import contestants from '../../../data/s1e1/contestants.json';

function ContestantLeft() {
	const { room } = Route.useParams();
	const [contestant, setContestant] = useState<ReadOnlyContestant | null>(
		ReadOnlyContestant.parse({ name: contestants.at(0) }),
	);

	usePartySocket({
		host: import.meta.env.VITE_PARTY_URL,
		room: import.meta.env.VITE_PARTY_ROOM,
		onMessage(event) {
			const parsed = JSON.parse(event.data);

			if (parsed.type !== 'contestant') {
				return;
			}

			const c = ReadOnlyContestant.parse(parsed.data);

			if (c.name !== contestant?.name) {
				return;
			}

			setContestant(c);
		},
	});

	if (!contestant) {
		return null;
	}

	return <PodiumDisplay contestant={contestant} />;
}

export const Route = createLazyFileRoute('/$room/contestant/left')({
	component: ContestantLeft,
});
