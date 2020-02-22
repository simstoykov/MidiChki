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
    const ret = new Array(this.elementsAdded);
    for (let i = 0; i < this.elementsAdded; i++) {
      const idx = (this.ptrRead + i) % this.bufferSize;
      ret[i] = this.buffer[idx];
    }

    return ret;
  }
}
