import { ColliderComponent } from '../../components/collider/collider-component.js';
import { CUSTOM_EVENTS, EventBusComponent } from '../../components/events/event-bus-component.js';
import { HealthComponent } from '../../components/health/health-component.js';
import { BotScoutInputComponent } from '../../components/input/bot-scout-input-component.js';
import { HorizontalMovementComponent } from '../../components/movement/horizontal-movement-component.js';
import { VerticalMovementComponent } from '../../components/movement/vertical-movement-component.js';
import * as CONFIG from '../../config.js';

export class ScoutEnemy extends Phaser.GameObjects.Container {
  #isInitialized;
  #inputComponent;
  #horizontalMovementComponent;
  #verticalMovementComponent;
  #healthComponent;
  #colliderComponent;
  #eventBusComponent;
  #scoutSprite;
  #shipEngineSprite;

  constructor(scene, x, y) {
    super(scene, x, y, []);

    this.#isInitialized = false;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    // @ts-ignore
    this.body.setSize(24, 24);
    // @ts-ignore
    this.body.setOffset(-12, -12);

    this.#scoutSprite = scene.add.sprite(0, 0, 'scout_move');
    this.#scoutSprite.play('scout_move');
    this.add(this.#scoutSprite);

    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    this.once(
      Phaser.GameObjects.Events.DESTROY,
      () => {
        this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
      },
      this
    );
  }

  /** @type {ColliderComponent} */
  get colliderComponent() {
    return this.#colliderComponent;
  }

  /** @type {HealthComponent} */
  get healthComponent() {
    return this.#healthComponent;
  }

  /** @type {string} */
  get shipAssetKey() {
    return 'scout_move';
  }

  /** @type {string} */
  get shipDestroyedAnimationKey() {
    return 'scout_destroy';
  }

  /**
   * @param {EventBusComponent} eventBusComponent
   */
  init(eventBusComponent) {
    this.#eventBusComponent = eventBusComponent;
    this.#inputComponent = new BotScoutInputComponent(this);
    this.#horizontalMovementComponent = new HorizontalMovementComponent(
      this,
      this.#inputComponent,
      CONFIG.ENEMY_SCOUT_MOVEMENT_HORIZONTAL_VELOCITY
    );
    this.#verticalMovementComponent = new VerticalMovementComponent(
      this,
      this.#inputComponent,
      CONFIG.ENEMY_SCOUT_MOVEMENT_VERTICAL_VELOCITY
    );
    this.#healthComponent = new HealthComponent(CONFIG.ENEMY_SCOUT_HEALTH);
    this.#colliderComponent = new ColliderComponent(this.#healthComponent, this.#eventBusComponent);
    this.#eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);
    this.#isInitialized = true;
  }

  /**
   * @returns {void}
   */
  reset() {
    this.setActive(true);
    this.setVisible(true);
    this.#healthComponent.reset();
    this.#inputComponent.startX = this.x;
    this.#verticalMovementComponent.reset();
    this.#horizontalMovementComponent.reset();
  }

  /**
   * @param {DOMHighResTimeStamp} ts
   * @param {number} dt
   * @returns {void}
   */
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
    this.#horizontalMovementComponent.update();
    this.#verticalMovementComponent.update();
  }
}
