helpIcon = document.querySelector('.helpIcon');
enemyName = document.querySelector('#enemyName');
enemyNameRedTable = document.querySelector('#enemyName_redTable');
myName = document.querySelector('#myName');
myNameRedTable = document.querySelector('#myName_redTable');
surrButton = document.querySelector('.surrButton');
upLine = document.querySelector('.upLine'); 
downLine = document.querySelector('.downLine'); 
myPoints = document.querySelector('.myPoints');
enemyPoints = document.querySelector('.enemyPoints');
enemyWinnedRounds =  document.querySelector('#enemy-winned-rounds');
myWinnedRounds =  document.querySelector('#my-winned-rounds');
backOfTheEnemyCard = document.querySelector('#back');


//draw a card
randCard = function(deck) {
    length = deck.length;
    card = deck[Math.floor(Math.random() * length)];
    deleteCardFromDeck(card);
    return card;
}


function show_hide(){
    setAllSpecialCardsToWhite();
    var click1 = document.getElementById("drop-content");
    var click2 = document.getElementById("use-button");
    if(click1.style.display === "none"){
        click1.style.display = "block";
    }
    else{
        click1.style.display = "none";
    }
    if(click2.style.display === "none"){
        click2.style.display = "block";
    }
    else{
        click2.style.display = "none";
    }
}
