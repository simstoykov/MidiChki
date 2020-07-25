import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { RadioComponent } from "./radio/radio.component";
import { IntervalsComponent } from "./intervals/intervals.component";
import { TonewalksComponent } from "./tonewalks/tonewalks.component";

const routes: Routes = [
  { path: "radio", component: RadioComponent },
  { path: "intervals", component: IntervalsComponent },
  { path: "tonewalks", component: TonewalksComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
