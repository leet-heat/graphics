export function json(data: unknown) {
	return JSON.stringify(data, (_key, value) =>
		value instanceof Set ? Array.from(value) : value,
	);
}
