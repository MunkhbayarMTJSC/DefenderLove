import { CUSTOM_EVENTS, EventBusComponent } from '../events/event-bus-component.js';
import { HealthComponent } from '../health/health-component.js';

export class ColliderComponent {
  #healthComponent;
  #eventBusComponent;

  constructor(healthComponent, eventBusComponent) {
    this.#healthComponent = healthComponent;
    this.#eventBusComponent = eventBusComponent;
  }

  collideWithEnemyShip() {
    if (this.#healthComponent.isDead) {
      return;
    }
    this.#healthComponent.collide();
    this.#eventBusComponent.emit(CUSTOM_EVENTS.SHIP_COLLIDE);
  }

  collideWithEnemyProjectile() {
    if (this.#healthComponent.isDead) {
      return;
    }
    this.#healthComponent.hit();
    this.#eventBusComponent.emit(CUSTOM_EVENTS.SHIP_HIT);
  }
}
