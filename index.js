var express = require('express');
var socket = require('socket.io');
deck = [];
myDeck = [];
enemyDeck = [];
for(var i = 0; i < 11; i++) {
    deck[i] = i + 1;
}

//App setup
var app = express();
var server = app.listen(4000, '0.0.0.0', function(){
    console.log('listening to request on port 4000');
});

//Static files
app.use(express.static('public'));

//Socket setup
var io = socket(server);

var users = {};
var userNr = 0;

//add new user to users{}
pushUser = function(userID) {
    users[userID] = [`user${userNr++}`, true];
}

//check if user is exist
userExist = function(userID) {
    for(var user in users) {
        if(users[user] === userID) {
            return true;
        }
    }
    return false;
}

//remove user from users{}
removeUser = function(userID) {
    delete users[userID];
}


io.on('connection', function(socket){
    console.log('made socket connection', socket.id);

    //add user to list, generating a name
    pushUser(socket.id);

    //send a list with available users
    sendUserList = function() {
        io.sockets.emit('users', JSON.stringify(users));
    }

    sendUserList(users);

    //user leaving
    socket.on('disconnect', function () {
        console.log("user disconnected", socket.id);

        //send game over if disconnected user was in a game
        // if(!users[socket.id][1]){
        //     console.log("GAMEEEEEEEEEEEEEEEEEE");
        // }
        removeUser(socket.id);
        sendUserList();
    });

    //set username
    socket.on('setUserName', function(data) {
        console.log(data);
        users[data.userID] = [data.name, true];
        sendUserList();
    });

    //new game request to selected player
    socket.on('select-player', function(data){
        io.to(data.userTo).emit('new-game-request', {
            userFrom:[data.userFrom, users[data.userFrom]],
            userTo:[data.userTo, users[data.userTo]],
        });
    });

    //start game
    socket.on('start-game', function(data){
        console.log('starting game: ', data.userFrom[1] + ' ' + data.userTo[1]);
        myDeck = [];
        enemyDeck = [];
        deckT = Array.from(deck);
        
        myDeck.push(randCard(deckT));
        deleteCardFromDeck(deckT, myDeck[0]);
        myDeck.push(randCard(deckT));
        deleteCardFromDeck(deckT, myDeck[1]);
        console.log(deckT);
        

        enemyDeck.push(randCard(deckT));
        deleteCardFromDeck(deckT, enemyDeck[0]);
        enemyDeck.push(randCard(deckT));
        deleteCardFromDeck(deckT, enemyDeck[1]);
        const randTurn = Boolean(Math.round(Math.random()));

        gameState = {
            users: [{
                userID: data.userFrom[0],
                name: data.userFrom[1][0],
                deck: myDeck,
                inGame: true,
                turn: randTurn,
                winnedRounds: 0,
                activeSpecialCard: '',
                pointsWhenWin: 1,
                specialCardsUsedInARound: 0,
                clickedOnMiddleButton: false
            },
            {
                userID: data.userTo[0],
                name: data.userTo[1][0],
                deck: enemyDeck,
                inGame: true,
                turn: !randTurn,
                winnedRounds: 0,
                activeSpecialCard: '',
                pointsWhenWin: 1,
                specialCardsUsedInARound: 0,
                clickedOnMiddleButton: false

            }],
            general:{
                deck: deckT,
                gameOver: false,
                sendTo: '',
                check: 0,
                pointsToWin: 21,
                roundOver: false,
                firstRound: true,
                winner: '',
                oldEnemyDeck: '',
                destroyUsed: false,
                startTimer: true,
                gameEndingPoints: 20,
                winnerOfGame: '',
                sendedTheEndingScreen: true
            }
        }
        
        users[data.userFrom[0]][1] = false;
        users[data.userTo[0]][1] = false;


        sendUserList();
        
        sendGameStateToUser(gameState, data.userFrom[0]);
        sendGameStateToUser(gameState, data.userTo[0]);
    });



    //send game state to opponent
    socket.on('gameStateToOpponent', function(gameState){
        if(send = gameState.general.sendTo) {
            if(gameState.general.gameOver) {
                users[gameState.users[0].userID][1] = true;
                users[gameState.users[1].userID][1] = true;
                sendUserList();
            }
            gameState.general.sendTo = '';
            console.log(gameState);
            
            sendGameStateToUser(gameState, send);
        }
    });


});

//draw a card
randCard = function(deck) {
    length = deck.length;
    card = deck[Math.floor(Math.random() * length)];
    return card;
}
//delete card from deck
deleteCardFromDeck = function(deck, card) {
    index = deck.indexOf(card);
    deck.splice(index, 1);
}

//send game state to user
sendGameStateToUser = function(gameState, user) {
    io.to(user).emit('gameStateFromServer', gameState);
}





