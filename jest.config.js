export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts', '!src/**/*.interface.ts'],
  // globals: {
  //   'ts-jest': {
  //     tsconfig: 'tsconfig.spec.json',
  //   },
  // },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.spec.json',
      },
    ],
    // ;not_working; '^ResolveCircularDependenyWhenPlainToClass\\.spec\\.ts$': [
    // ;not_working;   'ts-jest',
    // ;not_working;   {
    // ;not_working;     tsconfig: 'tsconfig.spec.circularDep.json',
    // ;not_working;   },
    // ;not_working; ],
  },
};
