import Phaser from 'phaser'

import main from './scenes/main'

// eslint-disable-next-line no-new
new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: [ main ]
})
