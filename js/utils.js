// Checking for collision
function rectangularCollision({ rectangle1, rectangle2 }) {
	return (
		// If the right edge of the player's attackBox is touching the enemy's left side
		rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x && 
		// If the left edge of the player's attackBox is to the left of the enemy's right side
		rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
		// If the bottom of the player's attackBox is below the enemy's head
		rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
		// If the top of the player's attackBox is above the enemy's feet
		rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
		)
}


function determineWinner({ player, enemy, timerId }) {
	clearTimeout(timerId) // This will stop the time once a winner is declared
	document.querySelector('#displayText').style.display = 'flex'
	if (player.health === enemy.health) {
		document.querySelector('#displayText').innerHTML = 'TIE'
	} else if (player.health > enemy.health) {
		document.querySelector('#displayText').innerHTML = 'PLAYER 1 WINS'
	} else if (enemy.health > player.health) {
		document.querySelector('#displayText').innerHTML = 'PLAYER 2 WINS'

	}
	
}

// This function is responsible for decreasing the timer
let timer = 60
let timerId // This will be a reference to the value returned from setTimeout. clearTimeout() needs this to be passed in
function decreaseTimer() {
	if (timer > 0) {
		timerId = setTimeout(decreaseTimer, 1000) // Whenever setTimeout() is called, it will return a value, starting from 0, then 1, then 2, etc
		timer-- // subtract 1
		document.querySelector('#timer').innerHTML = timer
	}

	if (timer === 0) {
		determineWinner({ player, enemy, timerId })
	}
	
}