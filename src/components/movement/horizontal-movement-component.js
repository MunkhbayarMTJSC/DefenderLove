import Phaser from 'phaser';
import { isSpriteWithDynamicBody } from '../../types/typedef.js';
import { InputComponent } from '../input/input-component.js';
import * as CONFIG from '../../config.js';

export class HorizontalMovementComponent {
  #gameObject;
  #inputComponent;
  #velocity;
  constructor(gameObject, inputComponent, velocity) {
    this.#gameObject = gameObject;
    this.#inputComponent = inputComponent;
    this.#velocity = velocity;

    // @ts-ignore
    if (!isSpriteWithDynamicBody(this.#gameObject.body)) {
      return;
    }
    this.#gameObject.body.setDamping(true);
    this.#gameObject.body.setDrag(CONFIG.COMPONENT_MOVEMENT_HORIZONTAL_DRAG);
    this.#gameObject.body.setMaxVelocity(CONFIG.COMPONENT_MOVEMENT_HORIZONTAL_MAX_VELOCITY);
  }

  reset() {
    // @ts-ignore
    if (!isSpriteWithDynamicBody(this.#gameObject.body)) {
      return;
    }
    this.#gameObject.body.velocity.x = 0;
    this.#gameObject.body.setAngularAcceleration(0);
  }

  update() {
    // @ts-ignore
    if (!isSpriteWithDynamicBody(this.#gameObject.body)) {
      return;
    }

    if (this.#inputComponent.leftIsDown) {
      this.#gameObject.body.velocity.x -= this.#velocity;
    } else if (this.#inputComponent.rightIsDown) {
      this.#gameObject.body.velocity.x += this.#velocity;
    } else {
      this.#gameObject.body.setAngularAcceleration(0);
    }
  }
}
