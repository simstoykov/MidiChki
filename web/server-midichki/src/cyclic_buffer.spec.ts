import CyclicBuffer from './cyclic_buffer';
import assert from 'assert';

const testWithSize = 10;

describe('Testing the Cyclic Buffer', () => {
  describe('Size related tests', () => {
    it('Should add 1 single & get the correct size', () => {
      const cyclicBuffer = new CyclicBuffer(testWithSize);
      cyclicBuffer.addSingle([1, 2, 3, 4]);
      assert.equal(1, cyclicBuffer.getSize());
    });

    it('Should add many singles & get the correct size', () => {
      const cyclicBuffer = new CyclicBuffer(testWithSize);
      for (let i = 0; i < testWithSize; i++) {
        cyclicBuffer.addSingle([i, i, i, i]);
      }
      assert.equal(testWithSize, cyclicBuffer.getSize());
    });

    it('Should add many multiples & get the correct size', () => {
      const cyclicBuffer = new CyclicBuffer(testWithSize);
      for (let i = 0; i < testWithSize * 10; i++) {
        cyclicBuffer.addMultiple([
          [i, i, i, i],
          [i, i, i, i],
          [i, i, i, i],
          [i, i, i, i]
        ]);
      }
      assert.equal(testWithSize, cyclicBuffer.getSize());
    });
  });

  describe('Reading related stuff', () => {
    it('Should read all after many many add singles', () => {
      const cyclicBuffer = new CyclicBuffer(testWithSize);
      const all = testWithSize + 300;

      for (let i = 0; i < all; i++) {
        cyclicBuffer.addSingle([i, i, i, i]);
      }

      for (let i = all - testWithSize; i < all; i++) {
        assert.equal([i, i, i, i], cyclicBuffer.readAt(i));
      }
    });

    it('Should read all after many many add multiples', () => {
      const cyclicBuffer = new CyclicBuffer(testWithSize);
      const all = testWithSize + 300;

      for (let i = 0; i < all; i++) {
        cyclicBuffer.addMultiple([[i, i, i, i]]);
      }

      for (let i = all - testWithSize; i < all; i++) {
        assert.equal([i, i, i, i], cyclicBuffer.readAt(i));
      }
    });
  });
});
