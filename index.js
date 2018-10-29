document.addEventListener("DOMContentLoaded", () => {  
  document.getElementsByClassName('pause')[0].addEventListener('click', handleGamePause);
});

let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
  type = "canvas"
}

PIXI.utils.sayHello(type)

//Aliases
let Application = PIXI.Application,
    loader = PIXI.loader,
    Sprite = PIXI.Sprite,
    Rectangle = PIXI.Rectangle;

//Create a Pixi Application
let app = new Application({ 
    width: 800, 
    height: 600,                       
    antialias: true, 
    transparent: false, 
    resolution: 1
  }
);

app.renderer.view.style.display = 'block';
app.renderer.view.style.margin='140px auto 0';

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

//load an image and run the `setup` function when it's done
loader
  .add("sky", "images/sky3.jpg")
  .add("images/alien_invasion.json")
  .on("progress", loadProgressHandler)
  .load(setup);

function loadProgressHandler(loader, resource) {
  //Display the file `url` currently being loaded
  console.log("loading: " + resource.url); 

  //Display the percentage of files currently loaded
  console.log("progress: " + loader.progress + "%"); 

  //If you gave your files names as the first argument 
  //of the `add` method, you can access them like this
  console.log("resource name: " + resource.name);
}

let Aliens;
let sky, rocket, alien, bullet; // sprites
let skyVelocity = 2, rocketMaxVelocity = 10, aliensVelocity = 4;
let numberOfAliens = 5, xAlienOffset = 800, grassHeight = 50;
let healthMessage, scoreText;

let textStyle = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontStyle: "italic",
  fontSize: 20,
  fill: "white",
  stroke: '#ff3300',
  strokeThickness: 2,
  fontVariant: "small-caps",
});

let GameOverTextStyle = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontStyle: "italic",
  fontSize: 50,
  fill: "#ff3300",
  stroke: 'black',
  strokeThickness: 4,
  fontVariant: "small-caps",
});

//This `setup` function will run when the image has loaded
function setup() {
  //Create the sky1 sprite
  sky1 = new Sprite(PIXI.loader.resources.sky.texture);
  sky1.width = 800;
  sky1.height = 600;
  app.stage.addChild(sky1);

  //Create the sky2 sprite
  sky2 = new Sprite(PIXI.loader.resources.sky.texture);
  sky2.width = 800;
  sky2.height = 600;
  sky2.position.set(800,0);
  app.stage.addChild(sky2);

  renderBullet = () => {
    bullet = new PIXI.Graphics();
    bullet.beginFill(0xFFFF00);
    bullet.drawEllipse(0, 0, 10, 3.3);
    bullet.beginFill(0xD98C18);
    bullet.drawEllipse(0, 0, 5, 3.3);
    bullet.beginFill(0xD91818);
    bullet.drawEllipse(6, 0, 5, 3.3);
    bullet.endFill();

    bullet.velocity = 8;
    return bullet;
  }

  Bullets = new PIXI.Container();

  app.stage.addChild(Bullets);
  //Задаем текстуры персонажей игры
  let characters = PIXI.loader.resources["images/alien_invasion.json"].textures;

  //--------------------------------Aliens sprites
  Aliens = new PIXI.Container();

  for (let i = 0; i < numberOfAliens; i++) {
    //Create the alien sprite
    alien = new Sprite(characters["alien_on_ufo"]);

    //Space each alien horizontally according to the `spacing` value.
    //`xOffset` determines the point from the left of the screen
    //at which the first alien should be added.
    let xPosition = randomInt(xAlienOffset, 2000);

    //Give the alien a random y position
    //(`randomInt` is a custom function - see below)
    let yPosition = randomInt(grassHeight, app.stage.height - alien.height);

    alien.id = `alien0${i}`;
    alien.x = xPosition;
    alien.y = yPosition;

    //Add the alien to the stage
    Aliens.addChild(alien);
  }
  app.stage.addChild(Aliens);

  //--------------------------------Rocket sprite
  rocket = new Sprite(characters["rocket"]);
  //Add the rocket to the stage
  app.stage.addChild(rocket);
  //Change the sprite's position
  rocket.position.set(10, 200);
  rocket.vx = 4;
  rocket.vy = 4;
  rocket.health = 5;
  rocket.score = 0;

  //--------------------------------Health Text
  healthText = new PIXI.Text(`Health: ${rocket.health}`, textStyle);
  app.stage.addChild(healthText);
  healthText.position.set(50, 10);

  //--------------------------------Score Text
  scoreText = new PIXI.Text(`Score: ${rocket.score}`, textStyle);
  app.stage.addChild(scoreText);
  scoreText.position.set(150, 10);

   //--------------------------------Game Over Text
   gameOverText = new PIXI.Text('Game Over!', GameOverTextStyle);
  
  //Set the game state
  state = play;

  app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
  //Update the current game state:
  state(delta);
}

function play() {
  handleKeyButtons();

  sky1.x -= skyVelocity;
  sky2.x -= skyVelocity;
  if (sky1.x == -800) sky1.x = 800;
  if (sky2.x == -800) sky2.x = 800;

  Bullets.children.forEach(Bullet => {
    Bullet.x += Bullet.velocity;

    if(Bullet.x == 800 + Bullet.width) {
      Bullets.removeChild(Bullet);
    }
  });

  Aliens.children.forEach((Allien, index) => {
    Allien.x -= aliensVelocity + index/1.5;

    // Первый вариант столкновений:
    if(rocket.x + rocket.width >= Allien.x && rocket.y + rocket.height >= Allien.y && 
      rocket.x <= Allien.x + Allien.width && rocket.y <= Allien.y + Allien.height) {
      rocket.health -= 1;
      healthText.text = `Health: ${rocket.health}`;
      Allien.visible = false;
      Allien.x = 810;
      Allien.y = randomInt(0, app.stage.height - Allien.height - grassHeight);
    }

    // Второй вариант столкновений:
    /* if(hitTestRectangle(rocket, Allien)) {
      Allien.visible = false;
      Allien.x = 810;
      Allien.y = randomInt(0, app.stage.height - Allien.height - grassHeight);
    } */

    // Первый вариант столкновений:
    Bullets.children.forEach(Bullet => {
      if (Bullet.x + Bullet.width >= Allien.x && Bullet.y + Bullet.height >= Allien.y && 
        Bullet.x <= Allien.x + Allien.width && Bullet.y <= Allien.y + Allien.height) {
          Bullets.removeChild(Bullet);
          Allien.alpha -= 0.5;
      }
    });

    if (Allien.alpha <= 0) {
      rocket.score += 1;
      scoreText.text = `Score: ${rocket.score}`;
      Allien.visible = false;
      Allien.x = 810;
      Allien.y = randomInt(0, app.stage.height - Allien.height - grassHeight);
    }

    if (Allien.x <= -90) {
      Allien.x = 800;
      Allien.y = randomInt(0, app.stage.height - Allien.height - grassHeight);
    }
    
    if (Allien.x >= 800) {
      Allien.visible = true;
      Allien.alpha = 1;
    }
  });

  if (rocket.health <= 0) {
    rocket.health = 0; // для того, чтоб не проскакивало -1
    state = GameOver;
  }
}

function GameOver() {
  app.ticker.remove();
  app.stage.addChild(gameOverText);
  gameOverText.position.set(400 - gameOverText.width/2, 250);
}

//The `randomInt` helper function
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

handleGamePause = (e) => {
  e.target.blur();
  if(app.ticker.started) {
    e.target.textContent = 'start';
    app.ticker.stop();
  } else {
    e.target.textContent = 'pause';
    app.ticker.start();
  }
}

// keyBoardControl
let currentlyPressedKeys = {};

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;

    if (event.keyCode == 32) {
      Bullets.addChild(renderBullet());
      bullet.x = rocket.x + rocket.width;
      bullet.y = rocket.y + rocket.height/2;
    }
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyButtons() {
    if (currentlyPressedKeys[37]) {
        // Left cursor key
        if(rocket.vx >= 0.2) rocket.vx -= 0.1;
    }
    if (currentlyPressedKeys[39]) {
        // Right cursor key
        if(rocket.vx <= rocketMaxVelocity) rocket.vx += 0.1;
    }
    if (currentlyPressedKeys[38]) {
        // Up cursor key
        if(rocket.vy <= rocketMaxVelocity) rocket.vy += 0.1;
    }
    if (currentlyPressedKeys[40]) {
        // Down cursor key
        if(rocket.vy >= 0.2) rocket.vy -= 0.1;
    }

    if (currentlyPressedKeys[87]) {
        // "W"
        rocket.y -= rocket.vy;
        if(rocket.y <= 0) rocket.y = 0;
    } 

    if (currentlyPressedKeys[83]) {
        // "S"
        rocket.y += rocket.vy;
        if(rocket.y >= 600-rocket.height) rocket.y = 600-rocket.height;
    } 

    if (currentlyPressedKeys[65]) {
        // "A"            
        rocket.x -= rocket.vx;
        if(rocket.x <= 0) rocket.x = 0;
    } 

    if (currentlyPressedKeys[68]) {
        // "D"            
        rocket.x += rocket.vx;
        if(rocket.x >= 800-rocket.width) rocket.x = 800-rocket.width;
    }
}

function hitTestRectangle(r1, r2) {
  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occurring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {

      //There's definitely a collision happening
      hit = true;
    } else {

      //There's no collision on the y axis
      hit = false;
    }
  } else {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};
