export class DefeatPopup extends Phaser.GameObjects.Container {
  constructor(scene, onRestart) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);

    const bg = scene.add.rectangle(0, 0, 300, 180, 0x000000, 0.8).setOrigin(0.5);
    const title = scene.add
      .text(0, -50, 'Game Over', {
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const restartButton = scene.add
      .text(0, 20, 'Restart', {
        fontSize: '20px',
        backgroundColor: '#dc3545',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();

    restartButton.on('pointerdown', () => {
      this.destroy();
      onRestart();
    });

    this.add([bg, title, restartButton]);
    scene.add.existing(this);
  }
}
