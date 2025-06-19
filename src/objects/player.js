import { ColliderComponent } from '../components/collider/collider-component.js';
// @ts-ignore
import { CUSTOM_EVENTS, EventBusComponent } from '../components/events/event-bus-component.js';
import { HealthComponent } from '../components/health/health-component.js';
import { ButtonInputComponent } from '../components/input/button-input-component.js';
import { KeyboardInputComponent } from '../components/input/keyboard-input-component.js';
import { HorizontalMovementComponent } from '../components/movement/horizontal-movement-component.js';
import { WeaponComponent } from '../components/weapon/weapon-component.js';
import * as CONFIG from '../config.js';

/**
 * Used to represent the players ship in our game. This class is responsible
 * for constructing all of the required components for our Player ship.
 */
export class Player extends Phaser.GameObjects.Container {
  #inputController;
  #healthComponent;
  #weaponComponent;
  #horizontalMovementComponent;
  #colliderComponent;
  #eventBusComponent;
  #playerSprite;

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

    this.#playerSprite = scene.add.sprite(0, 0, 'player_move');
    this.#playerSprite.play('player_move');
    this.add(this.#playerSprite);

    if (this.scene.sys.game.device.os.android || this.scene.sys.game.device.os.iOS) {
      this.#inputController = new ButtonInputComponent(this.scene);
    } else {
      this.#inputController = new KeyboardInputComponent(this.scene);
    }

    this.#horizontalMovementComponent = new HorizontalMovementComponent(
      this,
      this.#inputController,
      CONFIG.PLAYER_MOVEMENT_HORIZONTAL_VELOCITY
    );
    this.#weaponComponent = new WeaponComponent(
      this,
      this.#inputController,
      {
        speed: CONFIG.PLAYER_BULLET_SPEED,
        interval: CONFIG.PLAYER_BULLET_INTERVAL,
        lifespan: CONFIG.PLAYER_BULLET_LIFESPAN,
        maxCount: CONFIG.PLAYER_BULLET_MAX_COUNT,
        yOffset: -20,
        flipY: false,
      },
      this.#eventBusComponent
    );
    this.#healthComponent = new HealthComponent(CONFIG.PLAYER_HEALTH);
    this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent);

    this.#hide();

    // register custom events
    this.#eventBusComponent.on(CUSTOM_EVENTS.PLAYER_SPAWN, this.#spawn, this);

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

  get weaponGameObjectGroup() {
    return this.#weaponComponent.bulletGroup;
  }

  get weaponComponent() {
    return this.#weaponComponent;
  }

  // @ts-ignore
  update(ts, dt) {
    if (!this.active) {
      return;
    }

    if (this.#healthComponent.isDead) {
      this.#hide();
      this.setVisible(true);
      this.#playerSprite.play({
        key: 'explosion',
      });
      this.#eventBusComponent.emit(CUSTOM_EVENTS.PLAYER_DESTROYED);
      return;
    }

    this.#inputController.update();
    this.#horizontalMovementComponent.update();
    this.#weaponComponent.update(dt);
  }

  #hide() {
    this.setActive(false);
    this.setVisible(false);
    this.#playerSprite.setVisible(false);
    this.#inputController.lockInput = true;
  }

  /**
   * @returns {void}
   */
  #spawn() {
    this.setActive(true);
    this.setVisible(true);
    this.#playerSprite.setVisible(true);
    this.#playerSprite.play('player_move');
    this.#healthComponent.reset();
    this.setPosition(this.scene.scale.width / 2, this.scene.scale.height - 132);
    this.#inputController.lockInput = false;
  }
}
