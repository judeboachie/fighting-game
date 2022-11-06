class Sprite {
	constructor({ position, imageSrc, scale = 1, framesMax = 1, offset = { x:0, y:0} }) {
		this.position = position
		this.width = 50
		this.height = 150
		this.image = new Image() // this creates an html image but within a javascript property
		this.image.src = imageSrc
		this.scale = scale // The scale of the image. Set to 1 by default, but this will vary based on the sprite we're currently using
		this.framesMax = framesMax // The maximum amount of frames in the image. Set to 1 by default
		this.framesCurrent = 0,
		this.framesElapsed = 0, // How many frames have we currently lapsed over throughout the animation
		this.framesHold = 5 // How many frames should we go through before we update framesCurrent
		this.offset = offset // This is for dealing with the blank space around the sprites for cropping purposes
	};

	draw() {
		c.drawImage(
			this.image, 
			// To animate the shop sprite, we need to cycle through cropped portions of the image
			// // The next FOUR arguments are for cropping in canvas
			this.framesCurrent * (this.image.width / this.framesMax), // The x co-ord the crop mark will start at
			0, // The y co-ord the crop mark will start at
			this.image.width / this.framesMax, // How far we want the crop mark to extend horizontally (to the right)
			this.image.height, // How far we want the crop mark to extend vertically (downward)
			this.position.x - this.offset.x, 
			this.position.y - this.offset.y, 
			(this.image.width / this.framesMax) * this.scale, 
			this.image.height * this.scale
		)

	};

	animateFrames(){
		this.framesElapsed++

		// Divide framesElapsed by framesHold, if the remainder is zero, then update the sprite's frame
		// This slows down the rate at which sprites are cycled through to a reasonable pace
		if (this.framesElapsed % this.framesHold === 0) {
			// Cycling through the spritesheet by changing the variable that the x co-ord is multiplied by
			if (this.framesCurrent < this.framesMax - 1) {
				this.framesCurrent++
			} else {
				this.framesCurrent = 0
			}
		}
	}


	// This will update properties as sprite are moving across the screen
	update() {
		this.draw()
		this.animateFrames()
	};


};


class Fighter extends Sprite { // extending the Sprite class allows the Fighter class to use the methods within the Sprite class if they aren't already available within the Fighter class. If they ARE available, then they will be overwritten by the Fighter class methods, so we need to specify what to keep from Sprite, and what to overwrite
constructor({ 
	position, 
	velocity, 
	colour = 'red',
	imageSrc, 
	scale = 1, 
	framesMax = 1,
	offset = { x:0, y:0 }, // By default, images shouldn't be offset by any value. We set these to 0 instead of leaving them undefined, until we actually need to offset images. If you try to shift the x and y co-ords of an image with an undefined offset, you get problems
	sprites, // An object containing all the sprites for our character
	attackBox = { offset: {}, width: undefined, height: undefined}
    }) {
		super({ // super() allows you to call the constructor of the parent class (Sprite). We have to declare which properties we want set within the parent constructor
			position,
			imageSrc,
			scale,
			framesMax,
			offset
		})
		this.velocity = velocity
		this.width = 50
		this.height = 150
		this.lastKey // This is so that if the player presses left and right at the same time, the game registers the key that was most recently pressed
		this.attackBox = {
			position: {
				x: this.position.x,
				y: this.position.y
			},
			offset: attackBox.offset, // This will dictate the direction of the character attackBox
			width: attackBox.width,
			height: attackBox.height,
		}
		this.colour = colour
		this.isAttacking
		this.health = 100
		this.framesCurrent = 0,
		this.framesElapsed = 0, // How many frames have we currently lapsed over throughout the animation
		this.framesHold = 5, // How many frames should we go through before we update framesCurrent
		this.sprites = sprites,
    this.dead = false // This will stop animations once a character is dead
		for (const sprite in this.sprites) { // This is going to loop through each object in sprites (index.js)
			sprites[sprite].image = new Image() // We want to create an image property that is equal to a new Image object for each object within sprites
			sprites[sprite].image.src = sprites[sprite].imageSrc
		}
	};

	//No longer needed since we aren't using rectangles anymore
	// draw() {
	// 	// Colour of the sprite to differentiate it from the canvas colour
	// 	c.fillStyle = this.colour;
	// 	c.fillRect(this.position.x, this.position.y, this.width, 150); // x, y, width, and height

	// 	// Attack Box
	// 	if (this.isAttacking) {
	// 		c.fillStyle = 'green'
	// 		c.fillRect(
	// 			this.attackBox.position.x, 
	// 			this.attackBox.position.y, 
	// 			this.attackBox.width, 
	// 			this.attackBox.height)
	// 	}
	// };

	// This will update properties as sprite are moving across the screen
	update() {
		this.draw()
        if (!this.dead) { // If the character is not dead, keep animating
		this.animateFrames()
    }

        // Attack boxes
		this.attackBox.position.x = this.position.x + this.attackBox.offset.x
		this.attackBox.position.y = this.position.y + this.attackBox.offset.y

        // Draw the attackBox
        // c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height)

		this.position.x += this.velocity.x
		this.position.y += this.velocity.y
		
		// This prevents the sprite from falling below the bottom of the floor on the background sprite
		if (this.position.y + this.height + this.velocity.y >= canvas.height - 96) {
			this.velocity.y = 0
            this.position.y = 330 // This is the exact y position + height for the characters when on the ground. The ensures a smooth transition from the fall to idle animation by preventing compounding gravity from making the y position value exceed the background floor before the sprite actually hits the ground
		} else this.velocity.y += gravity // Gravity is only added to the y velocity if the sprite is above the canvas floor/height
	

		// This prevents the characters from moving beyond the sides of the canvas
		if (this.position.x <= 0) {
			this.position.x = 0
		} else if (this.position.x >= canvas.width - 55) {
			this.position.x = canvas.width - 55
		}

		// This prevents the characters from jumping too far high beyond the top of the canvas
		if (this.position.y <= -70) {
			this.velocity.y = 0
			this.velocity.y += gravity * 4.5
		} 
	};
	




	attack() {
    this.switchSprite('attack1')
		this.isAttacking = true
		// setTimeout(() => { // This is so that the character isn't permanently attacking
		// 	this.isAttacking = false
		// }, 1000)
	}

    takeHit() {
        this.health -= 5

        if (this.health <= 0) {
            this.switchSprite('death')
        } else this.switchSprite('takeHit')
    }

	switchSprite(sprite) {
        // If the death animation has been activated, it should override all other animations
        if (this.image === this.sprites.death.image) {
            if (this.framesCurrent === this.sprites.death.framesMax - 1) // Once a character has reached the end of the death spritesheet, they are dead 
                this.dead = true
            return
        }

        // If the attack1 animation has been activated, it should override all other animations until then end of the animation has been reached. THEN, the following switch statement can run
        if (this.image === this.sprites.attack1.image && this.framesCurrent < this.sprites.attack1.framesMax - 1) // This is to ensure that the idle animation doesn't override and end the attack1 animation prematurely
        return

        // If the takeHit animation has been activated, it should override all other animations until then end of the animation has been reached. THEN, the following switch statement can run
        if (this.image === this.sprites.takeHit.image && this.framesCurrent < this.sprites.takeHit.framesMax - 1) 
        return // If we're not attacking but we are getting hit, we don't want to run any of the following switch cases, not until the current frame is greater than the max amount of frames for the spritesheet    


		switch (sprite) {
		  case 'idle':
          if (this.image !== this.sprites.idle.image) { // As soon as this is set, it'll no longer be called, but the case statement will still be running in our animation loop. We're only switching over to this spritesheet once
            this.image = this.sprites.idle.image
            this.framesMax = this.sprites.idle.framesMax
            this.framesCurrent = 0 // This ensures that we start at the beginning of the sprite sheet when switching. The idle animation has 8 frames. and the jump animation only has 2, so if we were to switch to jump from any of the idle frames AFTER 2, it would render out a blank space. You can't go from the 4th frame of idle, to the NON-EXISTANT 4th frame of jump, for example
            }
			break
		  case 'run':
          if (this.image !== this.sprites.run.image) {
            this.image = this.sprites.run.image
            this.framesMax = this.sprites.run.framesMax
            this.framesCurrent = 0
          }
			break
		  case 'jump':
          if (this.image !== this.sprites.jump.image) {
            this.image = this.sprites.jump.image
            this.framesMax = this.sprites.jump.framesMax
	        this.framesCurrent = 0
          }
            break
          case 'fall':
          if (this.image !== this.sprites.fall.image) {
            this.image = this.sprites.fall.image
            this.framesMax = this.sprites.fall.framesMax
            this.framesCurrent = 0
          }
            break
          case 'attack1':
          if (this.image !== this.sprites.attack1.image) {
            this.image = this.sprites.attack1.image
            this.framesMax = this.sprites.attack1.framesMax
            this.framesCurrent = 0
          }
            break
          case 'takeHit':
          if (this.image !== this.sprites.takeHit.image) {
            this.image = this.sprites.takeHit.image
            this.framesMax = this.sprites.takeHit.framesMax
            this.framesCurrent = 0
          }
            break

          case 'death':
          if (this.image !== this.sprites.death.image) {
            this.image = this.sprites.death.image
            this.framesMax = this.sprites.death.framesMax
            this.framesCurrent = 0
          }
            break
	   }

    }


};