import Phaser from 'phaser'
import io from 'socket.io-client'

export default class extends Phaser.Scene {
  constructor () {
    super({key: 'main'})
  }

  preload () {
    this.load.image('redShip', 'assets/ships/playerShip1_red.png')
    this.load.image('blueShip', 'assets/ships/playerShip1_blue.png')
    this.load.image('blueEnemyShip', 'assets/ships/enemyBlue1.png')
    this.load.image('redEnemyShip', 'assets/ships/enemyRed1.png')
  }

  create () {
    this.socket = io()

    this.otherPlayers = this.physics.add.group()

    this.socket.on('currentPlayers', players => {
      Object.keys(players).forEach(id => {
        if (players[id].playerID === this.socket.id) {
          addPlayer(players[id])
        } else {
          addOtherPlayer(players[id])
        }
      })
    })

    this.socket.on('newPlayer', player => {
      addOtherPlayer(player)
    })

    this.socket.on('playerMoved', player => {
      this.otherPlayers.getChildren().forEach(otherPlayer => {
        if (player.playerID === otherPlayer.playerID) {
          otherPlayer.setRotation(player.rotation)
          otherPlayer.setPosition(player.x, player.y)
        }
      })
    })

    this.socket.on('disconnect', playerID => {
      this.otherPlayers.getChildren().forEach(player => {
        if (playerID === player.playerID) {
          player.destroy()
        }
      })
    })

    this.cursors = this.input.keyboard.createCursorKeys()

    // should get it's own "object" file
    const addPlayer = player => {
      this.ship = this.physics.add.image(player.x, player.y, player.team === 'blue' ? 'blueShip' : 'redShip')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(53, 40)

      this.ship.setDrag(100)
      this.ship.setAngularDrag(100)
      this.ship.setMaxVelocity(200)
    }

    const addOtherPlayer = player => {
      const otherPlayer = this.add.sprite(player.x, player.y, player.team === 'blue' ? 'blueEnemyShip' : 'redEnemyShip')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(53, 40)

      otherPlayer.playerID = player.playerID

      this.otherPlayers.add(otherPlayer)
    }
  }

  update () {
    if (this.ship) {
      if (this.cursors.left.isDown) {
        this.ship.setAngularVelocity(-150)
      } else if (this.cursors.right.isDown) {
        this.ship.setAngularVelocity(150)
      } else {
        this.ship.setAngularVelocity(0)
      }

      if (this.cursors.up.isDown) {
        this.physics.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration)
      } else {
        this.ship.setAcceleration(0)
      }

      this.physics.world.wrap(this.ship, 5)

      let x = this.ship.x
      let y = this.ship.y
      let r = this.ship.rotation
      if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
        this.socket.emit('playerMovement', {x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation})
      }

      this.ship.oldPosition = {
        x: this.ship.x,
        y: this.ship.y,
        rotation: this.ship.rotation
      }
    }
  }
}
