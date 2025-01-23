import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { game } from './schema';

export const createOrReplace = mutation({
	args: game,
	handler: async (ctx, game) => {
		const existingContext = await ctx.db
			.query('context')
			.filter((q) => q.eq(q.field('context.slug'), game.context.slug))
			.first();

		if (existingContext?._id) {
			return await ctx.db.replace(existingContext._id, game);
		}

		return await ctx.db.insert('context', game);
	},
});

export const load = query({
	args: {
		slug: v.string(),
	},
	handler: async (ctx, { slug }) => {
		console.log({ slug });
		const context = await ctx.db
			.query('context')
			.filter((q) => q.eq(q.field('context.slug'), slug))
			.first();

		console.log(context);

		return context ?? {};
	},
});
