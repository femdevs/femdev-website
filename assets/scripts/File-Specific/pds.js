document.addEventListener('DOMContentLoaded', function () {
  var score = 0;
  var personalBest = parseInt(localStorage.getItem('personalBest')) || 0;
  var isGameStarted = false;
  var isGameOver = false;
  var timeLeft = 15;
  var mapWidth = 600;
  var mapHeight = 400;

  var gameOverElement = document.getElementById('gameOver');

  document.getElementById('personalBest').innerText =
    'Personal Best: ' + personalBest;

  function toggleGameElements() {
    if (isGameStarted) {
      document.getElementById('destroyButton').style.display = 'block';
      document.getElementById('startButton').style.display = 'none';
    } else {
      document.getElementById('startButton').style.display = 'block';
      document.getElementById('destroyButton').style.display = 'none';
    }

    if (isGameOver) {
      gameOverElement.style.display = 'block';
      document.getElementById('startButton').style.display = 'block';
    } else {
      gameOverElement.style.display = 'none';
    }
  }

  function startGame() {
    score = 0;
    isGameStarted = true;
    isGameOver = false;
    timeLeft = 15;
    document.getElementById('score').innerText = 'Score: 0';
    document.getElementById('timeLeft').innerText = 'Time Left: 15';
    toggleGameElements();
    startTimer();
  }

  document.getElementById('startButton').addEventListener('click', function () {
    startGame();
  });

  document
    .getElementById('destroyButton')
    .addEventListener('click', function () {
      if (!isGameOver) {
        var audio = new Audio('../../media/explosion.mp3');
        audio.play();

        var destructionEffect = document.createElement('div');
        destructionEffect.className = 'destruction-effect';

        var mapElement = document.getElementById('map');
        destructionEffect.style.top = (mapHeight - 200) / 2 + 'px';
        destructionEffect.style.left = (mapWidth - 200) / 2 + 'px';

        mapElement.appendChild(destructionEffect);

        setTimeout(function () {
          mapElement.removeChild(destructionEffect);
        }, 2000);

        score++;
        document.getElementById('score').innerText = 'Score: ' + score;

        if (score > personalBest) {
          personalBest = score;
          document.getElementById('personalBest').innerText =
            'Personal Best: ' + personalBest;
          localStorage.setItem('personalBest', personalBest);
        }
      }
    });

  function startTimer() {
    var timerInterval = setInterval(function () {
      timeLeft--;
      document.getElementById('timeLeft').innerText = 'Time Left: ' + timeLeft;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        isGameOver = true;
        isGameStarted = false;
        toggleGameElements();
      }
    }, 1000);
  }

  toggleGameElements();
});
