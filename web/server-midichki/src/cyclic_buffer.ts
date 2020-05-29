import logger from './logger';

export default class CyclicBuffer {
  buffer: number[][];
  elementsAdded: number;

  ptrRead: number; // Read this value first
  ptrWrite: number; // Write to this index

  constructor(private bufferSize: number) {
    this.buffer = new Array(this.bufferSize);

    this.ptrRead = 0;
    this.ptrWrite = 0;
    this.elementsAdded = 0;
  }

  public deleteOld(seconds: number) {
    const cutOff = new Date().getTime() / 1000 - seconds;
    let cntDeleted = 0;

    while (this.elementsAdded > 0 && this.buffer[this.ptrRead][5] < cutOff) {
      this.elementsAdded -= 1;
      this.ptrRead = (this.ptrRead + 1) % this.bufferSize;
      cntDeleted += 1;
    }

    logger.info(`Deleted ${cntDeleted} notes older than ${seconds} seconds`);
  }

  public addSingle(value: number[]) {
    if (this.elementsAdded === this.bufferSize) {
      this.ptrRead++;
    } else {
      this.elementsAdded++;
    }

    this.buffer[this.ptrWrite] = value;
    this.ptrWrite++;
  }

  public addMultiple(values: number[][]) {
    for (const value of values) {
      this.addSingle(value);
    }
  }

  public getSize() {
    return this.elementsAdded;
  }

  public readAt(idx: number) {
    return this.buffer[(this.ptrRead + idx) % this.bufferSize];
  }

  public readAll() {
    console.log(
      'Reading while there are ' + this.elementsAdded + ' in the buffer'
    );
    const ret = new Array(this.elementsAdded);
    for (let i = 0; i < this.elementsAdded; i++) {
      const idx = (this.ptrRead + i) % this.bufferSize;
      ret[i] = this.buffer[idx];
    }

    console.log('Result is ' + ret);

    return ret;
  }
}
