import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import * as d3 from "d3";

@Component({
  selector: "app-piano",
  templateUrl: "./piano.component.html",
  styleUrls: ["./piano.component.css"],
})
export class PianoComponent implements OnInit {
  @Output() onPianoKeyClick = new EventEmitter<number>();

  constructor() {}

  NOTES_PER_OCTAVE = 12;
  NUM_OCTAVES = 8;
  WHITE_NOTES_PER_OCTAVE = 7;
  NUM_NOTES = this.NOTES_PER_OCTAVE * this.NUM_OCTAVES;

  KEY_PERCENTAGE = 100 / this.NUM_NOTES;
  WHITE_KEY_PERCENTAGE = 100 / (this.WHITE_NOTES_PER_OCTAVE * this.NUM_OCTAVES);

  LOWEST_C_MIDI = 12;

  octaveWhite = ["C", "D", "E", "F", "G", "A", "B"];
  octaveBlack = ["C#", "D#", "F#", "G#", "A#"];
  octaveAll = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  octaveAllWeird: string[];
  columnBlack = [1, 2, 4, 5, 6];
  whiteIndex = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

  midiColor: number[][] = new Array(this.NUM_NOTES);

  mapOctaveIndexToMidi = {
    0: 0,
    1: 2,
    2: 4,
    3: 5,
    4: 7,
    5: 9,
    6: 11,

    7: 1,
    8: 3,
    9: 6,
    10: 8,
    11: 10,
  };

  indexToMidiNote(index: number): number {
    const octave = Math.floor(index / 12);
    const octaveIndex = index % 12;
    return (
      (octave + 1) * this.NOTES_PER_OCTAVE +
      this.mapOctaveIndexToMidi[octaveIndex]
    );
  }

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

  animateNotePressed(midiKey: number, delay: number, thisColor: string) {
    const which = midiKey - this.LOWEST_C_MIDI;

    const rem = which % this.NOTES_PER_OCTAVE;
    const octaves = Math.floor(which / this.NOTES_PER_OCTAVE);

    const whitesToGo =
      this.whiteIndex[rem] * this.WHITE_KEY_PERCENTAGE +
      octaves * this.NOTES_PER_OCTAVE * this.KEY_PERCENTAGE;

    const shouldAdd =
      rem != 0 && this.whiteIndex[rem - 1] == this.whiteIndex[rem];
    const toAdd = shouldAdd ? this.WHITE_KEY_PERCENTAGE / 2 : 0;

    const selection = d3
      .select("#svgholder")
      .append("circle")
      .attr("class", "flyingnote")
      .attr("r", this.KEY_PERCENTAGE / 2 + "%")
      .attr("cy", "100%")
      .attr("cx", whitesToGo + this.WHITE_KEY_PERCENTAGE / 2 + toAdd + "%")
      .attr("fill", thisColor);

    selection
      .transition()
      .duration(delay)
      .ease(d3.easeLinear)
      .on("end", () => selection.remove())
      .attr("cy", this.KEY_PERCENTAGE / 2 + "%");
  }

  paintPianoKeyIn(midiKey: number, color: string) {
    console.log("Painting painting painting");
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
    const thisColor = `rgb(${r},${g},${b})`;

    this.midiColor[midiKey] = [r, g, b];
    const calculatedDelay = (delaySecs - initialToneTime) * 1000;

    this.animateNotePressed(midiKey, calculatedDelay, thisColor);
    setTimeout(() => this.paintPianoKeyIn(midiKey, thisColor), calculatedDelay);
  }

  halfPressIn(midiKey: number, delaySecs: number, initialToneTime: number) {
    const r = Math.min(255, this.midiColor[midiKey][0] * 1.2);
    const g = Math.min(255, this.midiColor[midiKey][1] * 1.2);
    const b = Math.min(255, this.midiColor[midiKey][2] * 1.2);

    setTimeout(
      () => this.paintPianoKeyIn(midiKey, `rgb(${r},${g},${b})`),
      (delaySecs - initialToneTime) * 1000
    );
  }

  unPressIn(midiKey: number, delaySecs: number, initialToneTime: number) {
    setTimeout(
      () => this.paintPianoKeyIn(midiKey, null),
      (delaySecs - initialToneTime) * 1000
    );
  }

  ngOnInit(): void {
    this.octaveAllWeird = this.octaveWhite.concat(this.octaveBlack);

    d3.select("#piano-container")
      .selectAll(null)
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
      })
      .on("click", (data: string, index: number) => {
        const whichMidi = this.indexToMidiNote(index);
        console.log(
          `Button pressed:\ndata: ${data}\nindex: ${index}\nmidi: ${whichMidi}`
        );

        this.onPianoKeyClick.emit(whichMidi);
      });
  }
}
