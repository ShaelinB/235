// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0x1586DA,
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

// pre-load the images (this code works with PIXI v6)
app.loader.
    add([
        "images/Boat.png",
        "images/ExplosionSpriteSheet.png",
        "images/BoatAnimation.png",
        "images/BrokenShip.png",
        "images/Enemy.png",
        "images/CannonBall.png",
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
let gameScene,ship,scoreLabel,lifeLabel,shootSound,hitSound;
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

//fields for abilities
let restoreHealthCost = 100;
let deleteHalfCost = 75;

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
    addBoatAnimationToScene();
    addBrokenBoat();
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
	    src: ['sounds/Shoot.wav']
    });
    shootSound.volume(.1);

    hitSound = new Howl({
	    src: ['sounds/Hit.wav']
    });
    hitSound.volume(.1);
	
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
    // 1 - set up 'startScene'
    // 1A - make top start label
    let startLabel1 = new PIXI.Text("Ship Shooter");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: "Georgia",
        stroke: 0x634422,
        strokeThickness: 6
    });
    startLabel1.x = (sceneWidth - 200)/2 - startLabel1.width/2;
    startLabel1.y = 5;
    startScene.addChild(startLabel1);

    let playButton = new Button({
        x: sceneWidth-175,
        y: 140,
        sizeX: 150,
        sizeY: 50,
        color: 0xEDD4AE, 
        label: "Play",
        onClick: () => {
            spreadButton.changeText(`Increase Spread\n- 50 Coins`);
            speedButton.changeText(`Increase Speed\n- 20 Coins`);
            healthButton.changeText(`Increase Health\n- 30 Coins`);
            startGame();
        }
    })
    startScene.addChild(playButton);

    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Georgia",
        stroke: 0x634422,
        strokeThickness: 4,
    });

    let howToPlayText = new PIXI.Text("Up - W\nDown - S\n Left - A\nRight - D\nRotate CCW - Q\nRotate CW - E\n Fire - Left Click\nUse Shop - Left Click",textStyle);
    howToPlayText.x = sceneWidth - howToPlayText.width/2*2.175;
    howToPlayText.y = sceneHeight/2 - howToPlayText.height/2;
    startScene.addChild(howToPlayText);

    let docButton = new Button({
        x: sceneWidth-175,
        y: 410,
        sizeX: 150,
        sizeY: 50,
        color: 0xEDD4AE, 
        label: "Documentation",
        onClick: () => {
            window.location.href = "about.html";
        }
    })
    startScene.addChild(docButton);

    let startSeperator = new PIXI.Graphics();
    startSeperator.beginFill(0xffffff);
    startSeperator.drawRect(600,0,2,600);
    startSeperator.endFill();
    startScene.addChild(startSeperator);

    // 2 - set up 'gameScene'

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
    let gameSeperator = new PIXI.Graphics();
    gameSeperator.beginFill(0xffffff);
    gameSeperator.drawRect(600,0,2,600);
    gameSeperator.endFill();
    gameScene.addChild(gameSeperator);

    //upgrades text
    let upgradeText = new PIXI.Text("Upgrades", textStyle);
    upgradeText.x = sceneWidth - upgradeText.width/2 * 3.6;
    upgradeText.y = 60;
    gameScene.addChild(upgradeText);

    let abilitiesText = new PIXI.Text("Abilities", textStyle);
    abilitiesText.x = sceneWidth - abilitiesText.width/2 * 4;
    abilitiesText.y = 310;
    gameScene.addChild(abilitiesText);

    //create upgrade buttons
    //increases how many bullets you shoot
    let spreadButton = new Button({
        x: sceneWidth - 175,
        y: 100,
        sizeX: 150,
        sizeY:50,
        color: 0xEDD4AE,
        label: `Increase Spread\n- ${spreadCost} Coins`,
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
                    spreadButton.changeText(`Increase Spread\n- ${spreadCost} Coins`);
                }
            }
            else
            {
                return;
            }
        },
    });
    gameScene.addChild(spreadButton);
    

    //increases the speed the ship moves at
    let speedButton = new Button({
        x: sceneWidth - 175,
        y: 175,
        sizeX: 150,
        sizeY: 50,
        color: 0xEDD4AE,
        label: `Increase Speed\n- ${speedCost} Coins`,
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
                    speedButton.changeText(`Increase Speed\n- ${speedCost} Coins`);
                }
            }
            else
            {
                return;
            }
        },
    });
    gameScene.addChild(speedButton); 

    //increases max health
    let healthButton = new Button({
        x: sceneWidth - 175,
        y: 250,
        sizeX: 150,
        sizeY: 50,
        color: 0xEDD4AE,
        label: `Increase Max Health\n- ${lifeCost} Coins`,
        onClick: () => {
            if (score>=lifeCost && lifeLevel < 5) {
                lifeLevel++;
                life+=25;
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
                    healthButton.changeText(`Increase Max Health\n- ${lifeCost} Coins`);
                }
            }
            else
            {
                return;
            }
        },
    });
    gameScene.addChild(healthButton);

    //restores health
    let restoreHealthButton = new Button({
        x: sceneWidth-175,
        y: 350,
        sizeX: 150,
        sizeY: 50,
        color: 0xEDD4AE,
        label: `Restore Health\n- ${restoreHealthCost} Coins`,
        onClick: () => {
            if (score >= restoreHealthCost)
            {
                life = lifeMax;
                lifeLabel.text = `Health      ${life}/${lifeMax}`;
                score-=restoreHealthCost;
                scoreLabel.text = `Coins       ${score}`;
            }
        },
    });
    gameScene.addChild(restoreHealthButton);

    //deletes half of the enemies
    let deleteHalfButton = new Button({
        x: sceneWidth-175,
        y: 425,
        sizeX: 150,
        sizeY: 50,
        color: 0xEDD4AE,
        label: `Kill 1/2 the Enemies\n- ${deleteHalfCost} Coins`,
        onClick: () => {
            if (score >= deleteHalfCost)
                {
                    score-=deleteHalfCost;
                    scoreLabel.text = `Coins       ${score}`;
                    let num = Math.ceil(circles.length/2);
                    for (let i = 0; i<num; i++)
                    {
                        let enemy = circles.pop();
                        gameScene.removeChild(enemy);
                        enemy.isAlive = false;
                    }
                }
        },
    });
    gameScene.addChild(deleteHalfButton);

    //allows you to get coins for health
    let tradeForCoinButton = new Button({
        x: sceneWidth-175,
        y: 500,
        sizeX: 150,
        sizeY: 50,
        color: 0xEDD4AE, 
        label: "Get 20 Coins\n- 1/4 Max Health",
        onClick: () => {
            if(life-parseInt(lifeMax/4)>0)
            {
                score+=20;
                life-=parseInt(lifeMax/4);
                lifeLabel.text = `Health      ${life}/${lifeMax}`;
                scoreLabel.text = `Coins       ${score}`;
            }
        },
    });
    gameScene.addChild(tradeForCoinButton);

    // 3 - set up `gameOverScene`
    // 3A - make game over text
    let gameOverText = new PIXI.Text("Game Over");
    gameOverText.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: "Georgia",
        stroke: 0x634422,
        strokeThickness: 6
    });
    gameOverText.x = 50;
    gameOverText.y = 5;
    gameOverScene.addChild(gameOverText);

    //game over score label
    gameOverScoreLabel = new PIXI.Text("Coins: " + score);
    textStyle = new PIXI.TextStyle({
	    fill: 0xFFFFFF,
        fontSize: 75,
        fontFamily: "Georgia",
        stroke: 0x634422,
        strokeThickness: 6
    });
    gameOverScoreLabel.style = textStyle;
    gameOverScoreLabel.x = 150;
    gameOverScoreLabel.y = 100;
    gameOverScene.addChild(gameOverScoreLabel);

    // 3B - make "play again?" button
    let playAgainButton = new Button({
        x: sceneWidth-175,
        y: sceneHeight/2-30,
        sizeX: 150,
        sizeY: 50,
        color: 0xEDD4AE, 
        label: "Play Again",
        onClick: () => {

            spreadButton.changeText(`Increase Spread\n- 50 Coins`);
            speedButton.changeText(`Increase Speed\n- 20 Coins`);
            healthButton.changeText(`Increase Health\n- 30 Coins`);
            startGame();
        }
    })
    gameOverScene.addChild(playAgainButton);

    let menuButton = new Button({
        x: sceneWidth-175,
        y: sceneHeight/2+30,
        sizeX: 150,
        sizeY: 50,
        color: 0xEDD4AE, 
        label: "Menu",
        onClick: () => {
            gameOverScene.visible = false;
            startScene.visible = true;
        },
    })
    gameOverScene.addChild(menuButton);

    let gameOverSeperator = new PIXI.Graphics();
    gameOverSeperator.beginFill(0xffffff);
    gameOverSeperator.drawRect(600,0,2,600);
    gameOverSeperator.endFill();
    gameOverScene.addChild(gameOverSeperator);
}

function startGame()
{
    console.log("startGame called")
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    
    //resets all values
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
  
    // #2 - Move Ship using keyboard
    let speed = speedLevel * 100 * dt;
    let rotationSpeed = Math.PI/180 * 50 * dt;
    if (keys["KeyQ"]) ship.rotation -= rotationSpeed; ship.fwd = {x: Math.cos(ship.rotation), y : Math.sin(ship.rotation)};
    if (keys["KeyE"]) ship.rotation += rotationSpeed; ship.fwd = {x: Math.cos(ship.rotation), y : Math.sin(ship.rotation)};
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
        if(c.shootCooldown <= 0)
            {
                c.shootCooldown = 5;
                let b = new Bullet(c.x, c.y, false);
                b.fwd = normalizeVector(c.x,ship.x,c.y,ship.y);
                bullets.push(b);
                gameScene.addChild(b);
            }
            else
            {
                c.shootCooldown-=dt;
            }
        if (c.x-c.width/2 < 0 || c.x > 600 - c.width/2)
        {
            c.reflectX();
            c.move(dt);
        }
        if (c.y-c.height/2 < 0 || c.y > 600 - c.height/2)
        {
            c.reflectY();
            c.move(dt);
        }
    }
  
    // #4 - Move Bullets
    for (let b of bullets) {
        b.move(dt);
        //checks if its in bounds
        if(b.x < 0 || b.x > 600 || b.y < 0 || b.y > 600)
        {
            gameScene.removeChild(b);
            b.isAlive = false;  
        }
    }
    
    for(let b of bullets)
    {
        //checks if the enemy bullets hit the ship
        if (b.isAlive && rectsIntersect(b,ship) && !b.isFriendly)
            {
                hitSound.play();
                gameScene.removeChild(b);
                b.isAlive = false;
                decreaseLifeBy(10);
            }
    }

    // #5 - Check for Collisions
    for (let c of circles)
    {
        // 5A - circles & bullets
        for (let b of bullets)
        {
            if(rectsIntersect(c,b) && b.isFriendly)
            {
                hitSound.play();
                createExplosion(c.x,c.y,64,64);
                gameScene.removeChild(c);
                c.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
                break;
            }

            
        }

        //checks circle to circle collision
        for(let e of circles)
        {
            if(c.isAlive && e.isAlive && c!==e)
            {
                if(rectsIntersect(c,e))
                {
                    c.reflectX();
                    c.reflectY();
                    e.reflectX();
                    e.reflectY();

                    let overlapX = Math.min(c.x + c.width - e.x, e.x+e.width-c.x);
                    let overlapY = Math.min(c.y +c.height - e.y, e.y + e.height - c.y);
                    if(overlapX < overlapY)
                    {
                        if(c.x<e.x)
                        {
                            c.x-=overlapX/2;
                            e.x+=overlapX/2;
                        }
                        else
                        {
                            c.x+=overlapX;
                            e.x-=overlapX;
                        }
                    }
                    else
                    {
                        if(c.y<e.y)
                            {
                                c.y-=overlapY/2;
                                e.y+=overlapY/2;
                            }
                            else
                            {
                                c.y+=overlapY;
                                e.y-=overlapY;
                            }
                    }
                    c.x = clamp(c.x, 0+c.width/2, 600-c.width/2);
                    c.y = clamp(c.y, 0+c.height/2, 600 - c.height/2);
                    e.x = clamp(e.x, 0+e.width/2, 600-e.width/2);
                    e.y = clamp(e.y, 0+e.height/2, 600 - e.height/2);
                }
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
        let c = new Circle();
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

    gameOverScoreLabel.text = "Coins: " + score;

    gameOverScene.visible = true;
    gameScene.visible = false;
}

function fireBullet() 
{
    if(paused) return;

    let angles = [];
    let shipRot = ship.rotation;
    //shoots bullets in the direction of the ships rotation
    switch(spread)
    {
        case 3:
            angles = [shipRot - Math.PI/12,shipRot,shipRot + Math.PI/12];
            break;

        case 2:
            angles = [shipRot - Math.PI/8,shipRot + Math.PI/8];
            break;

        case 1:
            angles = [shipRot];
            break;
    }
    
    for (let i = 0; i < angles.length; i++)
        {
            let b = new Bullet(ship.x, ship.y, true);
            //have to add pi/2 because the fwd is right when the ship is facing up
            let radians = angles[i] - Math.PI/2;
            b.fwd.x = Math.cos(radians);
            b.fwd.y = Math.sin(radians);
            console.log(b.fwd);
            bullets.push(b);
            gameScene.addChild(b);
        }
    shootSound.play();
}

function loadSpriteSheet()
{
    let spriteSheet = PIXI.Texture.from("images/ExplosionSpriteSheet.png");
    let width = 320;
    let height = 320;
    let numFrames = 4;
    let textures = [];
    for (let i = 0; i < numFrames; i++)
    {
        let frame = new PIXI.Texture(spriteSheet.baseTexture, new PIXI.Rectangle(i*width, 0, width, height));
        textures.push(frame);
    }
    return textures;
}

function createExplosion(x, y, frameWidth, frameHeight)
{
    let w2 = frameWidth/2;
    let h2 = frameHeight/2;
    let expl = new PIXI.AnimatedSprite(explosionTextures);
    expl.scale.set(.4);
    expl.x = x - expl.width/2; //we want the center of the explosion to be at the center of the circle
    expl.y = y - expl.height/2; //same for height
    expl.animationSpeed = 1/7;
    expl.loop = false;
    expl.onComplete = () => gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}

//creates start screen animation
function loadBoatAnimation()
{
    let boat = PIXI.Texture.from("images/BoatAnimation.png");
    let width = 640;
    let height = 640;
    let numFrames = 12;

    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        let frame = new PIXI.Texture(boat.baseTexture, new PIXI.Rectangle(i*width, 0, width, height));
        textures.push(frame);
    }
    return textures;
}

function addBoatAnimationToScene() {
    let boatTexture = loadBoatAnimation();
    let boatAnim = new PIXI.AnimatedSprite(boatTexture);

    boatAnim.anchor.set(0.5);
    boatAnim.x = (sceneWidth-200)/2;
    boatAnim.y = sceneHeight/2+50;
    boatAnim.scale.set(0.625);
    boatAnim.animationSpeed = 0.1;
    boatAnim.loop = true;
    boatAnim.play();
    startScene.addChild(boatAnim);
}

//add an image to game over screen
function addBrokenBoat() {
    let boat = new PIXI.Sprite(app.loader.resources["images/BrokenShip.png"].texture);
    boat.anchor.set(0.5);
    boat.x = (sceneWidth-200)/2;
    boat.y = sceneHeight/2+100;
    boat.scale.set(3);
    gameOverScene.addChild(boat);
}