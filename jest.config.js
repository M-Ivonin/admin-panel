module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      { presets: ['next/babel'] },
    ],
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/.codex-orchestrator/',
    '<rootDir>/node_modules/',
    '<rootDir>/Tactical Identity Plot/',
  ],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$':
      '<rootDir>/node_modules/next/dist/build/jest/object-proxy.js',
    '^.+\\.(css|sass|scss)$':
      '<rootDir>/node_modules/next/dist/build/jest/__mocks__/styleMock.js',
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp)$':
      '<rootDir>/node_modules/next/dist/build/jest/__mocks__/fileMock.js',
    '^.+\\.(svg)$':
      '<rootDir>/node_modules/next/dist/build/jest/__mocks__/fileMock.js',
    '@next/font/(.*)':
      '<rootDir>/node_modules/next/dist/build/jest/__mocks__/nextFontMock.js',
    'next/font/(.*)':
      '<rootDir>/node_modules/next/dist/build/jest/__mocks__/nextFontMock.js',
    '^server-only$':
      '<rootDir>/node_modules/next/dist/build/jest/__mocks__/empty.js',
    '^@/(.*)$': '<rootDir>/$1',
  },
}
