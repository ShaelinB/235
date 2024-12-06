class Ship extends PIXI.Sprite
{
    constructor(x = 0, y = 0)
    {
        super(app.loader.resources["images/Boat.png"].texture);
        this.anchor.set(.5, .5); //position, scalling, rotation etc are now from center of sprite
        this.scale.set(.1);
        this.x = x;
        this.y = y;
        //the ships rotation
        this.rotation = 0;
        this.fwd = {x:0, y: 1};
    }
}

class Circle extends PIXI.Sprite
{
    constructor(x = 0, y = 0)
    {
        super(app.loader.resources["images/Enemy.png"].texture);
        this.x = x;
        this.y = y;
        this.anchor.set(.5, .5); //position, scalling, rotation etc are now from center of sprite
        this.scale.set(.075);
        this.fwd = getRandomUnitVector();
        //enemies can have a speed of 50-100
        this.speed = Math.random()*50+50;
        this.isAlive = true;
        //timer for when they can shoot at you
        this.shootCooldown = 5;

        this.x = clamp(this.x, 0, 600);
        this.y = clamp(this.y, 0, 600);
    }

    move(dt = 1/ 60)
    {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectX()
    {
        this.fwd.x *= -1;
    }

    reflectY()
    {
        this.fwd.y *= -1;
    }
}

class Bullet extends PIXI.Sprite {
    constructor(x = 0, y = 0, isFriendly)
    {
        super(app.loader.resources["images/CannonBall.png"].texture);
        this.x = x;
        this.y = y;
        this.anchor.set(0.5);
        this.scale.set(1.25);
        this.fwd = {x: 0, y: -1};
        this.speed = 400;
        this.isAlive = true;
        //if true then its a player bullet otherwise its an enemy bullet
        this.isFriendly = isFriendly;
        Object.seal(this);
    }

    move(dt = 1/60)
    {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

//button class to make buttons easier
class Button extends PIXI.Graphics {
    constructor({x,y,sizeX, sizeY,color,label,onClick}){
        super();
        this.x = x;
        this.y = y;
        this.sizeX = sizeX;
        this.sizeY = sizeY;



        //makes rectangle
        let button = new PIXI.Graphics();
        button.beginFill(color);
        button.drawRect(0,0,sizeX,sizeY)
        button.endFill();

        //interactivity
        button.interactive = true;
        button.buttonMode = true;
        button.on("pointerup", onClick);
        button.on("pointerover", () => (button.alpha = 0.7));
        button.on("pointerout", () => (button.alpha = 1.0));

        //adds text
        let textStyle = new PIXI.TextStyle({
            fill: 0x634422,
            fontSize: 16,
            fontFamily: "Georgia",
        });

        let buttonText = new PIXI.Text(label,textStyle);
        buttonText.anchor.set(0.5);
        buttonText.x = this.sizeX/2;
        buttonText.y = this.sizeY/2;

        this.addChild(button);
        this.addChild(buttonText);

    }

    changeText(label)
    {
        //removes the old label
        if(this.children.length > 1)
        {
            this.removeChildAt(1);
        }

        //creates a new one
        let textStyle = new PIXI.TextStyle({
            fill: 0x634422,
            fontSize: 16,
            fontFamily: "Georgia",
        });

        let buttonText = new PIXI.Text(label,textStyle);
        buttonText.anchor.set(0.5);
        buttonText.x = this.sizeX/2;
        buttonText.y = this.sizeY/2;

        this.addChild(buttonText);
    }
}