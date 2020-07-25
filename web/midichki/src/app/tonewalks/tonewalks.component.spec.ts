import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TonewalksComponent } from './tonewalks.component';

describe('TonewalksComponent', () => {
  let component: TonewalksComponent;
  let fixture: ComponentFixture<TonewalksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TonewalksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TonewalksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
