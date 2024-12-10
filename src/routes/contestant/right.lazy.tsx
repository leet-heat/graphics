import { useState } from 'react';
import usePartySocket from 'partysocket/react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { PodiumDisplay } from '../../components/podium-display';
import { ReadOnlyContestant } from '../../types';
import contestants from '../../data/s1e1/contestants.json';

function ContestantRight() {
	const [contestant, setContestant] = useState<ReadOnlyContestant | null>(
		ReadOnlyContestant.parse({ name: contestants.at(1) }),
	);

	usePartySocket({
		// TODO: add env var
		host: 'http://localhost:1999',

		// TODO set this somewhere (URL?)
		room: 's1e1',
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

export const Route = createLazyFileRoute('/contestant/right')({
	component: ContestantRight,
});
