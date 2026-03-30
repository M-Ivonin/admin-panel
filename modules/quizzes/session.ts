import type {
  QuizDefinition,
  QuizResultDefinition,
  QuizScoreMap,
} from '@/modules/quizzes/types';

/**
 * Clamps raw slider values into the 0-100 range used by scoring.
 */
function clampAnswer(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * Returns axes sorted by score with stable definition-order tie breaking.
 */
function getRankedAxes(quiz: QuizDefinition, scores: QuizScoreMap) {
  const axisOrder = new Map(quiz.axes.map((axis, index) => [axis.key, index]));

  return quiz.axes
    .map((axis) => ({ key: axis.key, score: scores[axis.key] ?? 0 }))
    .sort((left, right) => {
      if (right.score === left.score) {
        return (axisOrder.get(left.key) ?? 0) - (axisOrder.get(right.key) ?? 0);
      }

      return right.score - left.score;
    });
}

/**
 * Looks up one result definition by its internal result key.
 */
function getResultByKey(
  quiz: QuizDefinition,
  resultKey: string
): QuizResultDefinition | null {
  return quiz.results.find((result) => result.key === resultKey) ?? null;
}

/**
 * Calculates normalized percentage scores for a quiz answer set.
 */
export function calculateQuizScores(
  quiz: QuizDefinition,
  answers: number[]
): QuizScoreMap {
  const rawScores = Object.fromEntries(
    quiz.axes.map((axis) => [axis.key, 0])
  ) as QuizScoreMap;

  quiz.questions.forEach((question, questionIndex) => {
    const value = clampAnswer(answers[questionIndex] ?? 50);
    const t = value / 100;

    quiz.axes.forEach((axis) => {
      const weights = question.weights[axis.key];
      if (!weights) {
        return;
      }

      rawScores[axis.key] += weights[0] * (1 - t) + weights[1] * t;
    });
  });

  const total = Object.values(rawScores).reduce((sum, score) => sum + score, 0);

  if (total === 0) {
    const evenShare = 100 / quiz.axes.length;
    return Object.fromEntries(
      quiz.axes.map((axis, index) => [
        axis.key,
        index === quiz.axes.length - 1
          ? Math.round((100 - evenShare * (quiz.axes.length - 1)) * 10) / 10
          : Math.round(evenShare * 10) / 10,
      ])
    );
  }

  return Object.fromEntries(
    quiz.axes.map((axis, index) => {
      const normalized =
        Math.round((rawScores[axis.key] / total) * 100 * 10) / 10;

      if (index === quiz.axes.length - 1) {
        const allocated = quiz.axes
          .slice(0, -1)
          .reduce(
            (sum, currentAxis) =>
              sum + (rawScores[currentAxis.key] / total) * 100,
            0
          );

        return [
          axis.key,
          Math.round((100 - Math.round(allocated * 10) / 10) * 10) / 10,
        ];
      }

      return [axis.key, normalized];
    })
  );
}

/**
 * Resolves the dominant result variant for a normalized score map.
 */
export function resolveQuizResult(
  quiz: QuizDefinition,
  scores: QuizScoreMap
): QuizResultDefinition | null {
  const rankedAxes = getRankedAxes(quiz, scores);
  const topAxis = rankedAxes[0];
  const secondAxis = rankedAxes[1];
  const minScore = rankedAxes[rankedAxes.length - 1]?.score ?? 0;

  if (!topAxis || !secondAxis) {
    return null;
  }

  if (topAxis.score - minScore < quiz.balanceThreshold) {
    const balancedRule = quiz.resultRules.find((rule) => rule.balanced);
    return balancedRule ? getResultByKey(quiz, balancedRule.resultKey) : null;
  }

  const matchedRule = quiz.resultRules.find((rule) => {
    if (rule.balanced || rule.dominantAxisKey !== topAxis.key) {
      return false;
    }

    if (!rule.secondaryAxisKey) {
      return true;
    }

    return (
      secondAxis.key === rule.secondaryAxisKey &&
      secondAxis.score >= (rule.secondaryMinScore ?? 0)
    );
  });

  return matchedRule ? getResultByKey(quiz, matchedRule.resultKey) : null;
}

/**
 * Encodes scores into a short deterministic query payload.
 */
export function encodeResultPayload(
  quiz: QuizDefinition,
  scores: QuizScoreMap
): string {
  return quiz.axes
    .map((axis) => Math.round((scores[axis.key] ?? 0) * 10))
    .join('_');
}

/**
 * Decodes and validates a score payload from the result route query string.
 */
export function decodeResultPayload(
  quiz: QuizDefinition,
  payload: string | null | undefined
): QuizScoreMap | null {
  if (!payload) {
    return null;
  }

  const parts = payload.split('_');
  if (parts.length !== quiz.axes.length) {
    return null;
  }

  const values = parts.map((part) => Number.parseInt(part, 10));
  if (
    values.some((value) => !Number.isFinite(value) || value < 0 || value > 1000)
  ) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  if (total < 990 || total > 1010) {
    return null;
  }

  return Object.fromEntries(
    quiz.axes.map((axis, index) => [axis.key, values[index] / 10])
  );
}
