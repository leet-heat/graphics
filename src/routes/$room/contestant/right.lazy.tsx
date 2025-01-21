import { createLazyFileRoute } from '@tanstack/react-router'
import { PodiumDisplay } from '../../../components/podium-display'

function ContestantLeft() {
  return <PodiumDisplay contestantIndex={1} />
}

export const Route = createLazyFileRoute('/$room/contestant/right')({
  component: ContestantLeft,
})
