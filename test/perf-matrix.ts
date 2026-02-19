import 'reflect-metadata';
import { Expose, Transform, Type, instanceToInstance, instanceToPlain, plainToInstance } from '../src';

class FlatUser {
  id!: number;
  firstName!: string;
  lastName!: string;
  age!: number;
}

class NestedItem {
  id!: number;
  label!: string;
  active!: boolean;
}

class NestedContainer {
  id!: number;
  name!: string;
  createdAt!: Date;

  @Type(() => NestedItem)
  items!: NestedItem[];
}

class DecoratedProfile {
  @Expose()
  id!: number;

  @Expose({ groups: ['public'] })
  displayName!: string;

  @Expose({ since: 1, until: 3 })
  legacyScore!: number;

  @Transform(({ value }) => String(value).toUpperCase())
  code!: string;
}

type ScenarioResult = {
  name: string;
  ms: number;
};

function hrtimeMs(start: bigint, end: bigint): number {
  return Number(end - start) / 1e6;
}

function runScenario(name: string, iterations: number, fn: () => void): ScenarioResult {
  for (let i = 0; i < 5; i++) {
    fn();
  }

  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = process.hrtime.bigint();

  return { name, ms: hrtimeMs(start, end) };
}

function buildFlatData(count: number): any[] {
  const arr = new Array(count);
  for (let i = 0; i < count; i++) {
    arr[i] = {
      id: i,
      firstName: `first-${i}`,
      lastName: `last-${i}`,
      age: i % 100,
    };
  }
  return arr;
}

function buildNestedData(count: number): any[] {
  const arr = new Array(count);
  for (let i = 0; i < count; i++) {
    arr[i] = {
      id: i,
      name: `name-${i}`,
      createdAt: '2024-01-01T00:00:00.000Z',
      items: [
        { id: i * 2, label: `a-${i}`, active: i % 2 === 0 },
        { id: i * 2 + 1, label: `b-${i}`, active: i % 3 === 0 },
      ],
    };
  }
  return arr;
}

function buildDecoratedData(count: number): any[] {
  const arr = new Array(count);
  for (let i = 0; i < count; i++) {
    arr[i] = {
      id: i,
      displayName: `user-${i}`,
      legacyScore: i,
      code: `c-${i}`,
    };
  }
  return arr;
}

function printSummary(results: ScenarioResult[]): void {
  const widestName = results.reduce((max, item) => Math.max(max, item.name.length), 0);
  for (const result of results) {
    const padded = result.name.padEnd(widestName, ' ');
    console.log(`${padded}  ${result.ms.toFixed(3)} ms`);
  }
}

const iterations = Number(process.env.CT_BENCH_ITERS || 30);
const size = Number(process.env.CT_BENCH_SIZE || 1000);

const flatData = buildFlatData(size);
const nestedData = buildNestedData(size);
const decoratedData = buildDecoratedData(size);

const flatInstances = plainToInstance(FlatUser, flatData);
const nestedInstances = plainToInstance(NestedContainer, nestedData);
const decoratedInstances = plainToInstance(DecoratedProfile, decoratedData, {
  groups: ['public'],
  version: 2,
});

const results: ScenarioResult[] = [];

results.push(
  runScenario('flat/plain->class', iterations, () => {
    plainToInstance(FlatUser, flatData);
  })
);
results.push(
  runScenario('flat/class->plain', iterations, () => {
    instanceToPlain(flatInstances);
  })
);
results.push(
  runScenario('nested/plain->class', iterations, () => {
    plainToInstance(NestedContainer, nestedData);
  })
);
results.push(
  runScenario('nested/class->plain', iterations, () => {
    instanceToPlain(nestedInstances);
  })
);
results.push(
  runScenario('decorated/plain->class', iterations, () => {
    plainToInstance(DecoratedProfile, decoratedData, { groups: ['public'], version: 2 });
  })
);
results.push(
  runScenario('decorated/class->plain', iterations, () => {
    instanceToPlain(decoratedInstances, { groups: ['public'], version: 2 });
  })
);
results.push(
  runScenario('decorated/class->class', iterations, () => {
    instanceToInstance(decoratedInstances, { groups: ['public'], version: 2 });
  })
);

console.log(JSON.stringify(results));
printSummary(results);
