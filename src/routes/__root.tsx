import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { GameProvider } from '../hooks/use-game';

export const Route = createRootRoute({
	component: () => (
		<>
			<GameProvider>
				<Outlet />
			</GameProvider>
			{/* <TanStackRouterDevtools /> */}
		</>
	),
});
