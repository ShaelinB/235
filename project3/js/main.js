"use strict";
const app = new PIXI.Application({
    width: 600,
    height: 600
});

document.body.appendChild(app.view);

const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

let stage;

let startScene;
let gameScene, ship, scoreLabel, shootSound, hitSound, fireballSound;
let overScene;

let enimies = [];
let cannonBalls = [];
let explosions = [];
let explosionTextures;
let score = 0;
let health = 100;
let level = 1;
let paused = true;
scoreLabel = score;