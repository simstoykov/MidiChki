import { Component, OnInit } from "@angular/core";
import * as d3 from "d3";

@Component({
  selector: "app-piano",
  templateUrl: "./piano.component.html",
  styleUrls: ["./piano.component.css"]
})
export class PianoComponent implements OnInit {
  constructor() {}

  NOTES_PER_OCTAVE = 12;
  WHITE_NOTES_PER_OCTAVE = 7;
  NUM_OCTAVES = 8;

  LOWEST_C_MIDI = 12;

  octaveWhite = ["C", "D", "E", "F", "G", "A", "B"];
  octaveBlack = ["C#", "D#", "F#", "G#", "A#"];
  octaveAll = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  octaveAllWeird: string[];
  columnBlack = [1, 2, 4, 5, 6];

  midiColor: number[][] = new Array(this.NOTES_PER_OCTAVE * this.NUM_OCTAVES);

  repeat<T>(toRepeat: T[], times: number): T[] {
    const ret = Array(times * toRepeat.length);

    for (let t = 0; t < times; t++) {
      for (let i = 0; i < toRepeat.length; i++) {
        const idx = t * toRepeat.length + i;
        ret[idx] = toRepeat[i];
      }
    }

    return ret;
  }

  getGridStyle(index: number): string {
    const rem = index % this.NOTES_PER_OCTAVE;
    const octaves = Math.floor(index / this.NOTES_PER_OCTAVE);

    const colToApply =
      octaves * this.WHITE_NOTES_PER_OCTAVE +
      (rem < this.WHITE_NOTES_PER_OCTAVE
        ? rem + 1
        : this.columnBlack[rem - this.WHITE_NOTES_PER_OCTAVE]);
    return `grid-area: 1/${colToApply}/1/${colToApply};`;
  }

  findRightIndexRem(noteId: string) {
    for (let i = 0; i < this.octaveAllWeird.length; i++) {
      const note = this.octaveAllWeird[i];
      if (noteId.startsWith(note)) {
        return i;
      }
    }

    return -1;
  }

  paintIn(midiKey: number, color: string) {
    const octave = Math.floor(
      (midiKey - this.LOWEST_C_MIDI) / this.NOTES_PER_OCTAVE
    );
    const which = (midiKey - this.LOWEST_C_MIDI) % this.NOTES_PER_OCTAVE;
    const id = `${this.octaveAll[which]}\\${octave}`;

    const index = this.NOTES_PER_OCTAVE * octave + this.findRightIndexRem(id);

    d3.select(document.getElementById(id))
      .attr(
        "style",
        color === null
          ? this.getGridStyle(index)
          : `${this.getGridStyle(index)}; background-color: ${color}`
      )
      .attr("class", (data: string) => {
        return data.length === 2 ? "key black" : "key white";
      });
  }

  randomBetween(to: number, multiplier: number) {
    return to * Math.random() * multiplier;
  }

  pressIn(
    midiKey: number,
    velocity: number,
    delaySecs: number,
    initialToneTime: number
  ) {
    const base = 0.3;
    const r =
      255 - this.randomBetween(255, base + (1 - base) * (velocity / 128));
    const g =
      255 - this.randomBetween(255, base + (1 - base) * (velocity / 128));
    const b =
      255 - this.randomBetween(255, base + (1 - base) * (velocity / 128));

    this.midiColor[midiKey] = [r, g, b];

    setTimeout(
      () => this.paintIn(midiKey, `rgb(${r},${g},${b})`),
      (delaySecs - initialToneTime) * 1000
    );
  }

  halfPressIn(midiKey: number, delaySecs: number, initialToneTime: number) {
    const r = Math.min(255, this.midiColor[midiKey][0] * 1.2);
    const g = Math.min(255, this.midiColor[midiKey][1] * 1.2);
    const b = Math.min(255, this.midiColor[midiKey][2] * 1.2);

    setTimeout(
      () => this.paintIn(midiKey, `rgb(${r},${g},${b})`),
      (delaySecs - initialToneTime) * 1000
    );
  }

  unPressIn(midiKey: number, delaySecs: number, initialToneTime: number) {
    setTimeout(
      () => this.paintIn(midiKey, null),
      (delaySecs - initialToneTime) * 1000
    );
  }

  ngOnInit(): void {
    this.octaveAllWeird = this.octaveWhite.concat(this.octaveBlack);

    d3.select("#piano-container")
      .selectAll("div")
      .data(this.repeat(this.octaveAllWeird, this.NUM_OCTAVES))
      .enter()
      .append("div")
      .attr("id", (data: string, index: number) => {
        const octaveNum = Math.floor(index / this.NOTES_PER_OCTAVE);
        return `${data}\\${octaveNum}`;
      })
      .attr("class", (data: string) => {
        return data.length === 2 ? "key black" : "key white";
      })
      .attr("style", (data: string, index: number) => {
        return this.getGridStyle(index);
      });
  }
}
