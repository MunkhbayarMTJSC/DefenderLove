export class VictoryPopup extends Phaser.GameObjects.Container {
  constructor(scene, onNextLevel, onHome) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);

    const bg = scene.add.rectangle(0, 0, 300, 200, 0x000000, 0.8).setOrigin(0.5);
    const title = scene.add
      .text(0, -60, 'Victory!', {
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const nextButton = scene.add
      .text(0, 0, 'Next Level', {
        fontSize: '20px',
        backgroundColor: '#28a745',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();

    nextButton.on('pointerdown', () => {
      this.destroy();
      onNextLevel();
    });

    const homeButton = scene.add
      .text(0, 50, 'Home', {
        fontSize: '20px',
        backgroundColor: '#007bff',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();

    homeButton.on('pointerdown', () => {
      this.destroy();
      onHome();
    });

    this.add([bg, title, nextButton, homeButton]);
    scene.add.existing(this);
  }
}
