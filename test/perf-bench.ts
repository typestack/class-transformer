import 'reflect-metadata';
import { instanceToPlain, plainToInstance, Type } from '../src';

class PerfItem {
  id!: number;
  label!: string;
  active!: boolean;
}

class PerfContainer {
  id!: number;
  name!: string;
  createdAt!: Date;

  @Type(() => PerfItem)
  items!: PerfItem[];

  meta!: Record<string, any>;
}

function buildData(count: number): any[] {
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
      meta: {
        score: i % 100,
        tag: `t-${i % 10}`,
      },
    };
  }
  return arr;
}

function runBench(label: string, iterations: number, size: number): { label: string; ms: number } {
  const data = buildData(size);

  for (let i = 0; i < 5; i++) {
    const cls = plainToInstance(PerfContainer, data);
    instanceToPlain(cls);
  }

  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    const cls = plainToInstance(PerfContainer, data);
    instanceToPlain(cls);
  }
  const end = process.hrtime.bigint();

  return {
    label,
    ms: Number(end - start) / 1e6,
  };
}

const iterations = Number(process.env.CT_BENCH_ITERS || 40);
const size = Number(process.env.CT_BENCH_SIZE || 1200);
const label = process.env.CT_BENCH_LABEL || 'run';

console.log(JSON.stringify(runBench(label, iterations, size)));
