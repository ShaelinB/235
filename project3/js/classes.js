class Ship extends PIXI.Sprite
{
    constructor(x = 0, y = 0)
    {
        super(app.loader.resources["images/spaceship.png"].texture);
        this.anchor.set(.5, .5); //position, scalling, rotation etc are now from center of sprite
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
    }
}

class Circle extends PIXI.Graphics
{
    constructor(radius, color = 0xff0000, x = 0, y = 0)
    {
        super();
        this.beginFill(color);
        this.drawCircle(x, y, radius);
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;

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

class Bullet extends PIXI.Graphics {
    constructor(color = 0xffffff, x = 0, y = 0)
    {
        super();
        this.beginFill(color);
        this.drawRect(-2,-3,4,6);
        this.x = x;
        this.y = y;

        this.fwd = {x: 0, y: -1};
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt = 1/60)
    {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

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
            fill: 0xFFFFFF,
            fontSize: 16,
            fontFamily: "Futura",
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
        //this.buttonText.text = label;
        if(this.children.length > 1)
        {
            this.removeChildAt(1);
        }

        let textStyle = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 16,
            fontFamily: "Futura",
        });

        let buttonText = new PIXI.Text(label,textStyle);
        buttonText.anchor.set(0.5);
        buttonText.x = this.sizeX/2;
        buttonText.y = this.sizeY/2;

        this.addChild(buttonText);
    }
}