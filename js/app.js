'use strict';

const COLS = 7;
const ROWS = 6;
const SCALE = 100;
const EMPTY = 0;
const PLAY1 = 1;
const PLAY2 = 2;
const WINNER = 3;

var canvas;
var ctx;
var selPlayer = true;
var frames = 0;
var selRow = 0;
var sel = false;

$(document).ready(function () {

    main();

});

function toggleCfg() {
    $("#cfg").slideToggle("slow");
    $("#icon").toggleClass('glyphicon-triangle-bottom glyphicon-triangle-top');
}

function initGame() {
    grid.init(COLS, ROWS, EMPTY);
}

function main() {
    canvas = $("#canvas").get(0);
    canvas.width = COLS * SCALE;
    canvas.height = ROWS * SCALE;
    ctx = canvas.getContext("2d");
    grid.init(COLS, ROWS, EMPTY);
    canvas.addEventListener('click', onCanvasClick);

    loop();
}

var grid = {
    width: null,
    height: null,
    gridMap: null,
    endGame: null,
    winGame: null,
    winPlayer: null,
    active: null,
    start: null,

    init: function (cols, rows, data) {
        this.width = cols;
        this.height = rows;
        this.winGame = false;
        this.winPlayer = false;
        this.active = false;
        this.start = true;
        this.gridMap = [];
        $("#alert").html("");
        for (let x = 0; x < cols; x++) {
            this.gridMap[x] = [];
            for (let y = 0; y < rows; y++) {
                this.gridMap[x][y] = data;
            }
        }
    },

    set: function (col, row, dat) {
        this.gridMap[col][row] = dat;
    },

    get: function (col, row) {
        return this.gridMap[col][row];
    },

    shift: function (row) {

        for (let x = 0; x < this.width; x++) {
            if (this.gridMap[x][row + 1] === EMPTY) {
                this.gridMap[x][row + 1] = this.gridMap[x][row];
                this.gridMap[x][row] = EMPTY;
            }
        }
    },

    endChk: function () {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.gridMap[x][y] === EMPTY) {
                    return this.endGame = false;
                }
            }
        }
        return this.endGame = true;
    },

    find4Row: function (xStart, xStop, xInc, yStart, yStop, yInc, play) {

        this.activeChk();

        if (this.active === false) {
            for (let x = xStart; x < xStop; x++) {
                for (let y = yStart; y < yStop; y++) {

                    if ((this.gridMap[x + xInc * 0][y + yInc * 0] === play) &&
                        (this.gridMap[x + xInc * 1][y + yInc * 1] === play) &&
                        (this.gridMap[x + xInc * 2][y + yInc * 2] === play) &&
                        (this.gridMap[x + xInc * 3][y + yInc * 3] === play)) {
                        this.winGame = true;
                        this.winPlayer = (play === PLAY1) ? true : false;
                        this.gridMap[x + xInc * 0][y + yInc * 0] = WINNER;
                        this.gridMap[x + xInc * 1][y + yInc * 1] = WINNER;
                        this.gridMap[x + xInc * 2][y + yInc * 2] = WINNER;
                        this.gridMap[x + xInc * 3][y + yInc * 3] = WINNER;
                    }
                }
            }
        }
    },

    winChk: function () {

        this.find4Row(0, this.width, 0, 0, (this.height - 3), 1, PLAY1);
        this.find4Row(0, this.width, 0, 0, (this.height - 3), 1, PLAY2);

        this.find4Row(0, (this.width - 3), 1, 0, this.height, 0, PLAY1);
        this.find4Row(0, (this.width - 3), 1, 0, this.height, 0, PLAY2);

        this.find4Row(0, (this.width - 3), 1, 0, (this.height - 3), 1, PLAY1);
        this.find4Row(0, (this.width - 3), 1, 0, (this.height - 3), 1, PLAY2);

        this.find4Row(0, (this.width - 3), 1, 3, this.height, -1, PLAY1);
        this.find4Row(0, (this.width - 3), 1, 3, this.height, -1, PLAY2);

    },

    activeChk: function () {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height - 1; y++) {
                if ((this.gridMap[x][y] !== EMPTY) && (this.gridMap[x][y + 1] === EMPTY)) {
                    return this.active = true;
                }
            }
        }
        return this.active = false;
    }
};

var ai = {

    diff: 1,
    enable: true,

    setDiff: function (diff) {
        this.diff = diff;
    },

    makeMove: function () {
        if (this.enable === true) {
            if (this.diff === 0) {
                this.makeRnd();
            } else {
                for (let play = PLAY2; play >= PLAY1; play--) {
                    let find;
                    let resp;

                    find = this.find3X(play);
                    resp = this.find3(find);
                    if (resp === true) {
                        //console.log(`FIND 3X X = ${find}`);
                        return true;
                    }

                    find = this.find3Y(play);
                    resp = this.find3(find);
                    if (resp === true) {
                        //console.log(`FIND 3Y X = ${find}`);
                        return true;
                    }

                    find = this.find3Z(play);
                    resp = this.find3(find);
                    if (resp === true) {
                        //console.log(`FIND 3Z X = ${find}`);
                        return true;
                    }

                    find = this.find3N(play);
                    resp = this.find3(find);
                    if (resp === true) {
                        //console.log(`FIND 3N X = ${find}`);
                        return true;
                    }
                }
                this.makeRnd();
            }
        }
    },

    makeRnd: function () {
        let loop = true;
        while (loop) {
            let rnd = Math.floor(Math.random() * COLS);
            if (grid.get(rnd, 0) === EMPTY) {
                grid.set(rnd, 0, PLAY2);
                loop = false;
                selPlayer = !selPlayer;
            }
            //console.log(`RND X = ${rnd}`);
        }
    },

    find3: function (find) {
        if (find !== COLS) {
            grid.set(find, 0, PLAY2);
            selPlayer = !selPlayer;
            return true;
        }
        return false;
    },

    find3X: function (play) {
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS - 3; x++) {
                if ((grid.get(x + 0, y) === EMPTY) &&
                    (grid.get(x + 1, y) === play) &&
                    (grid.get(x + 2, y) === play) &&
                    (grid.get(x + 3, y) === play) &&
                    ((grid.get(x + 0, y + 1) !== EMPTY) ||
                        (y === ROWS - 1))) {
                    return x + 0;
                }
                if ((grid.get(x + 0, y) === play) &&
                    (grid.get(x + 1, y) === EMPTY) &&
                    (grid.get(x + 2, y) === play) &&
                    (grid.get(x + 3, y) === play) &&
                    ((grid.get(x + 1, y + 1) !== EMPTY) ||
                        (y === ROWS - 1))) {
                    return x + 1;
                }
                if ((grid.get(x + 0, y) === play) &&
                    (grid.get(x + 1, y) === play) &&
                    (grid.get(x + 2, y) === EMPTY) &&
                    (grid.get(x + 3, y) === play) &&
                    ((grid.get(x + 2, y + 1) !== EMPTY) ||
                        (y === ROWS - 1))) {
                    return x + 2;
                }
                if ((grid.get(x + 0, y) === play) &&
                    (grid.get(x + 1, y) === play) &&
                    (grid.get(x + 2, y) === play) &&
                    (grid.get(x + 3, y) === EMPTY) &&
                    ((grid.get(x + 3, y + 1) !== EMPTY) ||
                        (y === ROWS - 1))) {
                    return x + 3;
                }
            }
        }
        return COLS;
    },

    find3Y: function (play) {
        let cnt;
        for (let x = 0; x < COLS; x++) {
            cnt = 0;
            for (let y = ROWS - 1; y >= 0; y--) {
                if (grid.get(x, y) === play) {
                    cnt++;
                } else {
                    if ((cnt === 3) && (grid.get(x, y) === EMPTY)) {
                        return x;
                    }
                    cnt = 0;
                }
            }
        }
        return COLS;
    },

    find3Z: function (play) {
        for (let x = 0; x < COLS - 3; x++) {
            for (let y = 3; y < ROWS; y++) {
                if ((grid.get(x + 0, y - 0) === EMPTY) &&
                    (grid.get(x + 1, y - 1) === play) &&
                    (grid.get(x + 2, y - 2) === play) &&
                    (grid.get(x + 3, y - 3) === play) &&
                    ((grid.get(x + 0, y + 1) !== EMPTY) ||
                        (y === ROWS - 1))) {
                    //console.log(`X = ${x} Y= ${y}`);
                    return x + 0;
                }
                if ((grid.get(x + 0, y - 0) === play) &&
                    (grid.get(x + 1, y - 1) === EMPTY) &&
                    (grid.get(x + 2, y - 2) === play) &&
                    (grid.get(x + 3, y - 3) === play) &&
                    (grid.get(x + 1, y - 0) !== EMPTY)) {
                    //console.log(`X = ${x} Y= ${y}`);
                    return x + 1;
                }
                if ((grid.get(x + 0, y - 0) === play) &&
                    (grid.get(x + 1, y - 1) === play) &&
                    (grid.get(x + 2, y - 2) === EMPTY) &&
                    (grid.get(x + 3, y - 3) === play) &&
                    (grid.get(x + 2, y - 1) !== EMPTY)) {
                    //console.log(`X = ${x} Y= ${y}`);
                    return x + 2;
                }
                if ((grid.get(x + 0, y - 0) === play) &&
                    (grid.get(x + 1, y - 1) === play) &&
                    (grid.get(x + 2, y - 2) === play) &&
                    (grid.get(x + 3, y - 3) === EMPTY) &&
                    (grid.get(x + 3, y - 2) !== EMPTY)) {
                    //console.log(`X = ${x} Y= ${y}`);
                    return x + 3;
                }
            }
        }
        return COLS;
    },

    find3N: function (play) {
        for (let x = 3; x < COLS; x++) {
            for (let y = 3; y < ROWS; y++) {
                if ((grid.get(x - 0, y - 0) === EMPTY) &&
                    (grid.get(x - 1, y - 1) === play) &&
                    (grid.get(x - 2, y - 2) === play) &&
                    (grid.get(x - 3, y - 3) === play) &&
                    ((grid.get(x - 0, y + 1) !== EMPTY) ||
                        (grid.gridMap === ROWS - 1))) {
                    return x - 0;
                }
                if ((grid.get(x - 0, y - 0) === play) &&
                    (grid.get(x - 1, y - 1) === EMPTY) &&
                    (grid.get(x - 2, y - 2) === play) &&
                    (grid.get(x - 3, y - 3) === play) &&
                    (grid.get(x - 1, y - 0) !== EMPTY)) {
                    return x - 1;
                }
                if ((grid.get(x - 0, y - 0) === play) &&
                    (grid.get(x - 1, y - 1) === play) &&
                    (grid.get(x - 2, y - 2) === EMPTY) &&
                    (grid.get(x - 3, y - 3) === play) &&
                    (grid.get(x - 2, y - 1) !== EMPTY)) {
                    return x - 2;
                }
                if ((grid.get(x - 0, y - 0) === play) &&
                    (grid.get(x - 1, y - 1) === play) &&
                    (grid.get(x - 2, y - 2) === play) &&
                    (grid.get(x - 3, y - 3) === EMPTY) &&
                    (grid.get(x - 3, y - 2) !== EMPTY)) {
                    return x - 3;
                }
            }
        }
        return COLS;
    }
};

function onCanvasClick(evt) {
    let mousePos = getMousePos(canvas, evt);
    let selCols = Math.floor(mousePos / SCALE);
    let player = (selPlayer) ? PLAY1 : PLAY2;

    if (grid.get(selCols, 0) !== EMPTY) {
        $("#alert").html(`THIS COLUMN ${selCols} IS FULL! PLEASE SELECT NOT FULL!`);
    } else if (grid.active === true) {
        $("#alert").html(`PLEASE WAIT!`);
    } else {
        $("#alert").html("");
        if (grid.winGame === false) {
            grid.set(selCols, 0, player);
            selPlayer = !selPlayer;
        }
    }
    selRow = (ROWS - 2);
}

function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return evt.clientX - rect.left;
}

function loop() {
    update();
    draw();
    window.requestAnimationFrame(loop, canvas);
}

function update() {

    frames++;

    if ((frames % 3) === 0) {

        grid.shift(selRow);

        if (selRow === (ROWS - 2)) {
            selRow = 0;
        } else {
            selRow++;
        }

        grid.activeChk();
        if ((grid.active === false) &&
            (selPlayer === false) &&
            (grid.endGame === false) &&
            (grid.winGame === false) &&
            (selRow === (ROWS - 2))) {
            ai.makeMove();
        }
    }

    checkWin()
}


function draw() {

    let tw = canvas.width / COLS;
    let th = canvas.height / ROWS;

    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            switch (grid.get(x, y)) {
                case EMPTY:
                    drawCircle(50 + x * tw, 50 + y * th, 43, "#eee");
                    break;
                case PLAY1:
                    drawCircle(50 + x * tw, 50 + y * th, 43, "#fc5555");
                    break;
                case PLAY2:
                    drawCircle(50 + x * tw, 50 + y * th, 43, "#ffff40");
                    break;
                case WINNER:
                    if (grid.winPlayer === true) {
                        drawCircle(50 + x * tw, 50 + y * th, 43, sel ? "#fff" : "#fc5555");
                    } else {
                        drawCircle(50 + x * tw, 50 + y * th, 43, sel ? "#fff" : "#ffff40");
                    }
                    break;
            }
        }
    }
    if ((frames % 20) === 0) {
        sel = !sel;
    }
}

function drawCircle(x, y, radius, color) {

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
}

var play1Win = 0;
var play2Win = 0;

function checkWin() {

    if (selPlayer) {
        $("#userMsg").css("background", "#fc5555");
        $("#userMsg").html("NEXT PLAYER 1");
    } else {
        $("#userMsg").css("background", "#ffff40");
        $("#userMsg").html("NEXT PLAYER 2");
    }

    grid.endChk();
    if (grid.endGame) {
        $("#userMsg").html("GAME OVER");
        $("#userMsg").css("background", "#266fe2");
    }

    grid.winChk();
    if (grid.winGame === true) {

        if (grid.winPlayer === true) {
            $("#userMsg").html("GAME OVER WINNER PLAYER 1");
            $("#userMsg").css("background", "#fc5555");
            if (grid.start === true) {
                play1Win++;
                grid.start = false;
            }
        } else {
            $("#userMsg").html("GAME OVER WINNER PLAYER 2");
            $("#userMsg").css("background", "#ffff40");
            if (grid.start === true) {
                play2Win++;
                grid.start = false;
            }
        }
    }

    $("#play1").html(`PLAYER 1 SCORE: ${play1Win}`);
    $("#play2").html(`PLAYER 2 SCORE: ${play2Win}`);
}

function selPlay() {

    let sel = $("#play").val();
    if (sel === "computer") {
        ai.enable = true;
    } else if (sel === "user") {
        ai.enable = false;
    }
}