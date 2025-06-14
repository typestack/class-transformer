import { plainToInstance, Transform } from '../../src/index';

describe('firestore timestamp', () => {
  class TestDto {
    @Transform(obj => (obj.value as any).toDate())
    createdAt: Date;
  }

  it('should transform Timestamp from firebase/firestore', async () => {
    const { Timestamp } = await import('firebase/firestore');
    const nowTime = Date.now();
    const timeStamp = Timestamp.fromMillis(nowTime);

    expect(plainToInstance(TestDto, { createdAt: timeStamp }).createdAt.getTime()).toBe(nowTime);
  });

  it('should transform Timestamp from firebase-admin/firestore', async () => {
    const {
      firestore: { Timestamp },
    } = await import('firebase-admin');
    const nowTime = Date.now();
    const timeStamp = Timestamp.fromMillis(nowTime);

    expect(plainToInstance(TestDto, { createdAt: timeStamp }).createdAt.getTime()).toBe(nowTime);
  });
});
