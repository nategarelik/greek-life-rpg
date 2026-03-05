import Phaser from 'phaser';

const STORAGE_KEY = 'bromon_audio_settings';

interface AudioSettings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export class AudioSystem {
  private scene: Phaser.Scene;
  private currentBGM: Phaser.Sound.BaseSound | null = null;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.7;
  private muted: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.loadSettings();
  }

  playBGM(key: string): void {
    if (this.currentBGM?.key === key) return;

    this.stopBGM();

    if (!this.scene.sound.get(key) && !this.scene.cache.audio.exists(key)) return;

    this.currentBGM = this.scene.sound.add(key, {
      loop: true,
      volume: this.muted ? 0 : this.musicVolume,
    });
    this.currentBGM.play();
  }

  stopBGM(): void {
    if (!this.currentBGM) return;
    this.currentBGM.stop();
    this.currentBGM.destroy();
    this.currentBGM = null;
  }

  playSFX(key: string): void {
    if (!this.scene.cache.audio.exists(key)) return;
    this.scene.sound.play(key, { volume: this.muted ? 0 : this.sfxVolume });
  }

  setMusicVolume(vol: number): void {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.currentBGM && !this.muted) {
      (this.currentBGM as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).setVolume(
        this.musicVolume
      );
    }
    this.saveSettings();
  }

  setSFXVolume(vol: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
  }

  toggleMute(): void {
    this.muted = !this.muted;
    this.scene.sound.setMute(this.muted);
    this.saveSettings();
  }

  loadSettings(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const settings = JSON.parse(raw) as AudioSettings;
      this.musicVolume = settings.musicVolume ?? 0.5;
      this.sfxVolume = settings.sfxVolume ?? 0.7;
      this.muted = settings.muted ?? false;
    } catch {
      // Use defaults if settings are corrupt
    }
  }

  saveSettings(): void {
    const settings: AudioSettings = {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      muted: this.muted,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}
