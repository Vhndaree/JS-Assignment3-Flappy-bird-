var gameHighScore = 0;

function Obstacles() {
  this.x = BACKGROUND_WIDTH;
  this.y = 0;
  this.width = PIPE_WIDTH;
  this.height;
  this.element = null;

  this.init = function () {
    this.element = document.createElement('img');
    this.element.setAttribute('class', 'obstacles');

    var container = document.getElementById('mainBackground');
    container.appendChild(this.element);
  }

  this.move = function () {
    this.x -= OBSTACLE_SPEED;
    this.draw();
  }

  this.setMarginTop = function (margin) {
    this.element.style.marginTop = margin + 'px';
  }

  this.setHeight = function (_HEIGHT) {
    this.height = _HEIGHT;
  }

  this.draw = function () {
    this.element.style.marginLeft = this.x + 'px';
  }

  this.removeElement = function () {
    this.element.remove();
  }
}

function Bird() {
  var that = this;
  this.x = BIRD_INIT_X;
  this.y = BIRD_INIT_Y;
  this.element = null;

  this.init = function () {
    this.element = document.createElement('img');
    this.element.setAttribute('class', 'bird');

    var container = document.getElementById('mainBackground');
    container.appendChild(this.element);
  }

  this.move = function () {
    this.y += GRAVITY;
    this.draw();
  }

  this.fly = function () {
    this.y -= FLY_CONST;
    that.draw();
  }

  this.draw = function () {
    this.element.style.marginTop = this.y + 'px';
  }

  this.removeElement = function () {
    that.element.remove();
  }
}

function GameAnimation() {
  var obstacles = [];
  var flappyBird = new Bird();
  var isplayerAlive = true;
  var score = 0;

  var obstacleGap = 140;
  var yourScore = document.getElementById('yourScore');
  var highScore = document.getElementById('highScore');
  var gameAnimationInterval;

  var scoreAudio = new Audio('../assets/audio/point.ogg');
  var hitAudio = new Audio('../assets/audio/hit.ogg');
  var dieAudio = new Audio('../assets/audio/die.wav');


  var generateObstacles = function () {
    var obstacleTop = new Obstacles();
    var obstacleBottom = new Obstacles();
    obstacleTop.init();
    obstacleBottom.init();
    obstacleTop.element.setAttribute('src', './assets/sprites/pipe-down.png');
    obstacleBottom.element.setAttribute('src', './assets/sprites/pipe-up.png');
    var marginTop = getRandomNumber(TOP_PIPE_MIN_POS, TOP_PIPE_MAX_POS);
    obstacleTop.setMarginTop(marginTop);
    var heightTop = PIPE_HEIGHT + marginTop;
    obstacleTop.setHeight(heightTop);
    obstacleBottom.setMarginTop(marginTop + PIPE_HEIGHT + PIPE_GAP);
    obstacleBottom.setHeight(BACKGROUND_HEIGHT - FOREGROUND_HEIGHT - PIPE_GAP - heightTop);
    var combinedObstacle = [];
    combinedObstacle.push(obstacleTop);
    combinedObstacle.push(obstacleBottom);
    obstacles.push(combinedObstacle);
  }

  var moveObstacles = function () {
    obstacleGap += OBSTACLE_SPEED;
    flappyBird.move();
    if (obstacleGap === PIPE_DIST) {
      generateObstacles();
      obstacleGap = 0;
    }
    for (var i = 0; i < obstacles.length; i++) {
      obstacles[i][0].move();
      obstacles[i][1].move();
      if (obstacles[i][0].x == -PIPE_WIDTH) {
        obstacles[i][0].removeElement();
        obstacles[i][1].removeElement();
        obstacles.splice(i, i);
      }
      if (isWallColission()) {
        hitAudio.play();
        stopGame();
      }
      checkColission();
      scoreCounter(obstacles[i][0]);
    }
  }

  var generateBird = function () {
    flappyBird.init();
    flappyBird.element.setAttribute('src', './assets/sprites/redbird-midflap.png ');
    document.addEventListener('keyup', function () {
      flappyBird.fly();
      if (!isplayerAlive && event.keyCode != 0) {
        resetGame();
      }
    });
  }

  var resetGame = function () {
    isplayerAlive = true;
    flappyBird.removeElement();
    flappyBird.removeElement();
    obstacles.forEach(obstacle => {
      obstacle[0].removeElement();
      obstacle[1].removeElement();
    })
    score = 0;
    delete (flappyBird);
    delete (flappyBird);
    delete (startGame);
    obstacleGap = 140;
    isplayerAlive = true
    startGame = new GameAnimation().init();
  }

  var stopGame = function () {
    dieAudio.play();
    clearInterval(gameAnimationInterval);
    isplayerAlive = false;
    message.style.display = 'block'
    if (score === gameHighScore && score > 0) {
      message.innerHTML = 'Congratulations, You set new record<br>Your Score: ' + score + '<br> press any key to restart';
    } else {
      message.innerHTML = 'Oops! You got Hit, Better Luck Next Time<br>press any key to restart<br>Your Score: ' + score;
    }
  }

  //for colission detection 
  var isWallColission = function () {
    return (
      flappyBird.y <= 0
      || (flappyBird.y + BIRD_HEIGHT) >= (BACKGROUND_HEIGHT - FOREGROUND_HEIGHT - 9)

    );
  }

  var checkColission = function () {
    for (var i = 0; i < obstacles.length; i++) {
      if (flappyBird.x + BIRD_WIDTH > obstacles[i][0].x - PIPE_WIDTH
        && flappyBird.x < obstacles[i][0].x
        && (flappyBird.y <= obstacles[i][0].height
          || flappyBird.y + BIRD_HEIGHT >= obstacles[i][0].height + PIPE_GAP
        )) {
        hitAudio.play();
        stopGame();
      }
    }
  }

  var scoreCounter = function (pipe) {
    if (flappyBird.x + BIRD_WIDTH >= pipe.x + PIPE_WIDTH && flappyBird.x + BIRD_WIDTH <= pipe.x + PIPE_WIDTH + OBSTACLE_SPEED) {
      score++;
      scoreAudio.play();
    }
    if (score >= gameHighScore) {
      gameHighScore = score;
      highScore.innerHTML = 'High Score: ' + gameHighScore;
    }
    yourScore.innerHTML = 'Your Score: ' + score;
  }

  this.init = function () {
    message.style.display = 'none';
    generateBird();
    gameAnimationInterval = setInterval(moveObstacles, 60);
  }
}