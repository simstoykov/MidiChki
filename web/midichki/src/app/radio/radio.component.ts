import { Component, ViewChild, OnInit } from "@angular/core";
import { DataFetcherService } from "../utils/data-fetcher.service";
import Tone from "tone";
import DataHolder from "../utils/dataholder";
import { Data } from "@angular/router";
import { PianoComponent } from "../piano/piano.component";

@Component({
  selector: "app-radio",
  templateUrl: "./radio.component.html",
  styleUrls: ["./radio.component.css"],
})
export class RadioComponent implements OnInit {
  @ViewChild("piano", { static: false }) childPiano: PianoComponent;

  title = "midichki";
  RELEASE_PEDAL_DELAY_S = 0.15;

  tunedIn = 0;

  firstMidiTime = 0;
  lastMidiTimePlayed = 0;
  initialToneTime = 0;
  bufferDelaySecs = 10;

  fetchedData = null;
  instrument = new Tone.Sampler(
    {
      A3: "A4.wav",
    },
    {
      baseUrl: "assets/audio/",
      release: 1,
    }
  ).toMaster();
  lastPlayed = new Date().getTime() / 1000 - 10;

  constructor(private dataFetcherService: DataFetcherService) {}

  toBeReleased = [];
  pedalSustain = false;

  sideBuffer: DataHolder[] = [];
  releaseIntent = [];

  // TODO: This logic could be made prettier

  releaseEvent(frequency: number, afterBufDelay: number, forReal = false) {
    if (this.pedalSustain) {
      // If the pedal is pushed, delay release
      this.toBeReleased.push(frequency);

      this.childPiano.halfPressIn(
        Tone.Frequency(frequency).toMidi(),
        afterBufDelay,
        Tone.context.now()
      );
    } else {
      this.releaseNote(frequency, afterBufDelay);

      this.childPiano.unPressIn(
        Tone.Frequency(frequency).toMidi(),
        afterBufDelay,
        Tone.context.now()
      );
    }
  }

  releaseNote(frequency: number, afterBufDelay: number) {
    if (this.releaseIntent[frequency]) {
      // Only delete if it was not activated in the mean time
      console.log(
        "Releasing frequency " + frequency + " with delay " + afterBufDelay
      );

      this.instrument.triggerRelease(frequency, Tone.Time(afterBufDelay));

      this.childPiano.unPressIn(
        Tone.Frequency(frequency).toMidi(),
        afterBufDelay,
        Tone.context.now()
      );
    }
  }

  pedalEvent(velocity: number, afterBufDelay: number) {
    if (velocity === 0) {
      console.log("Pedal released - releasing all the notes");

      this.pedalSustain = false;
      this.toBeReleased.forEach((note) =>
        this.releaseNote(note, afterBufDelay)
      );
      this.toBeReleased = [];
    } else {
      console.log("Pedal pressed");
      this.pedalSustain = true;
    }
  }

  handleEvent(dataHolder: DataHolder) {
    const afterBufDelay = dataHolder.delay + this.bufferDelaySecs;

    if (dataHolder.status === 144 && dataHolder.velocity > 0) {
      console.log(
        "Attacking frequency " +
          dataHolder.frequency +
          " with delay " +
          afterBufDelay
      );

      this.releaseIntent[dataHolder.frequency] = false;
      this.instrument.triggerAttack(
        dataHolder.frequency,
        Tone.Time(afterBufDelay),
        dataHolder.velocity
      );
      this.childPiano.pressIn(
        Tone.Frequency(dataHolder.frequency).toMidi(),
        dataHolder.velocity,
        afterBufDelay,
        Tone.context.now()
      );
    } else if (
      dataHolder.status === 128 ||
      (dataHolder.status == 144 && dataHolder.velocity === 0)
    ) {
      console.log(
        "Submitting a realease for frequency " +
          dataHolder.frequency +
          " with delay " +
          afterBufDelay
      );
      this.releaseEvent(dataHolder.frequency, afterBufDelay);
    } else if (dataHolder.status === 176) {
      this.pedalEvent(dataHolder.velocity, afterBufDelay);
    } else {
      console.log("Unknown event " + status);
    }
  }

  midiEventYey(dataHolder: DataHolder) {
    while (
      this.sideBuffer.length > 0 &&
      this.sideBuffer[0].delay < dataHolder.delay
    ) {
      const value = this.sideBuffer.shift();
      this.handleEvent(value);
    }

    if (
      dataHolder.status === 128 ||
      (dataHolder.status === 144 && dataHolder.velocity === 0)
    ) {
      // Postpone releasing with RELEASE_PEDAL_DELAY_S seconds
      this.releaseIntent[dataHolder.frequency] = true;
      this.sideBuffer.push(
        new DataHolder(
          dataHolder.status,
          dataHolder.frequency,
          dataHolder.delay + this.RELEASE_PEDAL_DELAY_S,
          dataHolder.velocity
        )
      );
    } else {
      this.handleEvent(dataHolder);
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
          this.midiEventYey(
            new DataHolder(
              Math.trunc(note[0]),
              this.convertToNote(note[1]),
              this.initialToneTime + midiDelay,
              note[2] / 128
            )
          );
        }

        // Process remaining release events
        while (this.sideBuffer.length > 0) {
          this.handleEvent(this.sideBuffer.shift());
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
    const numVal = parseInt(value);

    if (numVal < 1) {
      alert("Can't set delay to less than 1");
      return;
    }

    this.bufferDelaySecs = numVal;
    console.log("Changed delay to " + this.bufferDelaySecs);
  }

  clickTuneIn() {
    this.tunedIn = 1;
    this.subscribeToMusic();
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
