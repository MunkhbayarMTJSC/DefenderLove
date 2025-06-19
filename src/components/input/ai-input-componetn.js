import { InputComponent } from './input-component.js';

export class AIInputComponent extends InputComponent {
  #timer = 0;
  #currentDirection = 'none';

  constructor() {
    super();
    this.reset();
  }

  update(dt) {
    this._left = false;
    this._right = false;

    this.#timer -= dt;
    if (this.#timer <= 0) {
      // 🔁 Шинэ чиглэл сонгоно
      const rand = Math.random();
      if (rand < 0.4) {
        this.#currentDirection = 'left';
        this.#timer = 300 + Math.random() * 500; // 0.3–0.8 сек
      } else if (rand < 0.8) {
        this.#currentDirection = 'right';
        this.#timer = 300 + Math.random() * 500; // 0.3–0.8 сек
      } else {
        this.#currentDirection = 'none';
        this.#timer = 2500 + Math.random() * 1000; // 1.5–2.5 сек
      }
    }

    if (this.#currentDirection === 'left') {
      this._left = true;
    } else if (this.#currentDirection === 'right') {
      this._right = true;
    }
  }
  get direction() {
    return this.#currentDirection;
  }
}
