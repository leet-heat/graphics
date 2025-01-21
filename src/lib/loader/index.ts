import categoriesYaml from '../../data/s1e3/categories.yml';
import contestantsYaml from '../../data/s1e3/contestants.yml';
import questionsYaml from '../../data/s1e3/questions.yml';
import { Category, Contestant, Game, Question } from '../../types';

export function loadQuestions() {
	return Object.fromEntries(
		questionsYaml.map((q: unknown) => {
			let question = Question.parse(q);
			if (question.options) {
				question.answer = `${question.answer}: ${question.options[question.answer as keyof typeof question.options]}`;
			}

			return [question.id, question];
		}),
	);
}

export function loadCategories() {
	return Object.fromEntries(
		categoriesYaml.map((c: unknown) => {
			let category = Category.parse(c);

			return [category.name, category];
		}),
	);
}

export function loadContestants() {
	return contestantsYaml.map((c: unknown) => Contestant.parse(c));
}

export async function loadGameContext() {
	const categories = loadCategories();
	const contestants = loadContestants();
	const questions = loadQuestions();

	return Game.parse({
		slug: 's1e3',
		categories,
		questions,
		contestants,
	});
}
