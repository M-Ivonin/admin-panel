import { getQuizDefinition } from '@/modules/quizzes/definitions';
import {
  calculateQuizScores,
  decodeResultPayload,
  encodeResultPayload,
  resolveQuizResult,
} from '@/modules/quizzes/session';

describe('quiz session helpers', () => {
  it('calculates normalized tactical identity scores that stay close to 100%', () => {
    const quiz = getQuizDefinition('tactical-identity');
    if (!quiz) {
      throw new Error('Expected tactical identity quiz definition');
    }

    const scores = calculateQuizScores(
      quiz,
      Array(quiz.questions.length).fill(50)
    );
    const total = Object.values(scores).reduce((sum, value) => sum + value, 0);

    expect(total).toBeCloseTo(100, 1);
    expect(Object.keys(scores)).toEqual(['purist', 'heavyMetal', 'pragmatist']);
  });

  it('resolves hybrid fan results with stable slugs', () => {
    const quiz = getQuizDefinition('fan-archetype');
    if (!quiz) {
      throw new Error('Expected fan archetype quiz definition');
    }

    const result = resolveQuizResult(quiz, {
      analyst: 41.1,
      ultra: 31.2,
      gloryHunter: 27.7,
    });

    expect(result).toMatchObject({
      slug: 'data-driven-diehard',
      name: 'The Data-Driven Diehard',
    });
  });

  it('round-trips a result payload for deterministic direct opens', () => {
    const quiz = getQuizDefinition('transfer-guru');
    if (!quiz) {
      throw new Error('Expected transfer guru quiz definition');
    }

    const payload = encodeResultPayload(quiz, {
      moneyball: 41.1,
      academy: 31.2,
      galactico: 27.7,
    });

    expect(decodeResultPayload(quiz, payload)).toEqual({
      moneyball: 41.1,
      academy: 31.2,
      galactico: 27.7,
    });
    expect(decodeResultPayload(quiz, '1_2')).toBeNull();
  });
});
