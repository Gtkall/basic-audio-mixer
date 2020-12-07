import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioMixerPluginComponent } from './audio-mixer-plugin.component';

describe('AudioMixerPluginComponent', () => {
  let component: AudioMixerPluginComponent;
  let fixture: ComponentFixture<AudioMixerPluginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioMixerPluginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioMixerPluginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
