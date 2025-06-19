import { CUSTOM_EVENTS, EventBusComponent } from '../components/events/event-bus-component';
import { LEVELS } from '../level.js';
import { VictoryPopup } from '../components/end/victory-component.js';
import { DefeatPopup } from '../components/end/defeat-component.js';

export class GameController {
  #scene;
  #eventBus;
  #currentLevelIndex = 0;
  #totalEnemiesToKill = 0;
  #killedEnemiesCount = 0;
  #isGameActive = false;

  constructor(scene, eventBusComponent) {
    this.#scene = scene;
    this.#eventBus = eventBusComponent;
    console.log('object :>> ', eventBusComponent);
    this.#registerEvents();
  }

  #registerEvents() {
    this.#eventBus.on(CUSTOM_EVENTS.PLAYER_DESTROYED, this.#onPlayerDestroyed, this);
    this.#eventBus.on(CUSTOM_EVENTS.PRINCESS_DESTROYED, this.#onPrincessDestroyed, this);
    this.#eventBus.on(CUSTOM_EVENTS.ENEMY_INIT, this.#onEnemySpawned, this);
    this.#eventBus.on(CUSTOM_EVENTS.ENEMY_DESTROYED, this.#onEnemyDestroyed, this);
    this.#eventBus.on(CUSTOM_EVENTS.LEVEL_COMPLETE, this.#onLevelComplete, this);
  }

  startGame() {
    this.#currentLevelIndex = 0;
    this.#startLevel();
  }
  #startLevel() {
    const levelData = LEVELS[this.#currentLevelIndex];
    if (!levelData) {
      // Тоглоом дууссан
      this.#onGameComplete();
      return;
    }

    this.#isGameActive = true;

    // Background солих
    this.#scene.add.image(0, 0, levelData.background).setOrigin(0).setScale(0.5);

    // Дайсныг spawn хийх логик эхлүүлэх (энэ нь enemy spawner-уудтай харилцах хэсэг)
    this.#spawnEnemies(levelData.enemies);

    // Лэвэл эхэлснийг бусад хэсэгт мэдээлэх
    console.log('GameController eventBus:', this.#eventBus);
    this.#eventBus.emit(CUSTOM_EVENTS.LEVEL_STARTED, this.#currentLevelIndex + 1);
  }
  #spawnEnemies(enemies) {
    this.#totalEnemiesToKill = enemies.reduce((sum, e) => sum + e.count, 0);
    this.#killedEnemiesCount = 0;

    enemies.forEach((enemyInfo) => {
      this.#eventBus.emit(CUSTOM_EVENTS.SPAWN_ENEMY_GROUP, enemyInfo);
    });
  }
  #onLevelComplete() {
    this.#isGameActive = false;
    this.#currentLevelIndex++;

    console.log('Level Competed');

    new VictoryPopup(
      this.#scene,
      () => {
        this.#startLevel(); // ✅ зөв дараагийн level эхлүүлэх
      },
      () => {
        this.#scene.scene.start('MainMenu');
      }
    );
  }

  #onGameOver() {
    this.#isGameActive = false;
    this.#eventBus.emit(CUSTOM_EVENTS.GAME_OVER);
    new DefeatPopup(this.#scene, () => {
      this.restartGame();
    });
  }

  #onGameComplete() {
    // Тоглоом амжилттай төгссөн
    this.#eventBus.emit(CUSTOM_EVENTS.GAME_COMPLETE);
  }

  restartGame() {
    console.log('Restarting game...');
    this.#scene.scene.restart(); // Phaser-ийн үндсэн restart
  }

  #onPlayerDestroyed() {
    console.log('Player dead. Game over');
    // Game over popup харуулах эсвэл auto restart хийх
  }

  #onPrincessDestroyed() {
    console.log('Princess destroyed. Game over');
  }

  #onEnemySpawned(enemy) {}

  #onEnemyDestroyed(enemy) {
    this.#killedEnemiesCount++;
    if (this.#killedEnemiesCount >= this.#totalEnemiesToKill) {
      this.#eventBus.emit(CUSTOM_EVENTS.LEVEL_COMPLETE);
      console.log('End irsen', this.#killedEnemiesCount, this.#totalEnemiesToKill);
    }
  }
}
