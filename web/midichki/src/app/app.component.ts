import { Component } from "@angular/core";
import { DataFetcherService } from "./data-fetcher.service";
import Tone from "tone";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "midichki";

  tunedIn = 0;

  firstMidiTime = 0;
  lastMidiTimePlayed = 0;
  initialToneTime = 0;
  bufferDelaySecs = 20;

  fetchedData = null;
  instrument = new Tone.Sampler(
    {
      A4: "A4.wav"
    },
    {
      baseUrl: "assets/audio/",
      release: 1
    }
  ).toMaster();
  lastPlayed = 0;

  constructor(private dataFetcherService: DataFetcherService) {}

  playNote(status: number, frequency: number, delay: number, velocity: number) {
    const afterBufDelay = delay + this.bufferDelaySecs;

    if (status === 144) {
      console.log(
        "Attacking frequency " + frequency + " with delay " + afterBufDelay
      );
      this.instrument.triggerAttack(
        frequency,
        Tone.Time(afterBufDelay),
        velocity
      );
    } else if (status === 128) {
      console.log(
        "Releasing frequency " + frequency + " with delay " + afterBufDelay
      );
      this.instrument.triggerRelease(frequency, Tone.Time(afterBufDelay));
    } else {
      console.log("Unknown event " + status);
    }
  }

  convertToNote(key: number) {
    return Tone.Midi(key).toNote();
  }

  async onClickMe() {
    console.log(`Fetching notes after ${this.lastPlayed}`);
    this.dataFetcherService
      .getAfter(this.lastPlayed)
      .subscribe((notes: number[][]) => {
        // console.log(`Got ${notes.length} notes`);
        this.fetchedData = notes;

        if (notes.length == 0) {
          return;
        }

        // If I haven't played for 20s,
        if (notes[0][4] - this.lastMidiTimePlayed > 20 * 1000) {
          console.log(
            "Resetting time because we haven't played for the past " +
              (notes[0][4] - this.lastMidiTimePlayed) +
              " ms"
          );
          // Start playing now (or 5 secs later)
          this.firstMidiTime = notes[0][4];
          this.initialToneTime = Tone.context.now();
        }
        this.lastMidiTimePlayed = notes[notes.length - 1][4];
        // console.log("The starting time is " + this.firstMidiTime);

        for (const note of notes) {
          console.log(note);

          const midiDelay = (note[4] - this.firstMidiTime) / 1000;
          console.log("Delay is " + midiDelay);

          this.lastPlayed = note[5];
          this.playNote(
            Math.trunc(note[0]),
            this.convertToNote(note[1]),
            this.initialToneTime + midiDelay,
            note[2] / 128
          );
        }
      });
  }

  async subscribeToMusic() {
    await Tone.start();
    while (true) {
      await this.onClickMe();
      await this.delay((this.bufferDelaySecs * 1000) / 3);
    }
  }

  ngOnInit() {}

  clickChangeDelay(value: string) {
    console.log("Changing delay to " + value);
    this.bufferDelaySecs = parseInt(value);
  }

  clickTuneIn() {
    this.tunedIn = 1;
    this.subscribeToMusic();
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
