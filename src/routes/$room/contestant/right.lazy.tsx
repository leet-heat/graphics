import { useState } from 'react';
import usePartySocket from 'partysocket/react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { PodiumDisplay } from '../../../components/podium-display';
import { ReadOnlyContestant } from '../../../types';
import contestants from '../../../data/s1e1/contestants.json';

function ContestantRight() {
	const { room } = Route.useParams();
	const [contestant, setContestant] = useState<ReadOnlyContestant | null>(
		ReadOnlyContestant.parse({ name: contestants.at(1) }),
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

			// this is a filthy hack and I'm not even sorry
			if (!contestant && parsed.data.position === 1) {
				setContestant(c);
			}

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

export const Route = createLazyFileRoute('/$room/contestant/right')({
	component: ContestantRight,
});
