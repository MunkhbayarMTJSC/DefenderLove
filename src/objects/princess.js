import { ColliderComponent } from '../components/collider/collider-component.js';
// @ts-ignore
import { CUSTOM_EVENTS, EventBusComponent } from '../components/events/event-bus-component.js';
import { HealthComponent } from '../components/health/health-component.js';
import * as CONFIG from '../config.js';

/**
 * Used to represent the players ship in our game. This class is responsible
 * for constructing all of the required components for our Player ship.
 */
export class Princess extends Phaser.GameObjects.Container {
  #healthComponent;
  #colliderComponent;
  #eventBusComponent;
  #princessSprite;

  constructor(scene, eventBusComponent) {
    super(scene, scene.scale.width / 2, scene.scale.height - 32, []);
    this.#eventBusComponent = eventBusComponent;

    // add game object to scene and enabled physics body
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    // @ts-ignore
    this.body.setSize(24, 24);
    // @ts-ignore
    this.body.setOffset(-12, -12);
    // @ts-ignore
    this.body.setCollideWorldBounds(true);
    this.setDepth(2);

    this.#princessSprite = scene.add.sprite(0, 0, 'princess_idle');
    this.#princessSprite.play('princess_idle');
    this.add(this.#princessSprite);

    this.#healthComponent = new HealthComponent(CONFIG.PRINCESS_HEALTH);
    this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent);

    this.#hide();

    // register custom events
    this.#eventBusComponent.on(CUSTOM_EVENTS.PRINCESS_SPAWN, this.#spawn, this);
    this.#eventBusComponent.emit(CUSTOM_EVENTS.PRINCESS_SPAWN, this);

    // handle automatic call to update
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    this.once(
      Phaser.GameObjects.Events.DESTROY,
      () => {
        this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
      },
      this
    );
  }

  get colliderComponent() {
    return this.#colliderComponent;
  }

  get healthComponent() {
    return this.#healthComponent;
  }

  // @ts-ignore
  update(ts, dt) {
    if (!this.active) {
      return;
    }

    if (this.#healthComponent.isDead) {
      this.#hide();
      this.setVisible(true);
      this.#princessSprite.play({
        key: 'explosion',
      });
      this.#eventBusComponent.emit(CUSTOM_EVENTS.PRINCESS_DESTROYED);
      return;
    }
  }

  #hide() {
    this.setActive(false);
    this.setVisible(false);
    this.#princessSprite.setVisible(false);
  }

  #spawn() {
    this.setActive(true);
    this.setVisible(true);
    this.#princessSprite.setVisible(true);
    this.#princessSprite.play('princess_idle');
    this.#healthComponent.reset();
    this.setPosition(this.scene.scale.width / 2, this.scene.scale.height - 32);
  }
}
