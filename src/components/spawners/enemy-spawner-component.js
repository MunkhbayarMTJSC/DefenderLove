import Phaser from 'phaser';
import { CUSTOM_EVENTS } from '../events/event-bus-component.js';

/**
 * This class handles spawning enemies using an object pool.
 * It ensures the number of enemies per level matches the config.
 */
export class EnemySpawnerComponent {
  #scene;
  #spawnInterval;
  #spawnAt;
  #group;
  #disableSpawning;
  #remainingCount;
  #enemyClass;
  #eventBusComponent;

  constructor(scene, enemyClass, spawnConfig, eventBusComponent) {
    this.#scene = scene;
    this.#enemyClass = enemyClass;
    this.#eventBusComponent = eventBusComponent;

    // Create group (pool)
    this.#group = this.#scene.add.group({
      name: `${this.constructor.name}-${Phaser.Math.RND.uuid()}`,
      classType: enemyClass,
      runChildUpdate: true,
      createCallback: (enemy) => {
        enemy.init(eventBusComponent);
      },
    });

    this.#spawnInterval = spawnConfig.interval;
    this.#spawnAt = spawnConfig.spawnAt;
    this.#disableSpawning = false;
    this.#remainingCount = 0;

    // Auto-update
    this.#scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    this.#scene.physics.world.on(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);
    this.#scene.events.once(
      Phaser.Scenes.Events.DESTROY,
      () => {
        this.#scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.#scene.physics.world.off(Phaser.Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);
      },
      this
    );

    // Stop spawning on game over
    this.#eventBusComponent.on(CUSTOM_EVENTS.GAME_OVER, () => {
      this.#disableSpawning = true;
    });
  }

  get phaserGroup() {
    return this.#group;
  }

  /**
   * Called every frame, handles spawning logic.
   */
  update(ts, dt) {
    if (this.#disableSpawning || this.#remainingCount <= 0) {
      return;
    }

    this.#spawnAt -= dt;
    if (this.#spawnAt > 0) {
      return;
    }

    const x = Phaser.Math.RND.between(30, this.#scene.scale.width - 30);
    const enemy = this.#group.get(x, -20);

    if (enemy && !enemy.active) {
      enemy.reset();
      this.#remainingCount--;
    }

    this.#spawnAt = this.#spawnInterval;
    if (this.#remainingCount <= 0) {
      this.#disableSpawning = true;
    }
  }

  /**
   * Deactivates enemies that leave the screen.
   */
  worldStep(delta) {
    this.#group.getChildren().forEach((enemy) => {
      if (!enemy.active) return;

      if (enemy.y > this.#scene.scale.height + 50) {
        enemy.setActive(false);
        enemy.setVisible(false);
      }
    });
  }

  /**
   * Prepares enemy pool and resets spawn state for this group.
   * Ensures exactly `count` enemies are created for the level.
   */
  spawnGroup(enemyInfo) {
    console.log('spawnGroup called with:', enemyInfo);

    this.#spawnInterval = enemyInfo.interval;
    this.#spawnAt = 0;
    this.#remainingCount = enemyInfo.count;
    this.#disableSpawning = false;

    const currentCount = this.#group.getLength();
    const requiredCount = enemyInfo.count;

    if (currentCount < requiredCount) {
      const toCreate = requiredCount - currentCount;
      for (let i = 0; i < toCreate; i++) {
        const enemy = new this.#enemyClass(this.#scene, 0, 0);
        enemy.init(this.#eventBusComponent);
        enemy.setActive(false);
        enemy.setVisible(false);
        this.#group.add(enemy);
      }
    }

    console.log(`Group prepared: ${this.#group.getLength()} total, ${this.#remainingCount} to spawn`);
  }
}
