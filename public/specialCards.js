scrollArea = document.querySelector('.scrollArea');
middleDownLine = document.querySelector('.middleDownLine');
useSpecialCard = document.querySelector('.useSpecialCardButton');

var idCounter = 0;
var specialDeck = [
    'x_bleeding',
    'destroy',
    'dropenemycard',
    'dropyourcard',
    'exchange',
    'loveyourenemy',
    'perfectdraw',
    'x_shield',
    'spec1',
    'spec2',
    'spec3',
    'spec4',
    'spec5',
    'spec6',
    'spec7',
    'spec8',
    'spec9',
    'spec10',
    'spec11',
    'x_twoup',
    'x_upto17',
    'x_upto24',
    'x_upto27'
];

//create your first 3 Special Cards
var mySpecialCards = [];
mySpecialCards.push(randCard(specialDeck));
mySpecialCards.push(randCard(specialDeck));
mySpecialCards.push(randCard(specialDeck));
mySpecialCards.push(randCard(specialDeck));
mySpecialCards.push(randCard(specialDeck));
mySpecialCards.push('loveyourenemy');
mySpecialCards.push('x_bleeding',
'destroy',
'dropenemycard',
'dropyourcard',
'exchange',
'loveyourenemy',
'perfectdraw',
'x_shield',
'spec1',
'spec2',
'spec3',
'spec4',
'spec5',
'spec6',
'spec7',
'spec8',
'spec9',
'spec10',
'spec11',
'x_twoup',
'x_upto17',
'x_upto24',
'x_upto27');




//take your Special Cards to scroll down menu
showSpecialCards = function(){
    scrollArea.innerHTML = '';
    selectedSpecialCard = '';
    selectedSpecialCardID = '';

    for(var i = 0; i<mySpecialCards.length; ++i){for(var i = 0; i<mySpecialCards.length; ++i){
        specialCardIcon = document.createElement('img');
        idIndex = mySpecialCards[i].search('id_');

        if(idIndex !== -1){
             mySpecialCards[i] = mySpecialCards[i].slice(0, idIndex);
            
        }
        selectedSpecialCardId = mySpecialCards[i];
        specialCardIcon.src = `images/${mySpecialCards[i]}.png`;
        specialCardIcon.id = `${mySpecialCards[i]}id_${idCounter++}`;
        mySpecialCards[i] = specialCardIcon.id;
        specialCardIcon.className = "specCardOnDropDown";

        specialCardIcon.addEventListener('click', function() {
            
            setAllSpecialCardsToWhite();
            this.classList.toggle('greenBackGroundOnSpecialCard');
            selectedSpecialCard = this;

            //save the selected card
            idIndex = this.id.search('id_');            
            selectedSpecialCardID = this.id.slice(0, idIndex);
                      
        });
        scrollArea.appendChild(specialCardIcon);
    }

    //set all Special Cards to white
    setAllSpecialCardsToWhite = function(){
        selectedSpecialCard = '';      
        for(var i = 0; i<scrollArea.childNodes.length; ++i){
            scrollArea.childNodes[i].classList.remove('greenBackGroundOnSpecialCard');

        }
    }    
}

//send my special card board to enemy
useSpecialCard.addEventListener('click', async function() {
    var helper = 'noMoreCards';
    gameState.general.check = 0;
    if(selectedSpecialCard !== ''){

        //check which user I am
        if(gameState.users[0].userID === me.userID){
            //check how many special card I used in a turn
            if(gameState.users[0].specialCardsUsedInARound !== 8){
                gameState.general.firstRound = true;
                gameState.users[0].activeSpecialCard = selectedSpecialCardID;
                sendGameStateToOpponent(gameState, gameState.users[1].userID);
                helper = 'useMoreCard';
            }

        }
        else{
            //check how many special card I used in a turn
            if(gameState.users[1].specialCardsUsedInARound !== 8){
                gameState.general.firstRound = true;
                gameState.users[1].activeSpecialCard = selectedSpecialCardID;
                sendGameStateToOpponent(gameState, gameState.users[0].userID);
                helper = 'useMoreCard';
            }

        }

        if(selectedSpecialCard.id.slice(0,1) !== 'x'){
            helper = 'useMoreCard';
        }

        if(helper === 'useMoreCard'){

            specialCardOnTable = document.createElement('img');
            specialCardOnTable.src = selectedSpecialCard.src;
            specialCardOnTable.className = "specCard";
            specialCardOnTable.id = selectedSpecialCard.id;
            middleDownLine.appendChild(specialCardOnTable);
            

            $(`#${specialCardOnTable.id}`).hide();
            disableUseButton();
            var cardName = selectedSpecialCard.id.slice(0, selectedSpecialCard.id.search("id_"));
            $(`#${specialCardOnTable.id}`).fadeIn(1500, "linear", function() {

                // Special Card name to execute its function
                
                if(cardName.search('spec') !== -1){
                    specialCardFunctions['spec'](parseInt(cardName.replace('spec',''),10))
                }
                else{
                        specialCardFunctions[cardName]();
                }
                showSpecialCards();

                $(`#${specialCardOnTable.id}`).css({"border-color": "greenyellow", 
                "border-width":"5px", 
                "border-style":"solid"});
            });
        
            removeSpecialCard(selectedSpecialCard);

            if(specialCardOnTable.id.slice(0,1) !== 'x'){
                
                //give destroy a special sound effect
                if(cardName === 'destroy'){
                    var appearSoundEffect = new Audio("effects/destroy.mp3");
                    appearSoundEffect.play();
                }
                else{
                    var appearSoundEffect = new Audio("effects/appear.mp3");
                    appearSoundEffect.play();
                }

                $(`#${specialCardOnTable.id}`).fadeOut(1500, function() {
                    enableUseButton();
                    // middleDownLine.removeChild(specialCardOnTable);

                });
                    
                if(gameState.users[0].userID === me.userID){
                    gameState.general.firstRound = true;
                    gameState.users[0].activeSpecialCard = '';
                    sendGameStateToOpponent(gameState, gameState.users[1].userID);                  
                }
                else{
                    gameState.general.firstRound = true;
                    gameState.users[1].activeSpecialCard = '';
                    sendGameStateToOpponent(gameState, gameState.users[0].userID);  
                }
            }
            else{
                if(gameState.users[0].userID === me.userID){
                    gameState.users[0].specialCardsUsedInARound += 1;
                    gameState.users[0].activeSpecialCard = '';
                    sendGameStateToOpponent(gameState, gameState.users[1].userID);
                }
                else{
                    gameState.users[1].specialCardsUsedInARound += 1;
                    gameState.users[1].activeSpecialCard = '';
                    sendGameStateToOpponent(gameState, gameState.users[0].userID);
                }
                var appearSoundEffect = new Audio("effects/appear.mp3");
                appearSoundEffect.play();
                await sleep(1500);
                enableUseButton();
            }

            selectedSpecialCard = '';
        }
        else{
            console.log('You can t use more active special card!');
        }
    }
});

//Add a random card to your Special Card deck
addSpecialCard = function(){
    mySpecialCards.push(randCard(specialDeck));
}

//remova a card from your Special Card deck
removeSpecialCard = function(card){ 
    for(var i = 0; i<mySpecialCards.length; ++i){
        if(card.id == mySpecialCards[i]){
            mySpecialCards.splice(i, 1);
        }
    }
    showSpecialCards();
}
}
//DIsable use special card button 
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

//The functions of the Special Cards
var specialCardFunctions = {
    spec : function(cardToDraw) {
        //draw a card
         for(var i = 0; i < gameState.general.deck.length; i++) {
             if(gameState.general.deck[i] == cardToDraw) {
                //display card
                myCards += `<div class="images">
                         <img src="images/${cardToDraw}.jpg" alt="">
                     </div>`;
                downLine.innerHTML = myCards;

                //delete card from general deck
                deleteCardFromDeck(gameState.general.deck, cardToDraw);

                //add card to my deck
                if(gameState.users[0].userID === me.userID){
                    gameState.users[0].deck.push(cardToDraw)
                    sendGameStateToOpponent(gameState, gameState.users[1].userID);                    
                }
                else{
                    gameState.users[1].deck.push(cardToDraw)
                    sendGameStateToOpponent(gameState, gameState.users[0].userID);
                }
                showMyPoints();
                set_color_myPointTable();

            }
            
            //remove card from deck  
            else {
                    console.log('nincs benne a pakliban');
                }
        }
    },
    x_bleeding : function(){

        //give me 3 random Special Card
        mySpecialCards.push(randCard(specialDeck));
        mySpecialCards.push(randCard(specialDeck));
        mySpecialCards.push(randCard(specialDeck));

        //check wich user it's me and increment enemy points when win with 2
        if(gameState.users[0].userID === me.userID){
            gameState.users[1].pointsWhenWin += 2;
            gameState.users[0].activeSpecialCard = '';
            sendGameStateToOpponent(gameState, gameState.users[1].userID)
        }
        else{
            gameState.users[0].pointsWhenWin += 2;
            gameState.users[1].activeSpecialCard = '';
            sendGameStateToOpponent(gameState, gameState.users[0].userID)
        }

    },
    x_shield : function(){

        //give me 1 random Special Card
        mySpecialCards.push(randCard(specialDeck));
        //check wich user it's me and change enemy points when win to 0
        if(gameState.users[0].userID === me.userID){
            gameState.users[1].pointsWhenWin = 0;
            gameState.users[0].activeSpecialCard = '';
            sendGameStateToOpponent(gameState, gameState.users[1].userID)
        }
        else{
            gameState.users[0].pointsWhenWin = 0;
            gameState.users[1].activeSpecialCard = '';
            sendGameStateToOpponent(gameState, gameState.users[0].userID)
        }

    },
    x_upto17 : function(){
        //check wich user it's me and change enemy points when win to 0
        if(gameState.users[0].userID === me.userID){
            gameState.general.pointsToWin = 17;
            gameState.users[0].activeSpecialCard = '';
            set_color_myPointTable();
            showMyPoints();
            showEnemyPoints();
            sendGameStateToOpponent(gameState, gameState.users[1].userID);
            showEnemyPoints();
        }
        else{
            gameState.general.pointsToWin = 17;
            gameState.users[1].activeSpecialCard = '';
            set_color_myPointTable();
            showEnemyPoints();
            showMyPoints();
            sendGameStateToOpponent(gameState, gameState.users[0].userID);
            showEnemyPoints();
        }

    },
    x_upto24 : function(){
        //check wich user it's me and change enemy points when win to 0
        if(gameState.users[0].userID === me.userID){
            gameState.general.pointsToWin = 24;
            gameState.users[0].activeSpecialCard = '';
            set_color_myPointTable();
            showMyPoints();
            showEnemyPoints();
            sendGameStateToOpponent(gameState, gameState.users[1].userID);
            showMyPoints();
        }
        else{
            gameState.general.pointsToWin = 24;
            gameState.users[1].activeSpecialCard = '';
            set_color_myPointTable();
            showEnemyPoints();
            showMyPoints();
            sendGameStateToOpponent(gameState, gameState.users[0].userID);
            showMyPoints();
        }

    },
    x_upto27 : function(){
        //check wich user it's me and change enemy points when win to 0
        if(gameState.users[0].userID === me.userID){
            gameState.general.pointsToWin = 27;
            gameState.users[0].activeSpecialCard = '';
            set_color_myPointTable();
            showMyPoints();
            showEnemyPoints();
            sendGameStateToOpponent(gameState, gameState.users[1].userID);
            showMyPoints();

        }
        else{
            gameState.general.pointsToWin = 27;
            gameState.users[1].activeSpecialCard = '';
            set_color_myPointTable();
            showEnemyPoints();
            showMyPoints();
            sendGameStateToOpponent(gameState, gameState.users[0].userID);
            showMyPoints();

        }

    },
    destroy : function(){

        gameState.general.destroyUsed = true;
        if(gameState.users[0].userID === me.userID){
            middleDownLine.innerHTML = '';
            middleUpLine.innerHTML = '';
            gameState.users[0].activeSpecialCard = '';
            gameState.general.pointsToWin = 21;
            gameState.users[1].pointsWhenWin = 1;
            showEnemyPoints();
            showMyPoints();
            set_color_myPointTable();
            sendGameStateToOpponent(gameState, gameState.users[1].userID);
            showMyPoints();

        }
        else{
            middleDownLine.innerHTML = '';
            middleUpLine.innerHTML = '';
            gameState.users[1].activeSpecialCard = '';
            gameState.general.pointsToWin = 21;
            gameState.users[0].pointsWhenWin = 1;
            showEnemyPoints();
            showMyPoints();
            set_color_myPointTable();
            sendGameStateToOpponent(gameState, gameState.users[0].userID);
            showMyPoints();

        }

    },
    x_twoup: function(){
        //give me 1 random Special Card
        mySpecialCards.push(randCard(specialDeck));
        mySpecialCards.push(randCard(specialDeck));

        //check wich user it's me and increment my points when win with 2
        if(gameState.users[0].userID === me.userID){
            gameState.users[0].pointsWhenWin += 2;
            gameState.users[0].activeSpecialCard = '';
            sendGameStateToOpponent(gameState, gameState.users[1].userID)
        }
        else{
            gameState.users[1].pointsWhenWin += 2;
            gameState.users[1].activeSpecialCard = '';
            sendGameStateToOpponent(gameState, gameState.users[0].userID)
        }

    },
    dropenemycard: function() {
        if(gameState.users[0].userID === me.userID){
            if(gameState.users[1].deck.length > 1) {
                gameState.general.deck.push(gameState.users[1].deck.pop());
                showEnemyPoints();
                sendGameStateToOpponent(gameState, gameState.users[1].userID);
                upLine.removeChild(upLine.firstChild);                

            } else {
                console.log('csak egy lap van');
            }
        }
        else{
            if(gameState.users[0].deck.length > 1) {
                gameState.general.deck.push(gameState.users[0].deck.pop());
                showEnemyPoints();
                sendGameStateToOpponent(gameState, gameState.users[0].userID);
                upLine.removeChild(upLine.firstChild);

            } else {
                console.log('csak egy lap van');
            }
        }
        
    },
    dropyourcard: function() {
        if(gameState.users[0].userID === me.userID){
            if(gameState.users[0].deck.length > 1) {
                gameState.general.deck.push(gameState.users[0].deck.pop());
                showMyPoints();
                showMyCards();
                sendGameStateToOpponent(gameState, gameState.users[1].userID);
            } else {
                console.log('csak egy lap van');
            }
        }
        else{
            if(gameState.users[1].deck.length > 1) {
                gameState.general.deck.push(gameState.users[1].deck.pop());
                showMyPoints();
                showMyCards();
                sendGameStateToOpponent(gameState, gameState.users[0].userID);
            } else {
                console.log('csak egy lap van');
            }
        }
    },
    exchange: function() {
        if(gameState.users[0].deck.length === 1 || gameState.users[1].deck.length === 1){
            console.log('1 lap eseteben nem cserelhetsz!');
        }
        else{
            card1 = gameState.users[0].deck.pop();
            card2 = gameState.users[1].deck.pop();
            gameState.users[0].deck.push(card2);
            gameState.users[1].deck.push(card1);
            sendGameStateToOpponent(gameState, gameState.users[0].userID);
            sendGameStateToOpponent(gameState, gameState.users[1].userID);
        }
    },
    loveyourenemy : function() {
        pointsToWin = gameState.general.pointsToWin;
        getCard = false;
        
        if(gameState.users[0].userID === me.userID && gameState.users[1].deck.length < 6){
            enemyPoints = countPoints(gameState.users[1].deck);
            necessaryPointsOfEnemy = pointsToWin - enemyPoints;
            if(necessaryPointsOfEnemy > 11) {
                necessaryPointsOfEnemy = 11;
            }

            if(necessaryPointsOfEnemy > 0){
                for(var i = necessaryPointsOfEnemy; i > 0; i--) {
                    for(var j = 0; j < gameState.general.deck.length; j++) {
                        if(i === gameState.general.deck[j]) {
                            gameState.users[1].deck.push(i);
                            deleteCardFromDeck(gameState.general.deck, i);
                            j = gameState.general.deck.length;
                            i = 0;
                            getCard = true;
                        }
                    }
                }
                if(!getCard) {
                    for(var i = necessaryPointsOfEnemy; i <= 11; i++) {
                        for(var j = 0; j < gameState.general.deck.length; j++) {
                            if(i === gameState.general.deck[j]) {
                                gameState.users[1].deck.push(i);
                                j = gameState.general.deck.length;
                                deleteCardFromDeck(gameState.general.deck, i);
                                i = 11;
                                getCard = true;
                            }
                        }
                    }
                }
                
            } else {
                for(var i = 1; i <= 11; i++) {
                    for(var j = 0; j < gameState.general.deck.length; j++) {
                        if(i === gameState.general.deck[j]) {
                            deleteCardFromDeck(gameState.general.deck, i);
                            j = gameState.general.deck.length;
                            gameState.users[1].deck.push(i);
                            i = 11;
                        }
                    }
                }

            }
        } else if(gameState.users[0].userID !== me.userID && gameState.users[0].deck.length < 6) {
            enemyPoints = countPoints(gameState.users[0].deck);
            necessaryPointsOfEnemy = pointsToWin - enemyPoints;

            if(necessaryPointsOfEnemy > 0){
                for(var i = necessaryPointsOfEnemy; i > 0; i--) {
                    for(var j = 0; j < gameState.general.deck.length; j++) {
                        if(i === gameState.general.deck[j]) {
                            gameState.users[0].deck.push(i);
                            deleteCardFromDeck(gameState.general.deck, i);
                            j = gameState.general.deck.length;
                            i = 0;
                            getCard = true;
                        }
                    }
                }
                if(!getCard) {
                    for(var i = necessaryPointsOfEnemy; i <= 11; i++) {
                        for(var j = 0; j < gameState.general.deck.length; j++) {
                            if(i === gameState.general.deck[j]) {
                                gameState.users[0].deck.push(i);
                                j = gameState.general.deck.length;
                                deleteCardFromDeck(gameState.general.deck, i);
                                i = 11;
                                getCard = true;
                            }
                        }
                    }
                }
            } else {
                for(var i = 1; i <= 11; i++) {
                    for(var j = 0; j < gameState.general.deck.length; j++) {
                        if(i === gameState.general.deck[j]) {
                            deleteCardFromDeck(gameState.general.deck, i);
                            j = gameState.general.deck.length;
                            gameState.users[0].deck.push(i);
                            i = 11;
                        }
                    }
                }
            }
        }
        set_color_myPointTable();
        showEnemyPoints();
        showMyPoints();
        sendGameStateToOpponent(gameState, gameState.users[1].userID);
        sendGameStateToOpponent(gameState, gameState.users[0].userID);
    },
    perfectdraw: function() {
        pointsToWin = gameState.general.pointsToWin;
        getCard = false;
        mySpecialCards.push(randCard(specialDeck));
        
        if(gameState.users[1].userID === me.userID && gameState.users[0].deck.length < 6){
            enemyPoints = countPoints(gameState.users[1].deck);
            necessaryPointsOfEnemy = pointsToWin - enemyPoints;
            if(necessaryPointsOfEnemy > 11) {
                necessaryPointsOfEnemy = 11;
            }

            if(necessaryPointsOfEnemy > 0){
                for(var i = necessaryPointsOfEnemy; i > 0; i--) {
                    for(var j = 0; j < gameState.general.deck.length; j++) {
                        if(i === gameState.general.deck[j]) {
                            gameState.users[1].deck.push(i);
                            deleteCardFromDeck(gameState.general.deck, i);
                            j = gameState.general.deck.length;
                            i = 0;
                            getCard = true;
                        }
                    }
                }
                if(!getCard) {
                    for(var i = necessaryPointsOfEnemy; i <= 11; i++) {
                        for(var j = 0; j < gameState.general.deck.length; j++) {
                            if(i === gameState.general.deck[j]) {
                                gameState.users[1].deck.push(i);
                                j = gameState.general.deck.length;
                                deleteCardFromDeck(gameState.general.deck, i);
                                i = 11;
                                getCard = true;
                            }
                        }
                    }
                }
                
            } else {
                for(var i = 1; i <= 11; i++) {
                    for(var j = 0; j < gameState.general.deck.length; j++) {
                        if(i === gameState.general.deck[j]) {
                            deleteCardFromDeck(gameState.general.deck, i);
                            j = gameState.general.deck.length;
                            gameState.users[1].deck.push(i);
                            i = 11;
                        }
                    }
                }

            }
        } else if(gameState.users[1].userID !== me.userID && gameState.users[1].deck.length < 6) {
            enemyPoints = countPoints(gameState.users[0].deck);
            necessaryPointsOfEnemy = pointsToWin - enemyPoints;

            if(necessaryPointsOfEnemy > 0){
                for(var i = necessaryPointsOfEnemy; i > 0; i--) {
                    for(var j = 0; j < gameState.general.deck.length; j++) {
                        if(i === gameState.general.deck[j]) {
                            gameState.users[0].deck.push(i);
                            deleteCardFromDeck(gameState.general.deck, i);
                            j = gameState.general.deck.length;
                            i = 0;
                            getCard = true;
                        }
                    }
                }
                if(!getCard) {
                    for(var i = necessaryPointsOfEnemy; i <= 11; i++) {
                        for(var j = 0; j < gameState.general.deck.length; j++) {
                            if(i === gameState.general.deck[j]) {
                                gameState.users[0].deck.push(i);
                                j = gameState.general.deck.length;
                                deleteCardFromDeck(gameState.general.deck, i);
                                i = 11;
                                getCard = true;
                            }
                        }
                    }
                }
            } else {
                for(var i = 1; i <= 11; i++) {
                    for(var j = 0; j < gameState.general.deck.length; j++) {
                        if(i === gameState.general.deck[j]) {
                            deleteCardFromDeck(gameState.general.deck, i);
                            j = gameState.general.deck.length;
                            gameState.users[0].deck.push(i);
                            i = 11;
                        }
                    }
                }
            }
        }
            set_color_myPointTable();

            showEnemyPoints();
            showMyPoints();
            sendGameStateToOpponent(gameState, gameState.users[1].userID);
            sendGameStateToOpponent(gameState, gameState.users[0].userID);

        }
}

