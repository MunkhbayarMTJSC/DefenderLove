import Phaser from 'phaser';
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    this.load.pack('asset_pack', 'assets/data/assets.json');
  }

  create() {
    this.#createAnimations();
    this.scene.start('MainScene');
  }

  #createAnimations() {
    const data = this.cache.json.get('animations_json');
    data.forEach((animation) => {
      const frames = animation.frames
        ? this.anims.generateFrameNumbers(animation.assetKey, { frames: animation.frames })
        : this.anims.generateFrameNumbers(animation.assetKey);
      this.anims.create({
        key: animation.key,
        frames: frames,
        frameRate: animation.frameRate,
        repeat: animation.repeat,
      });
    });
  }
}
