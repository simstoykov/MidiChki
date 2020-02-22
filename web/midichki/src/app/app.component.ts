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

  firstMidiTime = 0;
  lastMidiTimePlayed = 0;
  initialToneTime = 0;

  fetchedData = null;
  instrument = new Tone.Sampler(
    {
      C5: "C5.wav"
    },
    {
      baseUrl: "assets/audio/",
      release: 1
    }
  ).toMaster();
  lastPlayed = 0;

  constructor(private dataFetcherService: DataFetcherService) {}

  playNote(
    status: number,
    frequency: number,
    delay: number,
    velocity: number,
    epochTime: number
  ) {
    this.lastPlayed = epochTime;

    if (status === 144) {
      console.log("Attacking frequency " + frequency + " with delay " + delay);
      this.instrument.triggerAttack(frequency, Tone.Time(delay), velocity);
    } else if (status === 128) {
      console.log("Releasing frequency " + frequency + " with delay " + delay);
      this.instrument.triggerRelease(frequency, Tone.Time(delay));
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

        // If I haven't played for 20s, don't wait for it - start right away (or after 5s)
        if (notes[0][4] - this.lastMidiTimePlayed > 20) {
          this.firstMidiTime = notes[0][4] - 5;
          this.initialToneTime = Tone.context.now();
        }
        // console.log("The starting time is " + this.firstMidiTime);

        for (const note of notes) {
          console.log(note);

          const midiDelay = (note[4] - this.firstMidiTime) / 1000;
          console.log("Delay is " + midiDelay);
          this.lastMidiTimePlayed = midiDelay;

          this.playNote(
            Math.trunc(note[0]),
            this.convertToNote(note[1]),
            this.initialToneTime + midiDelay,
            note[2] / 128,
            note[5]
          );
        }
      });
  }

  async subscribeToMusic() {
    await Tone.start();

    while (true) {
      await this.onClickMe();
      await this.delay(1000);
    }
  }

  ngOnInit() {
    this.subscribeToMusic();
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
