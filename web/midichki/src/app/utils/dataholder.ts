export default class DataHolder {
  status: number;
  frequency: number;
  delay: number;
  velocity: number;
  official: boolean;

  constructor(
    status: number,
    frequency: number,
    delay: number,
    velocity: number,
    official = false
  ) {
    this.status = status;
    this.frequency = frequency;
    this.delay = delay;
    this.velocity = velocity;
    this.official = official;
  }

  makeOfficial() {
    this.official = true;
  }
}
