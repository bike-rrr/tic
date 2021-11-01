// test to see if i can push now
// set flags onto screen
console.log("teal")
const board = document.querySelectorAll(".board img");
const flagLoadCheck = setInterval(() => {
    const len = document.querySelectorAll(".board img").length;
    console.log(len)
    if (len === 21) {
        console.log("flasgs loades")
        document.querySelector(".lower").style.visibility = "visible";
        clearInterval(flagLoadCheck)
    }

}, 800);

document.querySelector("body").style.backgroundColor = "red"
const loadFlags = new Promise(res => {
    for (let i = 0; i < 21; i++) {
        const image = new Image();
        image.src = './images/flag.gif';
        image.setAttribute('id', i);
        image.setAttribute('class', 'open');
        image.style.borderRadius = "70px";
        const board = document.querySelector(".board");
        board.appendChild(image);
        board.style.height = 'auto';
    }
    console.log('1-done loading flags')
    res('sucess')
})
// loadFlags
//     .then(() => {
//         console.log("2-finished promise")
//         showBottomBtns()
//         console.log("4done")
//     });
console.log("9")
// this is done to fix the flickering of bottom buttons on page load and fast reload
function showBottomBtns() {
    // document.querySelector(".lower").style.visibility = "visible";
    console.log('3-added buttons')
}

let count = 0;
let available = true;
let moves = 0;
let playerTurn;
let computerPicks = [];
let timerStuff = [];
let timers = [];
let timerButtonsShowing = false;
let gameIsOver = false;
let timerSeconds = parseInt(document.querySelector("#timer").value);
let greenBtn = false;

seeWhoGoesFirst();
const turnPlayer1 = "1 goes first";
const turnPlayer2 = "2 goes first";
let computersTurn = false;
let firstTimeLoaded = true; // so we dont reload flags on replay, i think..
let singlePlayer = false;
showTurn();

// set flag animations on click
document.querySelectorAll("img").forEach(item => {
    item.onclick = () => {
        if (item.classList.contains("open") && !computersTurn && !timerButtonsShowing) {
            item.classList.remove("reappear"); // have to remove the reappear so we can let it disappear
            item.classList.add("disappear");
            item.classList.remove("open");
            // run main program count
            tabulate();
        }
    }
})

// main program
function tabulate() {
    count++;
    moves++
    removeDots();

    // game over
    if (count === 21) {
        let winner = playerTurn;
        if (winner === "1") {
            winner = document.querySelector(".one").innerHTML;
        }
        else {
            winner = document.querySelector(".two").innerHTML;

        }
        gameOver(winner);
        // removeBlink();
        return;
    }
    if (moves > 0) {
        // addBlink();
    }
    // so player switches autmatically on their 3rd move
    if (moves > 2) {
        document.querySelector("#done").click();
    }
}

// lets next player make the move
document.querySelector("#done").onclick = () => {
    if (count === 21 || moves === 0 || computersTurn || timerButtonsShowing || gameIsOver) {
        return;
    }

    // removeBlink();
    killIntervals();

    moves = 0;

    if (playerTurn === "1") {
        playerTurn = "2";
    }
    else {
        playerTurn = "1";
    }

    // update player turn display
    showTurn();
}

// show whos turn it is
function showTurn() {

    restoreDots();
    const player1 = document.querySelector(".one");
    const player2 = document.querySelector(".two");
    const p1 = document.querySelector(".p1");
    const p2 = document.querySelector(".p2");

    if (playerTurn === "1") {
        // shows dots
        p2.classList.remove("reappear");
        p2.classList.add("disappear")
        p1.classList.add("reappear")

        // so dots dont animate on first page load
        p1.style.visibility = "visible"
        if (firstTimeLoaded) {
            firstTimeLoaded = false;
        }
        else {
            p1.classList.add("reappear")
        }

        player1.style.color = "yellow";
        player2.style.color = "white";
    }
    else {
        // show dots
        p1.classList.remove("reappear");
        p1.classList.add("disappear");

        p2.style.visibility = "visible";
        p2.classList.add("reappear");

        player2.style.color = "yellow";
        player1.style.color = "white"
    }

    // check if its multipayer or singlePlayer
    if (document.querySelector("#select").selectedIndex > 1) {
        singlePlayer = true;
    }
    else {
        singlePlayer = false
    }

    // check if its SINGLE PLAYER
    if (singlePlayer && playerTurn === "2") {
        const sel = document.querySelector("#select");
        computersTurn = true;

        if (sel.options[sel.selectedIndex].id === "pc2") {
            computerMove();
        }
        else {
            computerMove();
        }
    }
    if (singlePlayer && playerTurn === "1") {
        computersTurn = false;
    }

    if (!computersTurn) {
        timer();
    }
}

function removeDots() {
    const dots = document.querySelectorAll(`.p${playerTurn} .dot`);
    dots[dots.length - moves].classList.add("disappear");
}

function restoreDots() {
    const dots = document.querySelectorAll(`.p${playerTurn} .dot`);
    dots.forEach(item => {
        if (item.classList.contains("disappear")) {
            item.classList.remove("disappear");
        }
    })
}

// used for when when we click REPLAY
function resetFlags() {
    killTimeouts(computerPicks);
    killIntervals();
    removeTimerButtons();
    gameIsOver = false;
    greenBtn = false;

    // remove opponentDisappear class...class woul remain if replay was hit killing a timeout that removed that class
    document.querySelectorAll("img").forEach(item => {
        item.classList.remove("opponentDisappear");
    })

    // dont wanna see computer dots when comptuer is picking
    document.querySelector(".winnerMessage").style.visibility = "hidden";

    document.querySelectorAll("img").forEach(item => {
        if (!item.classList.contains("open")) {
            item.classList.remove("disappear");
            item.classList.add("open")
            item.classList.add("reappear")
        }
    })
    count = 0;
    available = true;
    moves = 0;

    const select = document.querySelector("#select").value;
    if (select === "11" || // easy
        select === "111" || // medium
        select === "1111") { // hard
        playerTurn = "1"
    }
    else {
        playerTurn = "2";
    }
    seeWhoGoesFirst();
    showTurn();
    // removeBlink();
}

// GAME OVER
function gameOver(winner) {
    gameIsOver = true;
    const player1 = document.querySelector(".one");
    const player2 = document.querySelector(".two");
    const p1 = document.querySelector(".p1");
    const p2 = document.querySelector(".p1");

    // fixing the win message -> old 2 lines
    document.querySelector(".winnerMessage").style.visibility = "visible";
    document.querySelector(".winnerMessage").innerHTML = `${winner} Wins`;
    // new stuff below
    // get div height
    // var height = document.querySelector('.board').clientHeight;

    // // set div height
    // document.querySelector(".board").style.height = `${height}px`;

    // const area = document.querySelector(".board");
    // area.innerHTML = `${winner} Wins`



    player1.style.textDecoration = "";
    player1.style.color = "white";
    player2.style.textDecoration = "";
    player2.style.color = "white";

    p1.style.visibility = "hidden";
    p2.style.visibility = "hidden";
    p1.classList.remove("reappear")
    p2.classList.remove("reappear")
}

// used so we can kill all timeouts on replay click
function computerMove() {
    // so we dont see computer picking dots
    document.querySelector(".p2").style.visibility = "hidden";

    const level = document.querySelector("#select").value;
    let [movesAvail, cheat, spots, takeWin] = movesPossibleAndCheat();
    const random = Math.floor(Math.random() * movesAvail) + 1;  // returns a random integer from 1 to 10
    let moves = cheat;

    if (level === "11" || level === "22") { // easy
        if (random != 2) {
            moves = Math.floor(Math.random() * movesAvail) + 1
        }
        // dont leave player with four spots on last move
    }
    else if (level === "111" || level === "222") { // medium
        if (random === 1) {
            moves = Math.floor(Math.random() * movesAvail) + 1;
        }
    }

    // now matter what, computer will take win
    if (takeWin) {
        moves = cheat;
    }

    const randomSpots = [];
    do {
        const pick = spots[Math.floor(Math.random() * spots.length)];
        if (!randomSpots.includes(pick)) {
            randomSpots.push(pick)
        }

    } while (randomSpots.length != cheat);

    if (level === "11" || level === "111" || level === "22" || level == "222") { // easy
        for (let i = 0; i < moves; i++) {
            computerPicks.push(setTimeout(() => {
                removeFlag(spots[i]);
            }, 500))
        }
    }

    else { // hard or impossible levels
        for (let i = 0; i < moves; i++) {
            computerPicks.push(setTimeout(() => {
                removeFlag(randomSpots[i]);
            }, 500))
        }
    }

    // click DONE
    computerPicks.push(setTimeout(() => {
        computersTurn = false;
        document.querySelector("#done").click();
    }, 1250))

}

// animation for flag click
function removeFlag(num) {
    let flag = document.getElementById(num);
    if (computersTurn) {
        flag.classList.add("opponentDisappear"); // this is YELLOW BACKGROUND EFFECT
    }
    else {
        flag.classList.add("timerFlagsDisappear"); // this is YELLOW BACKGROUND EFFECT
    }

    computerPicks.push(setTimeout(() => {
        flag.classList.remove("reappear"); // have to remove the reappear so we can let it disappear
        flag.classList.add("disappear");
        flag.classList.remove("open");
        if (computersTurn) {
            flag.classList.remove("opponentDisappear");
        }
        else {
            flag.classList.remove("timerFlagsDisappear"); // this is YELLOW BACKGROUND EFFECT
        }
        tabulate();
    }, 500))
}

function killTimeouts() {
    for (let i = 0; i < computerPicks.length; i++) {
        clearTimeout(computerPicks[i]);
    }
}

function seeWhoGoesFirst() {
    const select = document.querySelector("#select").value;
    if (select === "1" ||
        select === "11" || // easy
        select === "111" ||  // medium
        select === "1111") {  // hard
        playerTurn = "1"
    }
    else {
        playerTurn = "2";
    }
}

// reset board for player change order
document.querySelector("#select").onchange = () => {

    // check if its multipayer or singlePlayer
    if (document.querySelector("#select").selectedIndex > 1) {
        singlePlayer = true;
    }
    else {
        singlePlayer = false
    }

    // get player turn to seet dots and yellow on correct side
    playerTurn = document.querySelector("#select").value;
    resetFlags();

    // const sel = document.querySelector("#select");
    // console.log(sel.options[sel.selectedIndex].id);

    // timer buttons showed when changing player turn...maybe make them disappear here
}

// REPLAY
document.querySelector("#replay").onclick = () => {
    resetFlags();
}

function addBlink() {
    if (!computersTurn) {
        document.querySelector("#done").classList.add("blink")
    }
}

function removeBlink() {
    document.querySelector("#done").classList.remove("blink")
}

function showMovesAvailable() {
    let elements = document.querySelectorAll(".one");

    for (let i = 0; i < elements.length; i++) {

        const str = elements[i].textContent
        elements[i].innerHTML = "";

        for (let j = 0; j < str.length; j++) {
            let n = document.createElement('span');
            elements[i].appendChild(n);
            n.textContent = str[j];
            if (j % 2 == 0 && j < 5) {
                n.style.textDecoration = "underline";
            } else {
            }
        }
    }
}
// _ _ _ _   5 _ _ _   9 _ _ _   13 _ _ _   17 _ _ _   21

function runIt() {
    for (let i = 0; i < 21; i++) {
        setTimeout(() => {
            document.getElementById(i).click();
        }, 0)
    }
}
function showButtons() {
    // disable bottom done button
    document.querySelector("#done").classList.remove("turnFontWhite");
    document.querySelector("#done").classList.add("turnFontBlack")

    timerButtonsShowing = true;
    let buttons = document.querySelector(".buttons");
    buttons.innerHTML = "";

    const flags = document.querySelectorAll(".open");
    flags.forEach(item => {
        item.classList.remove("reappear");
        item.classList.add("disappear");
    })

    timerStuff.push(setTimeout(() => {
        let counter = 0;
        let movesPossible;
        if (count < 19) {
            movesPossible = 3 - moves;
        }
        else {
            movesPossible = (21 - count);
            if (movesPossible > (3 - moves)) {
                movesPossible = 3 - moves;
            }
        }

        for (let i = 0; i < movesPossible; i++) {
            buttons.innerHTML += `<button class="timerButton">${i + 1}</button>`;
            counter++;
        }
        if (counter != 3 && moves != 0) {
            buttons.innerHTML += `<button class="timerButton">DONE</button>`
        }
        buttons.classList.remove("disappear");
        buttons.style.visibility = "visible";
        buttons.classList.add("reappear");

        // change buttons color border to red
        const btns = document.querySelectorAll(".timerButton");
        btns.forEach(item => {
            item.style.borderColor = "red";
            item.style.boxShadow = "4px 4px 4px #b50909";
        });

        // wait 1 sec and change to green so we dont accidentally click button trying to click flag instead, need delay
        setTimeout(() => {
            btns.forEach(item => {
                item.style.borderColor = "green";
                item.style.boxShadow = "4px 4px 4px #14782a";
            });
            // now we can click
            greenBtn = true;
        }, 1000);


        document.querySelectorAll(".timerButton").forEach(item => {
            item.onclick = () => {
                if (!greenBtn) { return };
                timerButtonsShowing = false;
                placeTimerChoiceMoves(item.innerHTML);
                removeTimerButtons();
                flags.forEach(item => {
                    item.classList.remove("disappear");
                    item.classList.add("reappear")
                });
                // make so we cant click until it turns green again
                greenBtn = false;
            }
        })
    }, 200))

    // MIGHT NEED TO REMOVE DISAPPEAR CLASS ON BUTTON when hittin RESET
}

function timer() {
    if (computersTurn || gameIsOver || timerSeconds === 0) {
        return;
    }
    let time = 0;
    timers.push(setInterval(() => {
        time++;
        console.log(time);
        if (time == timerSeconds && !gameIsOver) {
            showButtons();
            killIntervals(timers);
            return;
        }
    }, 1000))
}

document.querySelector("#timer").onchange = () => {
    timerSeconds = parseInt(document.querySelector("#timer").value);
    resetFlags();
}

function killIntervals() {
    for (let i = 0; i < timers.length; i++) {
        clearInterval(timers[i]);
    }
}

function placeTimerChoiceMoves(choice) {
    if (choice === "DONE") {
        document.querySelector("#done").click();
        return;
    }
    const spots = document.querySelectorAll(".open");
    const level = document.querySelector("#select").value;
    const [, , spotList] = movesPossibleAndCheat();
    let randomSpots = [];
    const moves = parseInt(choice);

    // get random list of spots to pick
    do {
        const pick = spots[Math.floor(Math.random() * spots.length)];
        if (!randomSpots.includes(pick)) {
            randomSpots.push(pick)
        }
        // console.log("hi")
    } while (randomSpots.length != moves);


    if (level != "1111" && level != "2222") { // NOT hard/impossible levels

        for (let i = 0; i < moves; i++) {
            removeFlag(spots[i].id);
        }
        setTimeout(() => {
            document.querySelector("#done").click();
        }, 500)
    }

    else { // hard/impossible levels
        for (let i = 0; i < moves; i++) {
            removeFlag(randomSpots[i].id);
        }
        setTimeout(() => {
            document.querySelector("#done").click();
        }, 500)
    }

}

function three() {
    for (let i = 0; i < 3; i++) {
        document.getElementById(spots[i].id).click();
    }
}

function removeTimerButtons() {
    // reinstore bottom DONE button font color

    //  BUG FIX -> done buttons disappears/ reappears when replay clicked the 1st time
    // just had to comment out line below to FIX...
    // document.querySelector("#done").classList.add("turnFontWhite");

    document.querySelector("#done").classList.remove("turnFontBlack");

    const buttons = document.querySelector(".buttons");
    timerButtonsShowing = false;
    buttons.style.visibility = "hidden";
    buttons.classList.remove("reappear");
    document.querySelectorAll(".open").forEach(item => {
        item.classList.remove("disappear");
        // item.classList.add("reappear")
    })

}

function movesPossibleAndCheat() {

    let movesPossible;
    if (count < 19) {
        movesPossible = 3;
    }
    else {
        movesPossible = 21 - count;
    }

    const spotList = [];
    document.querySelectorAll("img.open").forEach(item => {
        spotList.push(item.id)
    })

    let cheat = (21 - count) % 4;

    if (cheat === 0) {
        // pick random number of spots to mix things up a bit
        cheat = Math.floor(Math.random() * 3) + 1;
    }
    let takeWin = false;

    if (cheat + count === 21) {
        takeWin = true;
    }

    // let player have a shot at winning if count is between 14 & 15
    return [movesPossible, cheat, spotList, takeWin]
}
