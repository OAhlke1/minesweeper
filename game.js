let playground = document.querySelector('.playground');
let timerCounter = 0;
let fields = [];
let shells = [];
let fieldsWithoutMine= [];
let shellsWithoutMine = [];
let list = [];
let amountX;
let amountY;
let playgroundWidth = playground.offsetWidth;
let playgroundHeight = playground.offsetHeight;
let fieldsAmount = 0;
let minesAmount;
let timerIntervalCode;

function addEventListeners() {
    document.addEventListener('keypress', (event) => {
        if(event.key === "p" || event.key === "P") {
            if(timerCounter > 0 && fieldsAmount > 0) {
                if(document.querySelector('.shield').classList.contains('disNone')) {
                    pauseGame();
                }else { continueGame(); }
            }
        }
    })
}

function createFields() {
    if(document.querySelector('.timer').hasAttribute('started')) { stopTimer(); }
    if(amountX === parseInt(document.querySelector('#fieldsInWidth').value) && amountY === parseInt(document.querySelector('#fieldsInHeight').value)) {
        fields = document.querySelectorAll('.field');
        shells = document.querySelectorAll('.shell');
        resetFields();
        return;
    }
    let fieldIndex = 0;
    amountX = parseInt(document.querySelector('#fieldsInWidth').value);
    amountY = parseInt(document.querySelector('#fieldsInHeight').value);
    deleteFieldNodesArray();
    if(emptyInput()) { return; }
    playground.innerHTML = ``;
    fields = [];
    for(let i=0; i<amountY; i++) {
        for(let j=0; j<amountX; j++) {
            playground.innerHTML += `<div class="field" style="width: ${100/amountX}%; top: ${100/amountY*i}%; left: ${100/amountX*j}%;" field-index="${fieldIndex}" x-coord="${j}" y-coord="${i}"></div>`;
            playground.innerHTML += `<div class="shell" style="width: ${100/amountX}%; top: ${100/amountY*i}%; left: ${100/amountX*j}%;" field-index="${fieldIndex}" onclick="checkForMine(${fieldIndex})" oncontextmenu="setFlag(event)" x-coord="${j}" y-coord="${i}"></div>`;
            fieldIndex++;
        }
    }
    setPlaygroundHeight();
}

function emptyInput() {
    if(!amountX) {
        alert('Please set the horizontal amount of fields!');
        return true;
    }else if(!amountY) {
        alert('Please set the vertical amount of fields!');
        return true;
    }else {
        return false;
    }
}

function setPlaygroundHeight() {
    playground.style.height = `${document.querySelector('.field').offsetHeight*amountY}px`;
    setMines();
}

function setMines() {
    fieldsAmount = document.querySelectorAll('.field').length;
    minesAmount = Math.floor(parseInt(document.querySelector('#amountOfMines').value) > 2*fieldsAmount/5 ? 2*fieldsAmount/5 : parseInt(document.querySelector('#amountOfMines').value));
    document.querySelector('#amountOfMines').value = minesAmount;
    if(!minesAmount) {
        alert('you must type in an amount of mine that is smaller or equal to half the amount of fields!');
        return;
    }
    for(let i=0; i<minesAmount; i++) {
        let minePosIndex = Math.floor(fieldsAmount*Math.random());
        if(document.querySelector(`.field[field-index="${minePosIndex}"]`).hasAttribute('hasmine')) {
            i--;
        }else {
            document.querySelector(`.field[field-index="${minePosIndex}"]`).setAttribute('hasmine', true);
            document.querySelector(`.shell[field-index="${minePosIndex}"]`).setAttribute('hasmine', true);
        }
    }
    collectNoMineFields();
}

function deleteFieldNodesArray() {
    for(let i=0; i<document.querySelectorAll('.field').length; i++) {
        document.querySelectorAll('.field')[i].remove();
        document.querySelectorAll('.shell')[i].remove();
    }
}

function checkForMine(fieldIndex) {
    if(document.querySelector('.timer').hasAttribute('stopped')) { timerIntervalCode = setInterval(startTimer, 10); }
    if(document.querySelectorAll('.field')[fieldIndex].querySelector('p') && document.querySelectorAll('.field')[fieldIndex].querySelector('p').innerHTML === "0") {
        removeNeighbouredShells(parseInt(document.querySelectorAll('.shell')[fieldIndex].getAttribute('x-coord')), parseInt(document.querySelectorAll('.shell')[fieldIndex].getAttribute('y-coord')));
    }
    if(!document.querySelectorAll('.shell')[fieldIndex].hasAttribute('hasmine')) {
        document.querySelectorAll('.shell')[fieldIndex].classList.add('disNone');
        if(document.querySelectorAll('.shell').length - document.querySelectorAll('.shell.disNone').length === minesAmount){ youWin(); }
    }else if(document.querySelectorAll('.shell')[fieldIndex].hasAttribute('hasmine')) { gameOver(); }
}

function removeNeighbouredShells(x, y) {
    let shell1 = document.querySelector(`.shell[x-coord="${x-1}"][y-coord="${y-1}"]`);
    let shell2 = document.querySelector(`.shell[x-coord="${x}"][y-coord="${y-1}"]`);
    let shell3 = document.querySelector(`.shell[x-coord="${x+1}"][y-coord="${y-1}"]`);
    let shell4 = document.querySelector(`.shell[x-coord="${x-1}"][y-coord="${y}"]`);
    let shell5 = document.querySelector(`.shell[x-coord="${x+1}"][y-coord="${y}"]`);
    let shell6 = document.querySelector(`.shell[x-coord="${x-1}"][y-coord="${y+1}"]`);
    let shell7 = document.querySelector(`.shell[x-coord="${x}"][y-coord="${y+1}"]`);
    let shell8 = document.querySelector(`.shell[x-coord="${x+1}"][y-coord="${y+1}"]`);
    if(shell1) { shell1.classList.add('disNone'); }
    if(shell2) { shell2.classList.add('disNone'); }
    if(shell3) { shell3.classList.add('disNone'); }
    if(shell4) { shell4.classList.add('disNone'); }
    if(shell5) { shell5.classList.add('disNone'); }
    if(shell6) { shell6.classList.add('disNone'); }
    if(shell7) { shell7.classList.add('disNone'); }
    if(shell8) { shell8.classList.add('disNone'); }
    return;
}

function collectNoMineFields() {
    document.querySelectorAll('.field').forEach((elem)=>{
        if(!elem.hasAttribute('hasmine')) {
            fieldsWithoutMine.push(elem);
        }
    })
    document.querySelectorAll('.shell').forEach((elem)=>{
        if(!elem.hasAttribute('hasmine')) {
            shellsWithoutMine.push(elem);
        }
    })
    setNumbers();
}

function setNumbers() {
    let xCoord;
    let yCoord;
    let neighbouredMineAmount;
    fieldsWithoutMine.forEach((elem)=>{
        xCoord = parseInt(elem.getAttribute('x-coord'));
        yCoord = parseInt(elem.getAttribute('y-coord'));
        neighbouredMineAmount = countMines(xCoord, yCoord);
        elem.innerHTML = "";
        elem.innerHTML = `<p neighboured-mine-amount="${neighbouredMineAmount}">${neighbouredMineAmount}</p>`;
    })
}

function crateBestList() {
    let list = localStorage.bestList ? JSON.parse(localStorage.getItem('bestList')) : {
        fieldsAmount: []
    };
    let timeList = list[fieldsAmount];
    timeList.push(parseFloat(document.querySelector('.timer p').innerHTML));
    list[fieldsAmount] = sortList(timeList);
    localStorage.setItem('bestList', JSON.stringify(list));
}

function sortList(list) {
    let puffer = [];
    for(let i=0; i<list.length-1; i++) {
        for(let j=i+1; j<list.length; j++) {
            if(list[i] > list[j]) {
                puffer = list[i];
                list[i] = list[j];
                list[j] = puffer;
            }
        }
    }
    return list;
}

function countMines(x, y) {
    let counter = 0;
    let field1 = document.querySelector(`[x-coord="${x-1}"][y-coord="${y-1}"]`);
    let field2 = document.querySelector(`[x-coord="${x}"][y-coord="${y-1}"]`);
    let field3 = document.querySelector(`[x-coord="${x+1}"][y-coord="${y-1}"]`);
    let field4 = document.querySelector(`[x-coord="${x-1}"][y-coord="${y}"]`);
    let field5 = document.querySelector(`[x-coord="${x+1}"][y-coord="${y}"]`);
    let field6 = document.querySelector(`[x-coord="${x-1}"][y-coord="${y+1}"]`);
    let field7 = document.querySelector(`[x-coord="${x}"][y-coord="${y+1}"]`);
    let field8 = document.querySelector(`[x-coord="${x+1}"][y-coord="${y+1}"]`);
    if(field1 && field1.hasAttribute('hasmine')) { counter++; }
    if(field2 && field2.hasAttribute('hasmine')) { counter++; }
    if(field3 && field3.hasAttribute('hasmine')) { counter++; }
    if(field4 && field4.hasAttribute('hasmine')) { counter++; }
    if(field5 && field5.hasAttribute('hasmine')) { counter++; }
    if(field6 && field6.hasAttribute('hasmine')) { counter++; }
    if(field7 && field7.hasAttribute('hasmine')) { counter++; }
    if(field8 && field8.hasAttribute('hasmine')) { counter++; }
    return counter;
}

function setFlag(event) {
    event.preventDefault();
    if(document.querySelector('.timer').hasAttribute('stopped')) { timerIntervalCode = setInterval(startTimer, 10); }
    let shell = event.target.closest('.shell');
    if(shell.hasAttribute('flagged')) {
        shell.removeAttribute('flagged')
    }else { shell.setAttribute('flagged', true); }
}

function resetFields() {
    fields.forEach((elem)=>{
        let pTag = elem.querySelector('p');
        if(pTag) { elem.removeChild(pTag); }
        elem.removeAttribute('hasmine');
    })
    shells.forEach((elem, index)=>{
        elem.removeAttribute('hasmine');
        elem.removeAttribute('flagged');
        elem.classList.remove('disNone');
    })
    setMines();
}

function startTimer() {
    document.querySelector('.pause-game').classList.remove('disNone');
    document.querySelector('.timer').removeAttribute('stopped');
    document.querySelector('.timer').setAttribute('started', true);
    document.querySelector('.timer p').innerHTML = `${timerCounter/100} sec`;
    timerCounter++;
}

function stopTimer(runYet) {
    if(timerIntervalCode) { clearInterval(timerIntervalCode); }
    if(!runYet) { timerCounter = 0; }
    document.querySelector('.pause-game').classList.add('disNone');
    document.querySelector('.timer').removeAttribute('started');
    document.querySelector('.timer').setAttribute('stopped', true);
}

function pauseGame()  {
    document.querySelector('.shield').classList.remove('disNone');
    stopTimer(true);
}

function continueGame() {
    document.querySelector('.shield').classList.add('disNone');
    timerIntervalCode = setInterval(startTimer, 10);
}

function youWin() {
    stopTimer();
    document.querySelectorAll('.shell').forEach((elem)=>{ elem.classList.add('disNone'); });
    crateBestList();
    alert('You win!');
}

function gameOver() {
    stopTimer();
    timerCounter = 0;
    document.querySelectorAll('.shell').forEach((elem)=>{ elem.classList.add('disNone'); });
    alert('Game over!');
}