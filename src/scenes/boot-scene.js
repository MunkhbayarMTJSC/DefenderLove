import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.load.json('animations_json', 'assets/data/animations.json');
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
