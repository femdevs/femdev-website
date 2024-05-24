class Game {
	constructor(elements) {
		this.score = { value: 0, element: elements.score };
		this.timeLeft = { value: 15, element: elements.timeleft };
		this.personalBest = { value: parseInt(localStorage.getItem('personalBest')) || 0, element: elements.personalBest };
		this.startButton = elements.startButton;
		this.desButton = elements.desButton;
		this.map = elements.map;
		this.gameOver = elements.gameOver;
		this.state = { started: false, over: false };
		this.dimensions = { width: 600, height: 400 };
		this.timers = { mainTimer: null };
	}
	init() {
		this.score.element.innerText = `Score: ${this.score.value}`;
		this.timeLeft.element.innerText = `Time Left: ${this.timeLeft.value}`;
		this.personalBest.element.innerText = `Personal Best: ${this.personalBest.value}`;
		this.startButton.addEventListener('click', this.start);
		this.desButton.addEventListener('click', this.destroy);
	}
	start() {
		this.state.started = true;
		this.state.over = false;
		this.score.value = 0;
		this.timeLeft.value = 15;
		this.score.element.innerText = `Score: ${this.score.value}`;
		this.timeLeft.element.innerText = `Time Left: ${this.timeLeft.value}`;
		this.toggleElements();
		this.startTimer();
	}
	toggleElements() {
		this.desButton.style.display = this.state.started ? 'block' : 'none';
		this.startButton.style.display = this.state.started ? 'none' : 'block';

		if (this.state.over) {
			this.gameOver.style.display = 'block';
			this.startButton.style.display = 'block';
		} else this.gameOver.style.display = 'none';
	}
	destroy() {
		if (!this.state.over) {
			const audio = new Audio('/assets/audio/static/explosion.mp3');
			audio.play();

			const destructionEffect = document.createElement('div');
			destructionEffect.className = 'destruction-effect';

			destructionEffect.style.top = (this.dimensions.height - 200) / 2 + 'px';
			destructionEffect.style.left = (this.dimensions.width - 200) / 2 + 'px';

			this.map.appendChild(destructionEffect);

			setTimeout(() => this.map.removeChild(destructionEffect), 2000);

			this.score.value++;
			this.score.element.innerText = `Score: ${this.score.value}`;

			if (this.score.value > this.personalBest.value) {
				this.personalBest.value = this.score.value;
				this.personalBest.element.innerText = `Personal Best: ${this.personalBest.value}`;
				localStorage.setItem('personalBest', this.personalBest.value);
			}
		}
	}
	startTimer() {
		this.timers.mainTimer = setInterval(() => {
			this.timeLeft.value--;
			this.timeLeft.element.innerText = `Time Left: ${this.timeLeft.value}`;

			if (this.timeLeft.value <= 0) {
				clearInterval(timerInterval);
				this.state.over = true;
				this.state.started = false;
				this.toggleElements();
			}
		}, 1000);
	}
	static load() {
		new Game({
			desButton: document.getElementById('destroyButton'),
			startButton: document.getElementById('startButton'),
			score: document.getElementById('score'),
			timeleft: document.getElementById('timeLeft'),
			map: document.getElementById('map'),
			personalBest: document.getElementById('personalBest'),
			gameOver: document.getElementById('gameOver'),
		}).init();
	}
}


document.addEventListener('DOMContentLoaded', Game.load);
