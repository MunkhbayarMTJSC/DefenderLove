import * as CONFIG from '../config.js';
export class MainScene extends Phaser.Scene {
  #playBtn;
  #levelBtn;
  #settingBtn;
  #width;
  #height;
  constructor() {
    super({ key: 'MainScene' });
  }
  create() {
    this.#width = CONFIG.SCREEN_WIDTH;
    this.#height = CONFIG.SCREEN_HEIGHT;
    this.add.image(0, 0, 'bg').setOrigin(0, 0).setScale(0.5);
    this.#playBtn = this.add.sprite(this.#width / 2, this.#height * 0.35, 'buttons', 0).setScale(1.2);
    this.#levelBtn = this.add.sprite(this.#width / 2, this.#height * 0.5, 'buttons', 1).setScale(1.2);
    this.#settingBtn = this.add.sprite(this.#width / 2, this.#height * 0.65, 'buttons', 2).setScale(1.2);
    this.#playBtn.setInteractive({ useHandCursor: true });
    this.#playBtn.on('pointerdown', () => this.scene.start('GameScene'));
  }
}
