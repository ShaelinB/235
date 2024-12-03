// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application({
    width: 800,
    height: 600
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

// pre-load the images (this code works with PIXI v6)
app.loader.
    add([
        "images/spaceship.png",
        "images/explosions.png"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// pre-load the images (this code works with PIXI v7)
// let assets;
// loadImages();
// async function loadImages(){
// // https://github.com/pixijs/pixijs/wiki/v7-Migration-Guide#-replaces-loader-with-assets
// // https://pixijs.io/guides/basics/assets.html
// PIXI.Assets.addBundle('sprites', {
//   spaceship: 'images/spaceship.png',
//   explosions: 'images/explosions.png',
//   move: 'images/move.png'
// });
//
// assets = await PIXI.Assets.loadBundle('sprites');
// setup();
// }

// aliases
let stage;

// game variables
let startScene;
let gameScene,ship,scoreLabel,lifeLabel,shootSound,hitSound,fireballSound;
let gameOverScene;

let circles = [];
let bullets = [];
let aliens = [];
let explosions = [];
let explosionTextures;
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;
let gameOverScoreLabel = score;

//ship movement
let keys = {};

//fields for upgrades
let spread = 1;
let spreadCost = 50;
let speedLevel = 1;
let speedCost = 20;
let lifeLevel = 1;
let lifeMax = 100;
let lifeCost = 30;

function setup() {
	stage = app.stage;
	// #1 - Create the `start` scene
	startScene = new PIXI.Container();
    stage.addChild(startScene);

	// #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

	// #3 - Create the `gameOver` scene and make it invisible
	gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

	// #4 - Create labels for all 3 scenes
	createLabelsAndButtons();

	// #5 - Create ship
    ship = new Ship();
    gameScene.addChild(ship);

    //adding event listeners
    window.addEventListener("keydown", (e) => {
        keys[e.code] = true;
    })
    window.addEventListener("keyup", (e) => {
        keys[e.code] = false;
    })
	
	// #6 - Load Sounds
    shootSound = new Howl({
	    src: ['sounds/shoot.wav']
    });

    hitSound = new Howl({
	    src: ['sounds/hit.mp3']
    });

    fireballSound = new Howl({
	    src: ['sounds/fireball.mp3']
    });
	
	// #7 - Load sprite sheet
	explosionTextures = loadSpriteSheet();
	// #8 - Start update loop
    app.ticker.add(gameLoop);
	
	// #9 - Start listening for click events on the canvas
	
	// Now our `startScene` is visible
	// Clicking the button calls startGame()
}

function createLabelsAndButtons() 
{
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "Futura"
    });

    // 1 - set up 'startScene'
    // 1A - make top start label
    let startLabel1 = new PIXI.Text("Circle Blast!");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel1.x = 50;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    // 1B - make middle start label
    let startLabel2 = new PIXI.Text("R U worthy...?");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Futura",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel2.x = 185;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    // 1C - make start game button
    let startButton = new PIXI.Text("Enter, ... if you dare!");
    startButton.style = buttonStyle;
    startButton.x = 80;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame); // startGame is a function reference
    startButton.on("pointerover", e => e.target.alpha = 0.7); // concise arrow function with no brackets
    startButton.on("pointerout", e => e.currentTarget.alpha = 1.0); // ditto
    startScene.addChild(startButton);

    // 2 - set up 'gameScene'
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    //2A - make score label
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 605;
    scoreLabel.y = 26;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    //2B - make life label
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 605;
    lifeLabel.y = 5;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    //line that seperates the game and buttons
    let seperator = new PIXI.Graphics();
    seperator.beginFill(0xffffff);
    seperator.drawRect(600,0,2,600);
    seperator.endFill();
    gameScene.addChild(seperator);

    //create upgrade buttons
    let spreadButton = new Button({
        x: sceneWidth - 175,
        y: 190,
        sizeX: 150,
        sizeY:50,
        color: 0x0000FF,
        label: `Increase Spread\n${spreadCost} Coins`,
        onClick: () => {
            if (score>=spreadCost && spread < 3) {
                spread++;
                score-=spreadCost;
                scoreLabel.text = `Coins       ${score}`;
                spreadCost += 50;

                if(spread >= 3)
                {
                    //label isnt changing
                    spreadButton.changeText("No More Upgrades");
                }
                else
                {
                    spreadButton.changeText(`Increase Spread\n${spreadCost} Coins`);
                }
            }
            else
            {
                return;
            }
        },
    });
    gameScene.addChild(spreadButton);
    

    let speedButton = new Button({
        x: sceneWidth - 175,
        y: 265,
        sizeX: 150,
        sizeY: 50,
        color: 0x0000FF,
        label: `Increase Speed\n${speedCost} Coins`,
        onClick: () => {
            if (score>=speedCost && speedLevel < 3) {
                speedLevel++;
                score-=speedCost;
                scoreLabel.text = `Coins       ${score}`;
                speedCost += 20;

                if(speedLevel >= 3)
                {
                    //label isnt changing
                    speedButton.changeText("No More Upgrades");
                }
                else
                {
                    speedButton.changeText(`Increase Speed\n${speedCost} Coins`);
                }
            }
            else
            {
                return;
            }
        },
    });
    gameScene.addChild(speedButton); 

    let healthButton = new Button({
        x: sceneWidth - 175,
        y: 340,
        sizeX: 150,
        sizeY: 50,
        color: 0x0000FF,
        label: `Increase Max Health\n${lifeCost} Coins`,
        onClick: () => {
            if (score>=lifeCost && lifeLevel < 5) {
                lifeLevel++;
                lifeMax+=25;
                score-=lifeCost;
                scoreLabel.text = `Coins       ${score}`;
                lifeCost += 30;
                lifeLabel.text = `Health      ${life}/${lifeMax}`;

                if(lifeLevel >= 5)
                {
                    //label isnt changing
                    healthButton.changeText("No More Upgrades");
                }
                else
                {
                    healthButton.changeText(`Increase Health\n${lifeCost} Coins`);
                }
            }
            else
            {
                return;
            }
        },
    });
    gameScene.addChild(healthButton);

    // 3 - set up `gameOverScene`
    // 3A - make game over text
    let gameOverText = new PIXI.Text("Game Over!\n        :-O");
    textStyle = new PIXI.TextStyle({
	    fill: 0xFFFFFF,
	    fontSize: 64,
	    fontFamily: "Futura",
	    stroke: 0xFF0000,
	    strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 100;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);

    //game over score label
    gameOverScoreLabel = new PIXI.Text("Your final score: " + score);
    textStyle = new PIXI.TextStyle({
	    fill: 0xFFFFFF,
	    fontSize: 32,
	    fontFamily: "Futura",
	    stroke: 0xFF0000,
	    strokeThickness: 6
    });
    gameOverScoreLabel.style = textStyle;
    gameOverScoreLabel.x = 150;
    gameOverScoreLabel.y = sceneHeight/2;
    gameOverScene.addChild(gameOverScoreLabel);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup",startGame); // startGame is a function reference
    playAgainButton.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);
}

function startGame()
{
    console.log("startGame called")
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    
    app.view.onclick = () => fireBullet();
    spread = 1;
    spreadCost = 50;
    speedLevel = 1;
    speedCost = 20;
    lifeLevel = 1;
    lifeMax = 100;
    lifeCost = 30;
    life = 100;
    score = 0;
    levelNum = 1;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    ship.x = 300;
    ship.y = 550;
    loadLevel();

    //unpause the game which allows the gameLoop and events to be active
    setTimeout(() => {
        paused = false;
    }, 50);
}

function increaseScoreBy(value)
{
    score += value;
    scoreLabel.text = `Coins       ${score}`;
}

function decreaseLifeBy(value)
{
    life -= value;
    lifeLabel.text = `Health      ${life}/${lifeMax}`;
}

function gameLoop()
{
    if (paused) return;
  
    // #1 - Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;
  
    // #2 - Move Ship
    let speed = speedLevel * 100 * dt;
    if (keys["KeyW"]) ship.y -= speed;
    if (keys["KeyS"]) ship.y += speed;
    if (keys["KeyA"]) ship.x -= speed;
    if (keys["KeyD"]) ship.x += speed;

    // keep the ship on the screen with clamp()
    let w2 = ship.width/2;
    let h2 = ship.height/2;
    ship.x = clamp(ship.x, 0 + w2, sceneWidth - w2-200);
    ship.y = clamp(ship.y, 0 + h2, sceneHeight - h2);
  
    // #3 - Move Circles
    for (let c of circles) 
    {
        c.move(dt);
        if (c.x < c.radius || c.x > sceneWidth - c.radius-200)
        {
            c.reflectX();
            c.move(dt);
        }
        if (c.y < c.radius || c.y > sceneHeight - c.radius)
            {
                c.reflectY();
                c.move(dt);
            }
    }
  
    // #4 - Move Bullets
    for (let b of bullets) {
        b.move(dt);
        if(b.x >= 600)
        {
            gameScene.removeChild(b);
            b.isAlive = false;  
        }
    }
  
  
    // #5 - Check for Collisions
    for (let c of circles)
    {
        // 5A - circles & bullets
        for (let b of bullets)
        {
            if(rectsIntersect(c,b))
            {
                fireballSound.play();
                createExplosion(c.x,c.y,64,64);
                gameScene.removeChild(c);
                c.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
                break;
            }
        }

        // 5B - circles & ship
        if (c.isAlive && rectsIntersect(c,ship))
        {
            hitSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            decreaseLifeBy(20);
        }
    }
  
    // #6 - Now do some clean up
    // 6A - cleanup bullets
    bullets = bullets.filter((b) => b.isAlive);

    // 6B - cleanup circles
    circles = circles.filter((c) => c.isAlive);

    // 6C - get rid of explosions
    explosions = explosions.filter((e) => e.playing);
  
    // #7 - Is game over?
    if (life <= 0){
        end();
        return; // return here so we skip #8 below
    }
  
    // #8 - Load next level
    if (circles.length == 0) {
        levelNum++;
        loadLevel();
    }
}

function createCircles(numCircles = 10)
{
    for (let i = 0; i < numCircles; i++)
    {
        let c = new Circle(10, 0xffff00);
        c.x = Math.random() * (sceneWidth - 235) + 25;
        c.y = Math.random() * (sceneHeight - 400) + 25;
        circles.push(c);
        gameScene.addChild(c);
    }
}

function loadLevel(){
    createCircles(levelNum * 5);
  }

function end() 
{
    paused = true;

    //clear out level
    circles.forEach((c) => gameScene.removeChild(c));
    circles = [];

    bullets.forEach((b) => gameScene.removeChild(b));
    bullets = [];

    explosions.forEach((e) => gameScene.removeChild(e));
    explosions = [];

    gameOverScoreLabel.text = "Your final score: " + score;

    gameOverScene.visible = true;
    gameScene.visible = false;
}

function fireBullet() 
{
    if(paused) return;

    let angles = [];
    switch(spread)
    {
        case 5:
            angles = [300,285,270,255,240];
            for (let i = 0; i < 5; i++)
            {
                let b = new Bullet(0xffffff, ship.x, ship.y);
                let radians = angles[i] * Math.PI / 180;
                b.fwd.x = Math.cos(radians);
                b.fwd.y = Math.sin(radians);
                bullets.push(b);
                gameScene.addChild(b);
            }
            break;

        case 4:
            angles = [292.5,277.5,262.5,247.5];
            for (let i = 0; i < 4; i++)
            {
                let b = new Bullet(0xffffff, ship.x, ship.y);
                let radians = angles[i] * Math.PI / 180;
                b.fwd.x = Math.cos(radians);
                b.fwd.y = Math.sin(radians);
                bullets.push(b);
                gameScene.addChild(b);
            }
            break;

        case 3:
            angles = [285,270,255];
            for (let i = 0; i < 3; i++)
            {
                let b = new Bullet(0xffffff, ship.x, ship.y);
                let radians = angles[i] * Math.PI / 180;
                b.fwd.x = Math.cos(radians);
                b.fwd.y = Math.sin(radians);
                bullets.push(b);
                gameScene.addChild(b);
            }
            break;

        case 2:
            angles = [277.5,262.5];
            for (let i = 0; i < 2; i++)
            {
                let b = new Bullet(0xffffff, ship.x, ship.y);
                let radians = angles[i] * Math.PI / 180;
                b.fwd.x = Math.cos(radians);
                b.fwd.y = Math.sin(radians);
                bullets.push(b);
                gameScene.addChild(b);
            }
            break;

        case 1:
            let b = new Bullet(0xffffff, ship.x, ship.y);
            bullets.push(b);
            gameScene.addChild(b);
            break;
    }
    
    shootSound.play();
}

function loadSpriteSheet()
{
    let spriteSheet = PIXI.Texture.from("images/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];
    for (let i = 0; i < numFrames; i++)
    {
        let frame = new PIXI.Texture(spriteSheet.baseTexture, new PIXI.Rectangle(i*width, 64, width, height));
        textures.push(frame);
    }
    return textures;
}

function createExplosion(x, y, frameWidth, frameHeight)
{
    let w2 = frameWidth/2;
    let h2 = frameHeight/2;
    let expl = new PIXI.AnimatedSprite(explosionTextures);
    expl.x = x - w2; //we want the center of the explosion to be at the center of the circle
    expl.y = y - h2; //same for height
    expl.animationSpeed = 1/7;
    expl.loop = false;
    expl.onComplete = () => gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}