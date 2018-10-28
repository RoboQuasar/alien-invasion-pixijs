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

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

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
let sky, rocket, alien; // sprites
let skyVelocity = 2, rocketMaxVelocity = 10, aliensVelocity = 4;
let numberOfAliens = 5, xAlienOffset = 800, grassHeight = 50;

//This `setup` function will run when the image has loaded
function setup() {
  console.log('Finish!');

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

  //Задаем текстуры персонажей игры
  let characters = PIXI.loader.resources["images/space_rush.json"].textures;

  //Aliens
  Aliens = new PIXI.particles.ParticleContainer();

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
    console.log(yPosition);

    alien.id = `alien0${i}`;
    alien.x = xPosition;
    alien.y = yPosition;

    //Add the alien to the stage
    Aliens.addChild(alien);
  }

  app.stage.addChild(Aliens);

  //Create the Rocket sprite
  rocket = new Sprite(characters["rocket"]);
  //Add the rocket to the stage
  app.stage.addChild(rocket);
  //Change the sprite's position
  rocket.position.set(10, 200);
  rocket.vx = 4;
  rocket.vy = 4;

  //Set the game state
  state = play;

  app.ticker.add(delta => gameLoop(delta));

  /*   Aliens.position.set(64, 64);

  console.log("Aliens.children[3].position:", Aliens.children[3].position);
  console.log("Aliens.children[2].position:", Aliens.children[2].position);
  console.log("Aliens.toGlobal(Aliens.children[3].position):", Aliens.toGlobal(Aliens.children[3].position));
  console.log("Aliens.toGlobal(Aliens.children[2].position):", Aliens.toGlobal(Aliens.children[2].position));
  console.log(
    "Aliens.toLocal(Aliens.children[3].position, Aliens.children[2]).x:",
    Aliens.toLocal(Aliens.children[3].position, Aliens.children[2]).x
  ); */
}

function gameLoop(delta) {
  //Update the current game state:
  state(delta);
}

function play(delta) {
  handleKeyButtons();
  //Move the rocket 1 pixel 
  sky1.x -= skyVelocity;
  sky2.x -= skyVelocity;

  if (sky1.x == -800) sky1.x = 800;
  if (sky2.x == -800) sky2.x = 800;

  for (let i = 0; i < numberOfAliens; i++) {
    Aliens.children[i].x -= aliensVelocity + i/1.5;

    if (Aliens.children[i].x <= -90) {
      Aliens.children[i].x = 800;
      Aliens.children[i].y = randomInt(0, app.stage.height - Aliens.children[i].height - grassHeight);
    }
  }
  
}

//The `randomInt` helper function
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// keyBoardControl
let currentlyPressedKeys = {};

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyButtons() {
    if (currentlyPressedKeys[37]) {
        // Left cursor key
        if(rocket.vx >= 0.2) rocket.vx -= 0.1;
        console.log('rocket.vx:', rocket.vx);
    }
    if (currentlyPressedKeys[39]) {
        // Right cursor key
        if(rocket.vx <= rocketMaxVelocity) rocket.vx += 0.1;
        console.log('rocket.vx:', rocket.vx);
    }
    if (currentlyPressedKeys[38]) {
        // Up cursor key
        if(rocket.vy <= rocketMaxVelocity) rocket.vy += 0.1;
        console.log('rocket.vy:', rocket.vy);
    }
    if (currentlyPressedKeys[40]) {
        // Down cursor key
        if(rocket.vy >= 0.2) rocket.vy -= 0.1;
        console.log('rocket.vy:', rocket.vy);
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
