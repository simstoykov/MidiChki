import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class DataFetcherService {
  constructor(private http: HttpClient) {}

  public getAll() {
    return this.http.get("http://localhost:8080/getAll");
  }
}
