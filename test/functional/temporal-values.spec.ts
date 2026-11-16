import 'reflect-metadata';
import { instanceToInstance, instanceToPlain, plainToInstance } from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';
import { Type } from '../../src/decorators';

/**
 * Stands in for Temporal.Instant on Node versions without Temporal. Like the real class, it
 * needs a constructor argument, keeps its value out of enumerable properties, and reports
 * `[object Temporal.Instant]`.
 */
class FakeInstant {
  readonly #epochNanoseconds: bigint;

  constructor(epochNanoseconds: bigint) {
    this.#epochNanoseconds = BigInt(epochNanoseconds);
  }

  get [Symbol.toStringTag](): string {
    return 'Temporal.Instant';
  }

  toJSON(): string {
    return new Date(Number(this.#epochNanoseconds / BigInt(1000000))).toISOString();
  }
}

function instantAt(isoString: string): FakeInstant {
  return new FakeInstant(BigInt(Date.parse(isoString)) * BigInt(1000000));
}

describe('Temporal values', () => {
  const createdAt = instantAt('2026-11-15T10:00:00.000Z');
  const expiresAt = instantAt('2026-11-16T10:00:00.000Z');

  defaultMetadataStorage.clear();

  class Session {
    expiresAt: FakeInstant;
  }

  class Account {
    createdAt: FakeInstant;

    @Type(() => Session)
    sessions: Session[];
  }

  it('plainToInstance keeps a Temporal value, including a nested one', () => {
    const account = plainToInstance(Account, { createdAt, sessions: [{ expiresAt }] });

    expect(account.createdAt).toBe(createdAt);
    expect(account.sessions[0]).toBeInstanceOf(Session);
    expect(account.sessions[0].expiresAt).toBe(expiresAt);
  });

  it('instanceToPlain keeps a Temporal value, so JSON gets its ISO string', () => {
    const session = Object.assign(new Session(), { expiresAt });
    const account = Object.assign(new Account(), { createdAt, sessions: [session] });

    const plainAccount = instanceToPlain(account);

    expect(plainAccount.createdAt).toBe(createdAt);
    expect(JSON.parse(JSON.stringify(plainAccount))).toEqual({
      createdAt: '2026-11-15T10:00:00.000Z',
      sessions: [{ expiresAt: '2026-11-16T10:00:00.000Z' }],
    });
  });

  it('instanceToInstance keeps a Temporal value', () => {
    const account = Object.assign(new Account(), { createdAt, sessions: [] });

    expect(instanceToInstance(account).createdAt).toBe(createdAt);
  });
});
