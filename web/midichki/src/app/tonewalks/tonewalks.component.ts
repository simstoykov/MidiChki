import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { PianoComponent } from "../piano/piano.component";
import Tone from "tone";
import { Interval } from "../utils/Interval";

@Component({
  selector: "app-tonewalks",
  templateUrl: "./tonewalks.component.html",
  styleUrls: ["./tonewalks.component.css"],
})
export class TonewalksComponent implements AfterViewInit {
  @ViewChild("piano", { static: false }) childPiano: PianoComponent;

  instrument = new Tone.Sampler(
    {
      A3: "A4.wav",
    },
    {
      baseUrl: "assets/audio/",
      release: 1,
    }
  ).toMaster();

  maxInterval = 5;

  currentIntervalStr = "?";
  currentBase = 48;
  currentAnswer = 0;

  toUncolour = [];

  betweenChallenges = false;
  visibility = { visibility: "hidden" };

  getVisibility(): string {
    console.log("called");
    return "hidden";
  }

  clickUpdateMaxSeconds(newValue: string): void {
    this.maxInterval = parseInt(newValue);
  }

  playMidi(midiNote: number, delaySecs = 0) {
    const freq = Tone.Frequency(midiNote, "midi").toFrequency();
    this.instrument.triggerAttackRelease(
      freq,
      1.0,
      Tone.context.now() + delaySecs
    );
  }

  playSuccession(midiNote1: number, midiNote2: number) {
    this.playMidi(midiNote1);
    this.playMidi(midiNote2, 0.5);
  }

  playInterval(from: number, interval: Interval) {
    this.playSuccession(from, from + interval);
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

  restartChallenge(): void {
    this.toUncolour.forEach((note) =>
      this.childPiano.paintPianoKeyIn(note, null)
    );
    this.toUncolour = [];

    this.currentBase = this.currentAnswer;
    this.generateChallenge();
  }

  randomFromTo(from: number, to: number) {
    return Math.floor(from + Math.random() * (to - from));
  }

  generateChallenge(): void {
    this.currentAnswer =
      this.currentBase + this.randomFromTo(-this.maxInterval, this.maxInterval);
    this.currentIntervalStr =
      Interval[Math.abs(this.currentAnswer - this.currentBase)];

    this.childPiano.paintPianoKeyIn(this.currentBase, "blue");
    this.toUncolour.push(this.currentBase);
    this.playSuccession(this.currentBase, this.currentAnswer);
  }

  constructor() {}

  ngAfterViewInit(): void {
    console.log("Hey!");
    setTimeout(() => this.generateChallenge(), 2000);
  }
}
