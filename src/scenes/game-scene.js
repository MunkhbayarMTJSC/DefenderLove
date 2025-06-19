// @ts-nocheck
import { EnemySpawnerComponent } from '../components/spawners/enemy-spawner-component.js';
import Phaser from 'phaser';
import { FighterEnemy } from '../objects/enemies/fighter-enemy.js';
import { ScoutEnemy } from '../objects/enemies/scout-enemy.js';
import { Player } from '../objects/player.js';
import * as CONFIG from '../config.js';
import { CUSTOM_EVENTS, EventBusComponent } from '../components/events/event-bus-component.js';
import { EnemyDestroyedComponent } from '../components/spawners/enemy-destroyed-component.js';
import { Score } from '../objects/ui/score.js';
import { Lives } from '../objects/ui/lives.js';
import { AudioManager } from '../objects/audio-manager.js';
import { Princess } from '../objects/princess.js';
import { GameController } from '../game/game-controller.js';

export class GameScene extends Phaser.Scene {
  #evenBus;
  #gameController;
  #spawnerMap = new Map();
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.add.image(0, 0, 'bglvl1').setOrigin(0, 0).setAlpha(0.5).setScale(0.5);
    this.#evenBus = new EventBusComponent();

    // spawn player
    const player = new Player(this, this.#evenBus);
    const princess = new Princess(this, this.#evenBus);
    this.#gameController = new GameController(this, this.#evenBus);

    // spawn enemies
    const scoutSpawner = new EnemySpawnerComponent(
      this,
      ScoutEnemy,
      {
        interval: CONFIG.ENEMY_FIGHTER_GROUP_SPAWN_INTERVAL,
        spawnAt: CONFIG.ENEMY_FIGHTER_GROUP_SPAWN_START,
      },
      this.#evenBus
    );
    const fighterSpawner = new EnemySpawnerComponent(
      this,
      FighterEnemy,
      {
        interval: CONFIG.ENEMY_SCOUT_GROUP_SPAWN_INTERVAL,
        spawnAt: CONFIG.ENEMY_SCOUT_GROUP_SPAWN_START,
      },
      this.#evenBus
    );
    this.#spawnerMap.set('ScoutEnemy', scoutSpawner);
    this.#spawnerMap.set('FighterEnemy', fighterSpawner);
    this.#evenBus.off(CUSTOM_EVENTS.SPAWN_ENEMY_GROUP);
    this.#evenBus.on(CUSTOM_EVENTS.SPAWN_ENEMY_GROUP, (enemyInfo) => {
      console.log('object :>> ', enemyInfo);
      const spawner = this.#spawnerMap.get(enemyInfo.type);
      if (spawner) {
        spawner.spawnGroup(enemyInfo);
      }
    });
    this.#gameController.startGame();
    new EnemyDestroyedComponent(this, this.#evenBus);

    this.physics.add.overlap(player, scoutSpawner.phaserGroup, (playerGameObject, enemyGameObject) => {
      if (!enemyGameObject.active || !playerGameObject.active) {
        return;
      }
      playerGameObject.colliderComponent.collideWithEnemyShip();
      enemyGameObject.colliderComponent.collideWithEnemyShip();
    });
    this.physics.add.overlap(player, fighterSpawner.phaserGroup, (playerGameObject, enemyGameObject) => {
      if (!enemyGameObject.active || !playerGameObject.active) {
        return;
      }
      playerGameObject.colliderComponent.collideWithEnemyShip();
      enemyGameObject.colliderComponent.collideWithEnemyShip();
    });
    this.#evenBus.on(CUSTOM_EVENTS.ENEMY_INIT, (gameObject) => {
      // if name is an enemy from pool, add collision check for weapon group if needed
      if (gameObject.constructor.name !== 'FighterEnemy') {
        return;
      }

      this.physics.add.overlap(player, gameObject.weaponGameObjectGroup, (playerGameObject, projectileGameObject) => {
        if (!playerGameObject.active) {
          return;
        }

        gameObject.weaponComponent.destroyBullet(projectileGameObject);
        playerGameObject.colliderComponent.collideWithEnemyProjectile();
      });
    });

    // collisions for player weapons and enemy groups
    this.physics.add.overlap(
      player.weaponGameObjectGroup,
      scoutSpawner.phaserGroup,
      (enemyGameObject, projectileGameObject) => {
        if (!enemyGameObject.active) {
          return;
        }
        player.weaponComponent.destroyBullet(projectileGameObject);
        enemyGameObject.colliderComponent.collideWithEnemyProjectile();
      }
    );
    this.physics.add.overlap(
      player.weaponGameObjectGroup,
      fighterSpawner.phaserGroup,
      (enemyGameObject, projectileGameObject) => {
        if (!enemyGameObject.active) {
          return;
        }
        player.weaponComponent.destroyBullet(projectileGameObject);
        enemyGameObject.colliderComponent.collideWithEnemyProjectile();
      }
    );

    // ui
    new Score(this, this.#evenBus);
    new Lives(this, this.#evenBus);

    // audio
    new AudioManager(this, this.#evenBus);
  }
}
