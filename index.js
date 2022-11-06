// PROJECT SETUP

const canvas = document.querySelector('canvas');

// Canvas Context is responsible for drawing shapes and sprites onto our game
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576; 

// fillRect() takes 4 arguments: x co-ord, y co-ord, rectangle width, and rectangle height
// This is to give our canvas a background colour that's distinct from the rest of the webpage
c.fillRect(0, 0, canvas.width, canvas.height);


// CREATE PLAYER AND ENEMY

const gravity = 0.7


const background = new Sprite({
	position: {
		x: 0,
		y: 0
	},
	imageSrc: './img/background.png'
})


const shop = new Sprite({
	position: {
		x: 600,
		y: 128
	},
	imageSrc: './img/shop.png',
	scale: 2.75,
	framesMax: 6, // The shop spritesheet has 6 frames to cycle through
})

const player = new Fighter({
	position: {
		x: 0,
		y: 0,
	},
	velocity: {
		x: 0,
		y: 10,
	},
	offset: {
		x: 0,
		y: 0
	},
	imageSrc: './img/samuraiMack/Idle.png',
	framesMax: 8, // the Idle animation has 8 frames to cycle through
	scale: 2.5,
	offset: {
		x: 215,
		y: 157,
	},
	sprites: {
		idle: {
			imageSrc: './img/samuraiMack/Idle.png',
			framesMax: 8 // the Idle animation has 8 frames to cycle through
		},
		run: {
			imageSrc: './img/samuraiMack/Run.png',
			framesMax: 8
		},
		jump: {
			imageSrc: './img/samuraiMack/Jump.png',
			framesMax: 2
		},
		fall: {
			imageSrc: './img/samuraiMack/Fall.png',
			framesMax: 2
		},
		attack1: {
			imageSrc: './img/samuraiMack/Attack1.png',
			framesMax: 6
		},
		takeHit: {
			imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
			framesMax: 4
		},
		death: {
			imageSrc: './img/samuraiMack/Death.png',
			framesMax: 6
		}
	},
	attackBox: {
		offset: {
			x: 100,
			y: 50,
		},
		width: 160,
		height: 50
	}
});




const enemy = new Fighter({
	position: {
		x: 1024,
		y: 0,
	},
	velocity: {
		x: 0,
		y: 10,
	},
	colour: 'blue',
	offset: { // This allows the enemy attackBox to face the other direction (left)
		x: -50,
		y: 0 
	},
	imageSrc: './img/kenji/Idle.png',
	framesMax: 4,
	scale: 2.5,
	offset: {
		x: 215,
		y: 167,
	},
	sprites: {
		idle: {
			imageSrc: './img/kenji/Idle.png',
			framesMax: 4 
		},
		run: {
			imageSrc: './img/kenji/Run.png',
			framesMax: 8
		},
		jump: {
			imageSrc: './img/kenji/Jump.png',
			framesMax: 2
		},
		fall: {
			imageSrc: './img/kenji/Fall.png',
			framesMax: 2
		},
		attack1: {
			imageSrc: './img/kenji/Attack1.png',
			framesMax: 4
		},
		takeHit: {
			imageSrc: './img/kenji/Take hit.png',
			framesMax: 3
		},
		death: {
			imageSrc: './img/kenji/Death.png',
			framesMax: 7
		}
	},
	attackBox: {
		offset: {
			x: -170,
			y: 50,
		},
		width: 170,
		height: 50
	}
})





// Whenever you have moving objects within canvas, you need a velocity property within your sprite class
// Velocity determines the direction sprites should be moving when they're inside an animation loop


// This object declares all the keys we want to control our game
const keys = {
	a: {
		pressed: false
	},
	d: {
		pressed: false
	},
	w: {
		pressed: false
	},
	ArrowRight: {
		pressed: false
	},
	ArrowLeft: {
		pressed: false
	}
}




decreaseTimer()


function animate() {
	// Basically says "which functions do I want to loop over and over again?"
	window.requestAnimationFrame(animate)
	c.fillStyle = 'black'
	c.fillRect(0, 0, canvas.width, canvas.height) // This is to make sure the sprites don't smear across the screen
	background.update()
	shop.update()
	c.fillStyle = 'rgba(255, 255, 255, 0.15)' // This is a white overlay to increase the visual contrast between the fighters and the background+shop. Red, green, blue, and opacity
	c.fillRect(0, 0, canvas.width, canvas.height)
	player.update()
	enemy.update()

	// This makes sure that the sprites don't continue moving even during frames where no left or right keys are being pressed
	player.velocity.x = 0
	enemy.velocity.x = 0

	// Player movement
	if (keys.a.pressed && player.lastKey === 'a') {
		player.velocity.x = -5
		player.switchSprite('run') // Switch to running sprite
	} else if (keys.d.pressed && player.lastKey === 'd') {
		player.velocity.x = 5
		player.switchSprite('run')
	} else {
		player.switchSprite('idle') // The default sprite is the idle animation
	}

	// If the player is jumping up (negative y velocity), switch to jump sprite
	if (player.velocity.y < 0 ) { 
		player.switchSprite('jump')
	} else if (player.velocity.y > 0) { // If the player is falling down (positive y velocity)
		player.switchSprite('fall')
	}

	// Enemy movement
	if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
		enemy.velocity.x = -5
		enemy.switchSprite('run')
	} else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
		enemy.velocity.x = 5
		enemy.switchSprite('run')
	} else {
		enemy.switchSprite('idle') 
	}


	if (enemy.velocity.y < 0 ) { 
		enemy.switchSprite('jump')
	} else if (enemy.velocity.y > 0) {
		enemy.switchSprite('fall')
	}


	// PLAYER - Detect for collision and ENEMY gets hit
	if (rectangularCollision( { // Are the player's attackBox and the enemy colliding?
		rectangle1: player,
		rectangle2: enemy
	}) &&
		// Has the attack button been pressed?
		player.isAttacking && player.framesCurrent === 4
		) {
		enemy.takeHit()
		player.isAttacking = false // We immediately set this to false so that one press of the attack button doesn't amount to multiple hits on the enemy
		//document.querySelector('#enemyHealth').style.width = enemy.health + '%' //We add a string of '%', otherwise the health will decrease  by 20px
		
		// This is from an animation library. It makes it so that the health bar moves downward smoothly instead of instantly.
		// The first argument is the element you want to animate (get it by the id)
		// The second argument is what you actually want to animate. In this case, it's the width of the health bar
		gsap.to('#enemyHealth', { 
			width: enemy.health + '%'
		})
	}


	// If player misses
	if (player.isAttacking && player.framesCurrent === 4) { // framesCurrent === 4 ensures that the enemy hp only goes down during the sword swing frame of the attack animation
		player.isAttacking = false
	}

	// ENEMY - Detect for collision and PLAYER gets hit
	if (rectangularCollision( { // Are the enemy's attackBox and the player colliding?
		rectangle1: enemy,
		rectangle2: player
	}) &&
		// Has the attack button been pressed?
		enemy.isAttacking && enemy.framesCurrent === 2
		) {
		player.takeHit()
		enemy.isAttacking = false // We immediately set this to false so that one press of the attack button doesn't amount to multiple hits on the player
		//document.querySelector('#playerHealth').style.width = player.health + '%'

	gsap.to('#playerHealth', { 
			width: player.health + '%'
		})
}


// If enemy misses
	if (enemy.isAttacking && enemy.framesCurrent === 2) {
		enemy.isAttacking = false
	}

   // End the game based on health
   if (enemy.health <= 0 || player.health <= 0) {
   	determineWinner({ player, enemy, timerId })
   }
};

animate(); // infinite loop



// MOVE CHARACTERS WITH EVENT LISTENERS
// You shouldn't declare sprite velocity within the listeners... that causes issues
window.addEventListener('keydown', (e) => {
	
	// If the player isn't dead, allow the switch case/movement
	if (!player.dead) {
	switch (e.key) {
	  case 'd':
		keys.d.pressed = true
		player.lastKey = 'd'
		break
	  case 'a':
		keys.a.pressed = true
		player.lastKey = 'a'
		break
	  case 'w':
		player.velocity.y = -20
		break
	  case ' ': // spacebar
	    player.attack()
	    break
	  }
	}

	// Enemy keys
	// If the enemy isn't dead, allow the switch case/movement
	if (!enemy.dead) {
	switch (e.key) {	
	 case 'ArrowRight':
	  keys.ArrowRight.pressed = true
	  enemy.lastKey = 'ArrowRight'
	  break
	 case 'ArrowLeft':
	  keys.ArrowLeft.pressed = true
	  enemy.lastKey = 'ArrowLeft'
	  break
	 case 'ArrowUp':
	  enemy.velocity.y = -20
	  break
	 case 'ArrowDown':
	  enemy.attack()
	  break
	 }
	}
})

window.addEventListener('keyup', (e) => {
	switch (e.key) {
		case 'd':
		keys.d.pressed = false
		break
		case 'a':
		keys.a.pressed = false
		break
	}

	// Enemy keys
	switch (e.key) {
		case 'ArrowRight':
		keys.ArrowRight.pressed = false
		break
		case 'ArrowLeft':
		keys.ArrowLeft.pressed = false
		break

	}
})