import { ColliderComponent } from '../../components/collider/collider-component.js';
import { CUSTOM_EVENTS, EventBusComponent } from '../../components/events/event-bus-component.js';
import { HealthComponent } from '../../components/health/health-component.js';
import { BotFighterInputComponent } from '../../components/input/bot-fighter-input-component.js';
import { VerticalMovementComponent } from '../../components/movement/vertical-movement-component.js';
import { WeaponComponent } from '../../components/weapon/weapon-component.js';
import * as CONFIG from '../../config.js';

/**
 * Used to represent the Fighter enemy ship in our game. This class is responsible
 * for constructing all of the required components for the Fighter enemy ship.
 * @type {import('../../types/typedef.js').Enemy}
 */
export class FighterEnemy extends Phaser.GameObjects.Container {
  #isInitialized;
  #inputComponent;
  #verticalMovementComponent;
  #healthComponent;
  #colliderComponent;
  #shipSprite;
  #shipEngineSprite;
  #weaponComponent;
  #eventBusComponent;

  constructor(scene, x, y) {
    super(scene, x, y, []);

    this.#isInitialized = false;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    // @ts-ignore
    this.body.setSize(24, 24);
    // @ts-ignore
    this.body.setOffset(-12, -12);

    this.#shipSprite = scene.add.sprite(0, 0, 'fighter', 0);
    this.#shipEngineSprite = scene.add.sprite(0, 0, 'fighter_engine').setFlipY(true);
    this.#shipEngineSprite.play('fighter_engine');
    this.add([this.#shipEngineSprite, this.#shipSprite]);

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

  get shipAssetKey() {
    return 'fighter';
  }

  get shipDestroyedAnimationKey() {
    return 'fighter_destroy';
  }

  init(eventBusComponent) {
    this.#eventBusComponent = eventBusComponent;
    this.#inputComponent = new BotFighterInputComponent();
    this.#verticalMovementComponent = new VerticalMovementComponent(
      this,
      this.#inputComponent,
      CONFIG.ENEMY_FIGHTER_MOVEMENT_VERTICAL_VELOCITY
    );
    this.#weaponComponent = new WeaponComponent(
      this,
      this.#inputComponent,
      {
        speed: CONFIG.ENEMY_FIGHTER_BULLET_SPEED,
        interval: CONFIG.ENEMY_FIGHTER_BULLET_INTERVAL,
        lifespan: CONFIG.ENEMY_FIGHTER_BULLET_LIFESPAN,
        maxCount: CONFIG.ENEMY_FIGHTER_BULLET_MAX_COUNT,
        yOffset: 10,
        flipY: true,
      },
      this.#eventBusComponent
    );
    this.#healthComponent = new HealthComponent(CONFIG.ENEMY_FIGHTER_HEALTH);
    this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent);
    this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);
    this.#isInitialized = true;
  }

  reset() {
    this.setActive(true);
    this.setVisible(true);
    this.#healthComponent.reset();
    this.#verticalMovementComponent.reset();
  }

  // @ts-ignore
  update(ts, dt) {
    if (!this.#isInitialized) {
      return;
    }

    if (!this.active) {
      return;
    }

    if (this.#healthComponent.isDead) {
      this.setActive(false);
      this.setVisible(false);
      this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_DESTROYED, this);
    }

    this.#inputComponent.update();
    this.#verticalMovementComponent.update();
    this.#weaponComponent.update(dt);
  }
}
