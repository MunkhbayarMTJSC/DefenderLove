import Phaser from 'phaser';
import { CUSTOM_EVENTS, EventBusComponent } from '../events/event-bus-component.js';

export class EnemyDestroyedComponent {
  #scene;
  #group;
  #eventBusComponent;

  constructor(scene, eventBusComponent) {
    this.#scene = scene;
    this.#eventBusComponent = eventBusComponent;

    // create group
    this.#group = this.#scene.add.group({
      name: `${this.constructor.name}-${Phaser.Math.RND.uuid()}`,
    });

    this.#eventBusComponent.on(CUSTOM_EVENTS.ENEMY_DESTROYED, (enemy) => {
      const gameObject = this.#group.get(enemy.x, enemy.y, enemy.shipAssetKey, 0);
      gameObject.play({
        key: enemy.shipDestroyedAnimationKey,
      });
      gameObject.on('animationcomplete', () => {
        gameObject.destroy();
      });
    });
  }
}
