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

  constructor(private dataFetcherService: DataFetcherService) {}

  playNote(status: number, frequency: number, delay: number, velocity: number) {
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
    await Tone.start();

    this.dataFetcherService.getAll().subscribe((notes: number[][]) => {
      this.fetchedData = notes;

      const startTime = Tone.context.now();
      const firstTime = notes[0][5];
      console.log("The starting time is " + firstTime);

      for (const note of notes) {
        console.log(note);

        const delay = note[5] - firstTime;
        console.log("Delay is " + delay);

        this.playNote(
          Math.trunc(note[0]),
          this.convertToNote(note[1]),
          startTime + delay,
          note[2] / 128
        );
      }
    });
  }

  ngOnInit() {}
}
