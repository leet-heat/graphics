import { useState } from 'react';
import usePartySocket from 'partysocket/react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { PodiumDisplay } from '../../components/podium-display';
import { ReadOnlyContestant } from '../../types';
import contestants from '../../data/s1e1/contestants.json';

function ContestantLeft() {
	const [contestant, setContestant] = useState<ReadOnlyContestant | null>(
		ReadOnlyContestant.parse({ name: contestants.at(0) }),
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

export const Route = createLazyFileRoute('/contestant/left')({
	component: ContestantLeft,
});
