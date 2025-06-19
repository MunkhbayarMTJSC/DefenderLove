import Phaser from 'phaser';
import { BootScene } from './scenes/boot-scene.js';
import { GameScene } from './scenes/game-scene.js';
import { PreloadScene } from './scenes/preload-scene.js';
import { MainScene } from './scenes/main-scene.js';
import * as CONFIG from './config.js';

const game = new Phaser.Game({
  type: Phaser.CANVAS,
  roundPixels: true,
  pixelArt: false,
  scale: {
    parent: 'game-container',
    width: CONFIG.SCREEN_WIDTH,
    height: CONFIG.SCREEN_HEIGHT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
  },
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: true,
    },
  },
});

game.scene.add('BootScene', BootScene);
game.scene.add('PreloadScene', PreloadScene);
game.scene.add('MainScene', MainScene);
game.scene.add('GameScene', GameScene);
game.scene.start('BootScene');
