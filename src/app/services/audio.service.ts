import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  muted = signal(false);
  private bg: HTMLAudioElement | null = null;

  startBackground() {
    if (this.bg) return;
    this.bg = new Audio('sounds/music-background-ady-afakafaka.mp3');
    this.bg.loop = true;
    this.bg.volume = 0.35;
    this.bg.play().catch(() => {});
  }

  toggleMute() {
    this.muted.update(m => !m);
    if (this.bg) this.bg.muted = this.muted();
  }

  play(name: 'click' | 'wrong' | 'woueh') {
    if (this.muted()) return;
    const a = new Audio(`sounds/${name}.mp3`);
    a.volume = 0.8;
    a.play().catch(() => {});
  }
}
