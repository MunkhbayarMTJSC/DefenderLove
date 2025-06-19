import { InputComponent } from './input-component';
export class ButtonInputComponent extends InputComponent {
  #buttons = {};
  #inputLocked = false;

  constructor(scene) {
    super();
    this.#createButtons(scene);
  }

  set lockInput(val) {
    this.#inputLocked = val;
  }

  update() {
    if (this.#inputLocked) {
      this.reset();
      return;
    }

    this._left = this.#buttons.left.isDown;
    this._right = this.#buttons.right.isDown;
    this._up = this.#buttons.up.isDown;
    this._down = this.#buttons.down.isDown;
    this._shoot = this.#buttons.shoot.isDown;
  }

  #createButtons(scene) {
    const { width, height } = scene.scale;

    // 🠔 Зүүн товч
    this.#buttons.left = this.#createButton(scene, 60, height - 80, 'btn_left');
    this.#buttons.right = this.#createButton(scene, 160, height - 80, 'btn_right');

    // 🎯 Буудах товч
    this.#buttons.shoot = this.#createButton(scene, width - 80, height - 80, 'btn_shoot');
  }

  #createButton(scene, x, y, texture) {
    const button = scene.add.image(x, y, texture).setScrollFactor(0).setDepth(1000);
    button.setInteractive({ useHandCursor: true });
    button.setAlpha(0.7); // хагас тунгалаг

    // Custom isDown property
    button.isDown = false;

    button.on('pointerdown', () => {
      button.setAlpha(1);
      button.isDown = true;
    });

    button.on('pointerup', () => {
      button.setAlpha(0.7);
      button.isDown = false;
    });

    button.on('pointerout', () => {
      button.setAlpha(0.7);
      button.isDown = false;
    });

    return button;
  }
}
