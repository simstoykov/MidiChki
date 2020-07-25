import { Component, ViewChild, AfterViewInit } from "@angular/core";
import { PianoComponent } from "../piano/piano.component";
import Tone from "tone";
import { Interval } from "../utils/Interval";

@Component({
  selector: "app-intervals",
  templateUrl: "./intervals.component.html",
  styleUrls: ["./intervals.component.css"],
})
export class IntervalsComponent implements AfterViewInit {
  @ViewChild("piano", { static: false }) childPiano: PianoComponent;

  GENERATE_FROM_MIDI_KEY = 48;
  GENERATE_TO_MIDI_KEY = 72;

  instrument = new Tone.Sampler(
    {
      A3: "A4.wav",
    },
    {
      baseUrl: "assets/audio/",
      release: 1,
    }
  ).toMaster();

  currentInterval = 0;
  currentBase = 0;
  currentAnswer = 0;
  currentDirection = "both";

  toUncolour = [];

  constructor() {}

  playMidi(midiNote: number, delaySecs = 0) {
    const freq = Tone.Frequency(midiNote, "midi").toFrequency();
    this.instrument.triggerAttackRelease(
      freq,
      1.0,
      Tone.context.now() + delaySecs
    );
  }

  onPianoKeyClick(midiNote: number): void {
    this.playMidi(midiNote);

    this.toUncolour.push(midiNote);
    if (midiNote === this.currentAnswer) {
      this.childPiano.paintPianoKeyIn(midiNote, "green");
      setTimeout(() => {
        this.restartChallenge();
      }, 2000);
    } else {
      this.childPiano.paintPianoKeyIn(midiNote, "red");
    }
  }

  playSuccession(midiNote1: number, midiNote2: number) {
    this.playMidi(midiNote1);
    this.playMidi(midiNote2, 0.5);
  }

  playInterval(from: number, interval: Interval) {
    this.playMidi(from);
    this.playMidi(from + interval, 0.5);
  }

  randomFromTo(from: number, to: number) {
    return Math.floor(from + Math.random() * (to - from));
  }

  restartChallenge(): void {
    this.toUncolour.forEach((note) =>
      this.childPiano.paintPianoKeyIn(note, null)
    );
    this.toUncolour = [];

    this.generateChallenge();
  }

  generateChallenge(): void {
    this.currentBase = this.randomFromTo(
      this.GENERATE_FROM_MIDI_KEY,
      this.GENERATE_TO_MIDI_KEY
    );

    if (this.currentDirection === "up") {
      this.currentAnswer = this.currentBase + this.currentInterval;
    } else if (this.currentDirection === "down") {
      this.currentAnswer = this.currentBase - this.currentInterval;
    } else {
      let multiplier = 1;
      if (this.randomFromTo(0, 2) == 0) {
        multiplier = -1;
      }

      this.currentAnswer = this.currentBase + this.currentInterval * multiplier;
    }

    this.childPiano.paintPianoKeyIn(this.currentBase, "blue");
    this.toUncolour.push(this.currentBase);
    this.playSuccession(this.currentBase, this.currentAnswer);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.generateChallenge(), 2000);
  }

  intervalChanged(event: any): void {
    const newVal = event.target.value;
    this.currentInterval = parseInt(newVal);
    this.restartChallenge();
  }

  directionChanged(event: any): void {
    const newVal = event.target.value;
    this.currentDirection = newVal;
    this.restartChallenge();
  }
}
