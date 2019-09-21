// Make connection
var socket = io.connect('http://localhost:4000/');

//Query DOM
output = document.getElementById('output');
newGameAlert = document.querySelector('.new-game-request');
playerName = document.getElementById('player-name');
accept = document.getElementById('accept');
refuse = document.getElementById('refuse');
gameSpace = document.getElementById('game-space');
startingPage = document.querySelector('.starting-page');
testButton = document.getElementById('test-button');
testText = document.getElementById('test-text');
keepCurrentHand = document.querySelector('#keep-current-hand'); 
drawNewCard = document.querySelector('#draw-new-card');
enemyNameBar = document.querySelector('.enemyPlayerName');
myNameBar = document.querySelector('.myPlayerName');
var scores = document.querySelector('.scores');
var countDownNumber = document.querySelector('.countDown-number');
middleUpLine = document.querySelector('.middleUpLine');
fullScreenButton = document.getElementById('full-screen-button');
countDown = document.querySelector('countDown');
userNameInput = document.querySelector('.set-user-name-input');
userNameInputButton = document.querySelector('.set-user-name-button');
setUserName = document.querySelector('.set-user-name');

var timerCounter = 60;
var interval = '';


var opponent = ''
var selectButtons = '';
var gameState = {};


// page loading icon
window.addEventListener('load', function() {
    document.querySelector('.loading-page').style.display = 'none';
});

//Listen for events

//get a list with active users
socket.on('users', function(users) {
    users = JSON.parse(users);

    length = Object.keys(users).length;
    
    output.innerHTML = '';
        if(length > 1) {
            for(var id in users) {
                if(users[id][1] && id !== socket.id) {
                    output.innerHTML += `<p class="select-button" id=${id}>` + users[id][0] +  '</p>';
                }
            }
        } else {
            output.innerHTML += '<p>No users found</p>';
        }
    selectButtons = output.querySelectorAll('.select-button');
    addAction(selectButtons);
    
});

// add new game event to buttons
addAction =  function(buttons) {
    if(buttons) {
        for(var button of buttons) {
            button.addEventListener('click', function() {
                socket.emit('select-player', {
                    userFrom:socket.id,
                    userTo:this.id,
                });
                opponent = this.id;
                
            });
        }
    }
}

// incoming new game request
socket.on('new-game-request', function(data){
    playerName.innerHTML = data.userFrom[1][0];
    newGameAlert.classList.remove('hideItem');
    newGameAlert.classList.add('showItem');

    //accept
    accept.addEventListener('click', function(){
        //hide request notification
        newGameAlert.classList.add('hideItem');
        newGameAlert.classList.remove('showItem');
        opponent = data.userFrom[0];

        socket.emit('start-game', data);
    });

    //refuse
    refuse.addEventListener('click', function(){
        newGameAlert.classList.add('hideItem');
        newGameAlert.classList.remove('showItem');
    });
});

//timer
setUpTimer = function(){
    countDownNumber.innerHTML = timerCounter--;
    console.log(timerCounter);
    if(timerCounter < 10){
        countDownNumber.classList.add('colorCountDown-number');
        var clockSoundEffect = new Audio("effects/clock.mp3");
        clockSoundEffect.play();  
    }
    if(timerCounter === -1){
        countDownNumber.classList.remove('colorCountDown-number');
        clearInterval(interval);
        timerCounter = 60;

            //end turn
            const myID = socket.id;
            if(gameState.users[0].userID === myID){
                var myTurn = gameState.users[0].turn;
            }
            else{
                var myTurn = gameState.users[1].turn;
            }

            if(myTurn){
                useKeepCurrentHand();
            }

 
    }

}

// show gameSpace
hideStartingPage = function() {
    startingPage.classList.add('hideItem');
}

//hide gameSpace
showStartingPage = function() {
    startingPage.classList.remove('hideItem');
}



// gameState sending and receiving
// send game state to oppononet
sendGameStateToOpponent = function(gameState, opponent) {
    gameState.general.sendTo = opponent;
    socket.emit('gameStateToOpponent', gameState);
}

isOver = async function() {
    if(gameState.general.gameOver) {
        
        if(gameState.general.sendedTheEndingScreen){
            gameState.general.sendedTheEndingScreen = false;
            sendGameStateToOpponent(gameState, opponent);
            sendGameStateToOpponent(gameState, opponent);
        }
        me.winnedRounds = 0;
        enemy.winnedRounds = 0;
        show_score(3);
        showStartingPage();
        me.winnedRounds = gameState.general.gameEndingPoints;
        enemy.winnedRounds = gameState.general.gameEndingPoints;

   } else {
       //hide userlist -> show gameSpace
       hideStartingPage();
   }
}

// get game state from server
socket.on('gameStateFromServer', async function(gameStateObject) {


    
    
    showSpecialCards();
    gameState = Object.assign({}, gameStateObject);

    //check if the game is over
    isOver();


    const myID = socket.id;
    me = {};
    enemy = {};
    if(gameState.users[0].userID === myID) {
        me = gameState.users[0];
        enemy = gameState.users[1];
    } else {
        me = gameState.users[1];
        enemy = gameState.users[0];
    }

      if(gameState.general.startTimer){
          var interval = setInterval(setUpTimer, 1000);
          gameState.general.startTimer = false;
      }


      if(enemy.activeSpecialCard === 'loveyourenemy' || enemy.activeSpecialCard ==='perfectdraw'){
        countDownNumber.classList.remove('colorCountDown-number');
        clearInterval(interval);
        timerCounter = 60;
      }


        
        //check if destroy was used
        if(gameState.general.destroyUsed === true){
            middleDownLine.innerHTML = '';
            middleUpLine.innerHTML = '';
            gameState.general.destroyUsed = false;
        }
        set_color_inRoundEnemyPointTable();

        //Toggle middle buttons    
        if(!me.turn) {
            disableButtons();
            disableUseButton();
        } else {
            if(gameState.general.firstRound === false){
                var drawCardSoundEffect = new Audio("effects/yourTurn.mp3");
                drawCardSoundEffect.play();
            }

            if(gameState.general.winner !== ''){
                //show enemy deck
                showOldEnemyCard();
                set_color_oldEnemyPointTable();
                changeOldEnemyPoints();
                if(gameState.general.winner === me.userID){
                    gameState.general.winner = '';
                    show_score(1);
                }
                if(gameState.general.winner === enemy.userID){
                    gameState.general.winner = '';
                    show_score(0);
                    addSpecialCard();
                    addSpecialCard();

                    //  showSpecialCards();
                }
                if(gameState.general.winner === 'draw'){
                    show_score(2);

                    gameState.general.winner = '';
                }
                    await sleep(2300);
            }
            enableButtons();
            enableUseButton();
            interval = setInterval(setUpTimer, 1000)
            countDownNumber.classList.remove('colorCountDown-number');
            clearInterval(interval);
            timerCounter = 60;
        }

    if(gameState.general.roundOver){
        middleUpLine.innerHTML = '';
        middleDownLine.innerHTML = '';
        gameState.general.roundOver = false;
        gameState.general.winner = '';
        sendGameStateToOpponent(gameState, me.userID);
    }

    //set header and footer
    myName.innerHTML = me.name;
    enemyName.innerHTML = enemy.name;

    //setup score table
    enemyNameRedTable.innerHTML = enemy.name;
    myNameRedTable.innerHTML = 'me';

    // my cards
    //show my cards
    showMyCards = function() {
        myCards = '';
        me.deck.forEach(function(card) {
            myCards += `<div class="images">
                            <img src="images/${card}.jpg" alt="">
                        </div>`;
        });
        downLine.innerHTML = myCards;
    }
    showMyCards();


    //Set up the enyemy cards in round
     upLine.innerHTML = `<div class="images">
     <img src="images/back.jpg" id="back" alt="">
         </div>`;

    for( i = 1; i < enemy.deck.length; ++i ) {
        enemyCard = document.createElement('div');
        enemyCard.className = 'images';
        enemyCard.innerHTML= `<img src="images/${enemy.deck[i]}.jpg">`;
        
        upLine.prepend(enemyCard);

    }


    //check if the game is over
    checkIfTheGameIsOver = async function(){
        

        if(me.winnedRounds === gameState.general.gameEndingPoints){
            gameState.general.gameOver = true;
            gameState.general.winner = enemy.userID;
            gameState.general.winnerOfGame = me.name;
            gameState.users[0].inGame = false;
            gameState.users[1].inGame = false;
        }
        if(enemy.winnedRounds === gameState.general.gameEndingPoints){        
            gameState.general.gameOver = true;
            gameState.general.winner = enemy.userID;
            gameState.general.winnerOfGame = enemy.name;
            gameState.users[0].inGame = false;
            gameState.users[1].inGame = false;
        }   
    }

    //surr the game
    surrButton.addEventListener('click', function(){
        gameState.general.gameOver = true;
        gameState.general.winner = enemy.userID;
        gameState.general.winnerOfGame = enemy.name;
        gameState.users[0].inGame = false;
        gameState.users[1].inGame = false;
        exitGame();
    });
    
    //exit game
    async function exitGame() {
        sendGameStateToOpponent(gameState, opponent);
        show_score(3);
        showStartingPage();  
        await sleep(3000);
    };

    //show the newest Spesial Card used by the enemy
    showEnemySpecialCard = async function(){
        if(enemy.activeSpecialCard){
                //give destroy a special sound effect
                 if(enemy.activeSpecialCard === 'destroy'){
                     var appearSoundEffect = new Audio("effects/destroy.mp3");
                     appearSoundEffect.play();
                 }
                 else{
                     var appearSoundEffect = new Audio("effects/appear.mp3");
                     appearSoundEffect.play();
                 }
            specialCardIcon = document.createElement('img');

            specialCardIcon.src = `images/${enemy.activeSpecialCard}.png`;
            specialCardIcon.className = "specCard";
            middleUpLine.prepend(specialCardIcon);

            var specialCardIconSelector = $(specialCardIcon);

            specialCardIconSelector.hide();
            specialCardIconSelector.fadeIn(1500, "linear", function() {
                specialCardIconSelector.css({"border-color": "greenyellow",
                "border-width":"5px", 
                "border-style":"solid"});
            });
            if(enemy.activeSpecialCard.slice(0,1) !== 'x'){

            
                $(specialCardIcon).fadeOut(1500, function() {});                                    
            }
            if(gameState.users[0].userID === me.userID){
                gameState.users[0].activeSpecialCard = '';
            }
            else{
                gameState.users[1].activeSpecialCard = '';
            }
        }
    }
    //check the Special-Cards used by the enemy
    showEnemySpecialCard();

    set_color_myPointTable();



    //count points
    myPoints.innerHTML = `Your Points:
    <p style="margin: 0px"> ${countPoints(me.deck)} / ${gameState.general.pointsToWin}</p>`;

    enemyPoints.innerHTML=`Enemy Points:
    <p style="margin: 0px"> ${countPoints(enemy.deck) - enemy.deck[0]} + ? / ${gameState.general.pointsToWin}</p>`;

    //winned rounds
    myWinnedRounds.innerHTML = me.winnedRounds;
    enemyWinnedRounds.innerHTML= enemy.winnedRounds;

});

//change the enemy tabe color while in a round
async function set_color_inRoundEnemyPointTable(){
    var enemyPointsTable = countPoints(enemy.deck) - enemy.deck[0];

     if(enemyPointsTable === gameState.general.pointsToWin){
        enemyPoints.style.background = 'rgb(51, 255, 51)';
     }
     if(enemyPointsTable > gameState.general.pointsToWin){
         enemyPoints.style.background = 'rgb(255, 71, 26)';
     }
     if(enemyPointsTable < gameState.general.pointsToWin){
        enemyPoints.style.background = '#EEE7DB';
     }
}

changeEnemyPoints = function(){
    enemyPoints.innerHTML=`Enemy Points:
    <p style="margin: 0px"> ${countPoints(enemy.deck)} / ${gameState.general.pointsToWin}</p>`;
    enemyWinnedRounds.innerHTML= enemy.winnedRounds;
}
changeOldEnemyPoints = function(){
    enemyPoints.innerHTML=`Enemy Points:
    <p style="margin: 0px"> ${countPoints(gameState.general.oldEnemyDeck)} / ${gameState.general.pointsToWin}</p>`;
    enemyWinnedRounds.innerHTML= enemy.winnedRounds;
}

//Show all the enemy Cards after a round, depending on who's turn it s
 showEnemyCard = function(){
    upLine.innerHTML = `<div class="images">
    <img src="images/${enemy.deck[0]}.jpg" alt="">
        </div>`;

     for( i = 1; i < enemy.deck.length; ++i ) {
         enemyCard = document.createElement('div');
         enemyCard.className = 'images';
         enemyCard.innerHTML= `<img src="images/${enemy.deck[i]}.jpg">`;
        
         upLine.prepend(enemyCard);
      
     }
  }

//Show all the enemy Cards after a round, depending on who's turn it s
showOldEnemyCard = function(){
    upLine.innerHTML = `<div class="images">
    <img src="images/${gameState.general.oldEnemyDeck[0]}.jpg" alt="">
        </div>`;

     for( i = 1; i < gameState.general.oldEnemyDeck.length; ++i ) {
         enemyCard = document.createElement('div');
         enemyCard.className = 'images';
         enemyCard.innerHTML= `<img src="images/${gameState.general.oldEnemyDeck[i]}.jpg">`;
        
         upLine.prepend(enemyCard);
    
     }

}

//count points
countPoints = function(deck) {

    point = 0;
    deck.forEach((card) => {
        point += card;
    })
    return point;
}

//set the color of your point table
function set_color_myPointTable(){
    var myPointsTable = countPoints(me.deck);

     if(myPointsTable === gameState.general.pointsToWin){
        myPoints.style.background = 'rgb(51, 255, 51)';
     }
     if(myPointsTable > gameState.general.pointsToWin){
         myPoints.style.background = 'rgb(255, 71, 26)';
     }
     if(myPointsTable < gameState.general.pointsToWin){
        myPoints.style.background = '#EEE7DB';
     }
}
async function set_color_enemyPointTable(){
    var enemyPointsTable = countPoints(enemy.deck);

     if(enemyPointsTable === gameState.general.pointsToWin){
        enemyPoints.style.background = 'rgb(51, 255, 51)';
     }
     if(enemyPointsTable > gameState.general.pointsToWin){
         enemyPoints.style.background = 'rgb(255, 71, 26)';
     }
     if(enemyPointsTable < gameState.general.pointsToWin){
        enemyPoints.style.background = '#EEE7DB';
     }
     await sleep(2300);
     enemyPoints.style.background = '#EEE7DB';
}

async function set_color_oldEnemyPointTable(){
    var enemyPointsTable = countPoints(gameState.general.oldEnemyDeck);

     if(enemyPointsTable === gameState.general.pointsToWin){
        enemyPoints.style.background = 'rgb(51, 255, 51)';
     }
     if(enemyPointsTable > gameState.general.pointsToWin){
         enemyPoints.style.background = 'rgb(255, 71, 26)';
     }
     if(enemyPointsTable < gameState.general.pointsToWin){
        enemyPoints.style.background = '#EEE7DB';
     }
     await sleep(2300);
     enemyPoints.style.background = '#EEE7DB';
}

//delete card from deck
deleteCardFromDeck = function(deck, card) {
    for(var i = 0; i<deck.length; ++i){
        if(card == deck[i]){
            deck.splice(i, 1);
        }
    }
}   



// Keep current hand button
keepCurrentHand.addEventListener('click', useKeepCurrentHand)

function useKeepCurrentHand() {
    
    countDownNumber.classList.remove('colorCountDown-number');
    clearInterval(interval);
    timerCounter = 60;


    //delete the enemy active Special Card
    if(gameState.users[0].userID === me.userID){
        gameState.users[0].activeSpecialCard = '';
    }
    else{
        gameState.users[1].activeSpecialCard = '';
    }


    gameState.general.firstRound = false;
    
    var keepCurrentHandSoundEffect = new Audio("effects/keepCurrentHand.mp3");
    keepCurrentHandSoundEffect.play();

    gameState.users[0].turn = !gameState.users[0].turn;
    gameState.users[1].turn = !gameState.users[1].turn;
    disableUseButton();
    disableButtons();
    gameState.general.check++;
    sendGameStateToOpponent(gameState, opponent);
    endOfTurn();
};


//end of the turn
endOfTurn = async function() {

    if(gameState.general.check === 2) {
         gameState.general.roundOver = true;
         //check who wins
         if(countPoints(me.deck) !== countPoints(enemy.deck) ){
                middleUpLine.innerHTML = '';
                middleDownLine.innerHTML = '';
                if(countPoints(me.deck) === gameState.general.pointsToWin){
                    me.winnedRounds += me.pointsWhenWin;
                    gameState.general.winner = me.userID;

                    show_score(1);
                }
                if(countPoints(enemy.deck) === gameState.general.pointsToWin){
                    enemy.winnedRounds += enemy.pointsWhenWin;
                    gameState.general.winner += enemy.userID;

                    show_score(0);
                }
                if(countPoints(me.deck) > gameState.general.pointsToWin && countPoints(enemy.deck) < gameState.general.pointsToWin){
                    enemy.winnedRounds += enemy.pointsWhenWin;
                    gameState.general.winner = enemy.userID;

                    show_score(0);
                }
                if(countPoints(me.deck) < gameState.general.pointsToWin && countPoints(enemy.deck) > gameState.general.pointsToWin){
                    me.winnedRounds += me.pointsWhenWin;
                    gameState.general.winner = me.userID;

                    show_score(1);
                }
                if(countPoints(me.deck) < gameState.general.pointsToWin && countPoints(enemy.deck) < gameState.general.pointsToWin){
                    if(countPoints(me.deck) < countPoints(enemy.deck)){
                        enemy.winnedRounds += enemy.pointsWhenWin;
                        gameState.general.winner = enemy.userID;

                        show_score(0);
                    }
                    else{
                        me.winnedRounds += me.pointsWhenWin;
                        gameState.general.winner = me.userID;

                        show_score(1);
                    }
                }
                if(countPoints(me.deck) > gameState.general.pointsToWin && countPoints(enemy.deck) > gameState.general.pointsToWin){
                    gameState.general.winner = 'draw';

                    show_score(2);
                }

         }
         else{
            gameState.general.winner = 'draw';

            show_score(2);
         }
         checkIfTheGameIsOver();


         //get 2 special card
         if(gameState.general.winner === enemy.userID){
            show_score(0);
            addSpecialCard();
            addSpecialCard();
         }


        //winned rounds
        myWinnedRounds.innerHTML = me.winnedRounds;
        enemyWinnedRounds.innerHTML= enemy.winnedRounds;


        gameState.general.check = 0;
       
        showEnemyCard();
        set_color_enemyPointTable();
        changeEnemyPoints();
         gameState.general.oldEnemyDeck = me.deck; 

          //recreate the deck
          var newDeck = [];
          for(var i = 0; i < 11; i++) {
             newDeck[i] = i + 1;
         }
         gameState.users[0].deck = [];
         gameState.users[1].deck = [];
         

          //Random starting card for player one
          gameState.users[0].deck.push(randCard(newDeck));
          deleteCardFromDeck(newDeck, gameState.users[0].deck[0]);
          gameState.users[0].deck.push(randCard(newDeck));
          deleteCardFromDeck(newDeck, gameState.users[0].deck[1]);
 
          gameState.users[1].deck.push(randCard(newDeck));
          deleteCardFromDeck(newDeck, gameState.users[1].deck[0]);
          gameState.users[1].deck.push(randCard(newDeck));
          deleteCardFromDeck(newDeck, gameState.users[1].deck[1]);
                
         gameState.general.deck = newDeck;

         //Set the Points when win the round values back to 1
         gameState.users[0].pointsWhenWin = 1;
         gameState.users[1].pointsWhenWin = 1;

        
        sendGameStateToOpponent(gameState, opponent);
        await sleep(2300);
        sendGameStateToOpponent(gameState, socket.id);
        
        set_color_myPointTable();
    }
};


//disable Use Special CardButton when it's not your turn
disableUseButton = function(){
    $('.useSpecialCardButton').css({"color": "grey",
    "box-shadow": "inset 0px 34px 0px -15px #272423",
    "background-color": "#0c0a0a"
            });
    $('.useSpecialCardButton').prop('disabled', true);
}

//enable Use SPecial Card button when it s your turn
enableUseButton = function(){
    $('.useSpecialCardButton').css({"color": "white",
    "box-shadow": "inset 0px 34px 0px -15px #b54b3a",
    "background-color": "#a73f2d"
            });
    $('.useSpecialCardButton').prop('disabled', false);

}

//disable buttons
disableButtons = function() {
    enemyNameBar.style.background = 'rgb(0, 204, 0)';
    myNameBar.style.background = 'black';
    keepCurrentHand.disabled = true;
    drawNewCard.disabled = true;
    keepCurrentHand.classList.add('disableMiddleButton');
    drawNewCard.classList.add('disableMiddleButton');
    keepCurrentHand.classList.remove('middleHover');
    drawNewCard.classList.remove('middleHover');
}
//enable buttons
enableButtons = function() {
    enemyNameBar.style.background = 'black';
    myNameBar.style.background = 'rgb(0, 204, 0)';
    keepCurrentHand.disabled = false;
    drawNewCard.disabled = false;
    keepCurrentHand.classList.remove('disableMiddleButton');
    drawNewCard.classList.remove('disableMiddleButton');
    keepCurrentHand.classList.add('middleHover');
    drawNewCard.classList.add('middleHover');
}

//draw a card
drawNewCard.addEventListener('click', () => {

    countDownNumber.classList.remove('colorCountDown-number');
    clearInterval(interval);
    timerCounter = 60;


    if(gameState.users[0].userID === me.userID){
        gameState.users[0].activeSpecialCard = '';
    }
    else{
        gameState.users[1].activeSpecialCard = '';
    }

    gameState.general.firstRound = false;

    if(me.deck.length === 6){
        window.alert('You have 6 cards');
        return;
    }
    if(gameState.general.deck.length === 0){
        window.alert('Every card is on the table!');
        return;
    }
    var drawCardSoundEffect = new Audio("effects/drawACard.mp3");
    drawCardSoundEffect.play();
    gameState.general.check = 0;
    newCard = randCard(gameState.general.deck);
    for(var i = 0; i < gameState.general.deck.length; i++) {
        if(newCard === gameState.general.deck[i]) {
            gameState.general.deck.splice(i, 1);
        }
    }

    if(gameState.users[0].userID === me.userID) {
        gameState.users[0].deck.push(newCard);
    } else {
        gameState.users[1].deck.push(newCard);
    }
    myCards += `<div class="images">
                        <img src="images/${newCard}.jpg" alt="">
                    </div>`;
    downLine.innerHTML = myCards;

   
    showMyPoints();
    showEnemyPoints();

    //set 0 the value of check
    gameState.general.check = 0;

    //end of turn
    gameState.users[0].turn = !gameState.users[0].turn;
    gameState.users[1].turn = !gameState.users[1].turn;
    disableButtons();
    disableUseButton();
    sendGameStateToOpponent(gameState, opponent);
    set_color_myPointTable();

});

 //count points
 showMyPoints = function() {
    myPoints.innerHTML = `Your Points:
    <p style="margin: 0px"> ${countPoints(me.deck)} / ${gameState.general.pointsToWin}</p>`
}

showEnemyPoints = function(){
    enemyPoints.innerHTML = `Enemy Points:
    <p style="margin: 0px"> ${countPoints(enemy.deck) - enemy.deck[0]} + ? / ${gameState.general.pointsToWin}</p>`
}

var score = document.querySelector('.score');
var scoreText = document.querySelector('.score-text');

async function show_score(yourPosition){
    


    if((me.winnedRounds === gameState.general.gameEndingPoints) || (enemy.winnedRounds === gameState.general.gameEndingPoints))
    {

    }
    else{
    

    //you won the round
    if(yourPosition === 1){
        scoreText.classList.add('victory');
        scoreText.innerHTML = 'You won!';
        var victorySoundEffect = new Audio("effects/victory.mp3");
        victorySoundEffect.play();
    }
    //you lost the round
    if(yourPosition === 0){
        scoreText.classList.add('defeat');
        scoreText.innerHTML = 'Defeat!';
        var victorySoundEffect = new Audio("effects/defeat.mp3");
        victorySoundEffect.play();
    }
    //the round is draw
    if(yourPosition === 2){
        scoreText.classList.add('draw')
        scoreText.innerHTML = 'Draw!';
        var victorySoundEffect = new Audio("effects/draw.mp3");
        victorySoundEffect.play();
    }

    //the game is over
    if(yourPosition == 3){
        scoreText.classList.add('gameOver');
        scoreText.innerHTML = 'Game Over';
        score.classList.add('showItem');
        await sleep(2500);
        scoreText.innerHTML = gameState.general.winnerOfGame + ' Has Won';
        await sleep(2700);
        score.classList.remove('showItem');
        location.reload();
    }
    else{

        score.classList.add('showItem');
        await sleep(2000);
        score.classList.remove('showItem');

        if(yourPosition === 1){
            scoreText.classList.remove('victory');
        }
        if(yourPosition === 0){
            scoreText.classList.remove('defeat');
        }
        if(yourPosition === 2){
            scoreText.classList.remove('draw')
        }
        if(yourPosition === 3 || yourPosition === 4){
            scoreText.classList.remove('gameOver')
        }

        gameState.users[1].specialCardsUsedInARound = 0;
        gameState.users[0].specialCardsUsedInARound = 0;

        gameState.general.pointsToWin = 21;
        
    }
}

};

 //sleep function
const sleep = (miliseconds) => {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
}


/* View in fullscreen */
function fullscreen() {
    var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null);
    var docElm = document.documentElement;
    if (!isInFullScreen) {
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

//full screen
fullScreenButton.addEventListener('click', () => {
    fullscreen();
    //change fullscreen button icon: maximize or minimize
    if(fullScreenButton.getAttribute("src") === "images/maximize.png") {
        
        fullScreenButton.src = "images/minimize.png";
    } else {
        fullScreenButton.src = "images/maximize.png";
    }
});

//set username
userNameInputButton.addEventListener('click', function() {

    if(userNameInput.value !== ''){
        userNameInput.style.display = "none";
        userNameInputButton.style.display = "none";
        setUserName.innerHTML = `<p style="color:white"><i class="fa fa-user" aria-hidden="true"></i> ${userNameInput.value}</p>`;
        output.classList.remove("hideUsersList");
        socket.emit('setUserName', {
            userID: socket.id,
            name: userNameInput.value.trim()
        });
}
else{
    userNameInput.classList.add('red');

}
});