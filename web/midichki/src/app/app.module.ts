import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { HttpClientModule } from "@angular/common/http";
import { PianoComponent } from './piano/piano.component';
import { RadioComponent } from './radio/radio.component';
import { IntervalsComponent } from './intervals/intervals.component';
import { TonewalksComponent } from './tonewalks/tonewalks.component';

@NgModule({
  declarations: [AppComponent, PianoComponent, RadioComponent, IntervalsComponent, TonewalksComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
