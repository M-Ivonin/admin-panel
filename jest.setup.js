// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

const mockEmotionCaches = new Set()

// Keep real styles, but insert CSS rules through CSSOM as in production. Emotion's
// development default creates a style tag per rule, making jsdom role queries slow.
jest.mock('@emotion/cache', () => {
  const createCache = jest.requireActual('@emotion/cache').default
  return {
    __esModule: true,
    default: (options) => {
      const cache = createCache({ ...options, speedy: true })
      mockEmotionCaches.add(cache)
      return cache
    },
  }
})

beforeEach(() => {
  for (const cache of mockEmotionCaches) {
    cache.sheet.flush()
    cache.inserted = {}
  }
})

// Mock window.location for deep link tests
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3001',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
  writable: true,
})
