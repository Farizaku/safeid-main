module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>', '<rootDir>/../tests/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@types/(.*)$': '<rootDir>/@types/$1',
    '^@api/(.*)$': '<rootDir>/api/$1',
    '^@core/(.*)$': '<rootDir>/core/$1',
    '^@infra/(.*)$': '<rootDir>/infra/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
};
