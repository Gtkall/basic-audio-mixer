import { Component, OnInit, Sanitizer } from '@angular/core';

@Component({
  selector: 'app-audio-mixer-plugin',
  templateUrl: './audio-mixer-plugin.component.html',
  styleUrls: ['./audio-mixer-plugin.component.css'],
})
export class AudioMixerPluginComponent implements OnInit {

  data?: any;
  audioFiles: Map<string, {name: string, url: string, buffer: AudioBuffer}>;
  audioFileSources: Map<string, {audBfrSrc: AudioBufferSourceNode}>;
  isPlaying: boolean;
  nowPlayingURL: string;
  nowPlayingName: string;
  canDisplay: boolean;

  /**
   * Audio API Setup
   */

  // Audio input
  audioBuffer: AudioBuffer;
  // Audio output
  ctx: AudioContext;
  // Audio Nodes
  audioBufferSourceNode: AudioBufferSourceNode;
  analyzerNode: AnalyserNode;
  gainNode: GainNode;
  dynComNode: DynamicsCompressorNode;
  lowFilter: BiquadFilterNode;
  bandFilter: BiquadFilterNode;
  highFilter: BiquadFilterNode;


  constructor() {
    this.audioFiles = new Map();
    this.audioFileSources = new Map();
    this.isPlaying = false;
    this.nowPlayingURL = '';
    this.nowPlayingName = '';

    this.canDisplay = true;
    this.ctx = new AudioContext();
    this.ctx.suspend();

    this.audioBuffer = this.ctx.createBuffer(2, 1000, 44100);
    this.audioBufferSourceNode = this.ctx.createBufferSource();

    this.analyzerNode = this.ctx.createAnalyser();
    this.gainNode = this.ctx.createGain();
    this.dynComNode = this.ctx.createDynamicsCompressor();
    this.lowFilter = this.ctx.createBiquadFilter();
    this.bandFilter = this.ctx.createBiquadFilter();
    this.highFilter = this.ctx.createBiquadFilter();
   }

  ngOnInit(): void {
    // setup the node routing
    this.routingSetup();
  }

  routingSetup(): void {
    this.audioBufferSourceNode.connect(this.analyzerNode);

    this.analyzerNode.connect(this.gainNode);
    this.gainNode.connect(this.dynComNode);
    this.dynComNode.connect(this.lowFilter);
    this.lowFilter.connect(this.bandFilter);
    this.bandFilter.connect(this.highFilter);
    this.highFilter.connect(this.ctx.destination);

  }

  nowPlaying(url: string): void {
    this.isPlaying = true;
    this.nowPlayingURL = url;
    this.nowPlayingName = this.audioFiles.get(url)?.name;
  }

  async handleFiles(files: FileList): Promise<void> {
    this.canDisplay = false;
    if (files.length) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < files.length; i++) {
        const name = files[i].name;
        const url = URL.createObjectURL(files[i]);
        this.extractAudio(url)
        .then(buffer => {
          this.audioFiles.set(url, {name, url, buffer});
        })
        .finally(() => {
          this.canDisplay = true;
        });
      }
    }
  }

  filesAsArray = () => {
    return Array.from(this.audioFiles.values());
  }

  async extractAudio(url: string): Promise<AudioBuffer> {
    return fetch(url)
    .then(data => data.arrayBuffer())
    .then(arrayBuffer => {
      return this.ctx.decodeAudioData(arrayBuffer);
    });
  }


  startPlayback(url: string): void {
    // stop current playback source
    if (this.isPlaying) {
      this.audioBufferSourceNode.stop();
      this.audioBufferSourceNode = new AudioBufferSourceNode(this.ctx);
    }

    // start the new source
    this.audioBufferSourceNode.buffer = this.audioFiles.get(url)?.buffer;
    this.audioBufferSourceNode.connect(this.gainNode);
    this.audioBufferSourceNode.start();

    // autoplay browser policy
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  pausePlayback(): void {
    if (this.audioBuffer) {
      this.ctx.suspend();
    }
  }

  onPlayButtonPressed(url: string): void {
    this.startPlayback(url);
    this.nowPlaying(url);
  }

  onResumeButtonPressed(e?: any): void {
    this.ctx.resume();
    this.isPlaying = true;
  }

  onPauseButtonPressed(e?: any): void {
    this.ctx.suspend();
    this.isPlaying = false;
  }

  onVolumeSliderChange(value: number): void {
    this.gainNode.gain.value = value;
  }

  onDCThresholdChange(value: number): void {
    this.dynComNode.threshold.value = value;
  }

  onDCAttackChange(value: number): void {
    this.dynComNode.attack.value = value;
  }

  onDCReleaseChange(value: number): void {
    this.dynComNode.release.value = value;
  }

  onLowPassChange(value: number): void {
    this.lowFilter.frequency.value = value;
  }

  onBandPassCenterChange(value: number): void {
    this.bandFilter.frequency.value = value;
  }

  onBandPassRangeChange(value: number): void {
    this.bandFilter.Q.value = value;
  }

  onHighPassChange(value: number): void {
    this.highFilter.frequency.value = value;
  }
}
