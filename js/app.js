/*
 * Create a list that holds all of your cards
 */


/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

// Shuffle function from http://stackoverflow.com/a/2450976
/*
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
*/

/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */

"use strict";

//top of page score panel when game starts
const ScorePanel = {
    move : 0,
    time : 0,
    star : 3,
    incrementTime : () => {
        ScorePanel.time += 1;
        viewChanger.setTime(ScorePanel.time);
    },
    incrementMove : () => {
        ScorePanel.move += 1;
        viewChanger.setMoves(ScorePanel.move);

        if (ScorePanel.move === 30) {
            ScorePanel.star = 2;
            viewChanger.setStars(2);
        } else if (ScorePanel.move === 40) {
            ScorePanel.star = 1;
            viewChanger.setStars(1);
        } else {
            // stars don't change
        }
    },
    reset : () => {
        ScorePanel.move = 0;
        ScorePanel.star = 3;
        ScorePanel.time = 0;
        viewChanger.setMoves(0);
        viewChanger.setStars(3);
        viewChanger.setTime(0);
    }
}
Object.seal(ScorePanel);


//global varable
let Timer;


// symbol for each card (list)
const Symbol = {
    ANCHOR : 'fa fa-anchor',
    BICYCLE : 'fa fa-bicycle',
    BOLT : 'fa fa-bolt',
    BOMB : 'fa fa-bomb',
    CUBE : 'fa fa-cube',
    DIAMOND : 'fa fa-diamond',
    LEAF : 'fa fa-leaf',
    PLANE : 'fa fa-paper-plane-o',
}
// stop card from changing symbols
Object.freeze(Symbol);

// position for each card
const Position = {
    CLOSED : 'card',
    OPENED : 'card open show',
    MATCHED : 'card open match',
}
// stop card from changing positions
Object.freeze(Position);


const Deck = {
    cards : [Symbol.ANCHOR, Symbol.ANCHOR, Symbol.BICYCLE, Symbol.BICYCLE, Symbol.BOLT, Symbol.BOLT, Symbol.BOMB, Symbol.BOMB, Symbol.CUBE, Symbol.CUBE, Symbol.DIAMOND, Symbol.DIAMOND, Symbol.LEAF, Symbol.LEAF, Symbol.PLANE, Symbol.PLANE],
    opened : [],
    matched : [],
    shuffle : (array) => {
        // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
        for (let i = array.length - 1; i > 0; --i) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        viewChanger.setCardsSymbols(array);
    },
    reset : () => {
        console.log(`In Deck.reset() : `);
        Deck.opened.length = 0;
        Deck.matched.length = 0;
        for (let i = 0; i < Deck.cards.length; i++) {
            viewChanger.closeCard(i);
        }
        Deck.shuffle(Deck.cards);
    },
    tryOpeningCard : ({index, symbol}) => {
        console.log(`In Deck.tryOpeningCard(${index}, ${symbol})`);
        Deck.opened.push({index,symbol})
        viewChanger.openCard(index);

        if (Deck.opened.length === 2) { window.setTimeout(Deck.checkMatch, 200); }

    },
    checkMatch : () => {
        console.log(`In Deck.checkMatch() : `);
        const c0 = Deck.opened[0];
        const c1 = Deck.opened[1];

        if (c0.symbol !== c1.symbol ) {
            viewChanger.closeCard(c0.index);
            viewChanger.closeCard(c1.index);
            Deck.opened.length = 0;
        } else {
            viewChanger.matchCard(c0.index);
            viewChanger.matchCard(c1.index);
            Deck.matched.push(c0, c1);
            Deck.opened.length = 0;
        }

        if (Deck.matched.length === Deck.cards.length) {
            // grand champ
            console.log("Grand Champ!");
            clearInterval(Timer);
            viewChanger.hideStartButton(false);
        }
    },
}

Object.freeze(Deck);

Object.seal(Deck.cards)

//viewchanger class contains changes in DOM

class viewChanger {
    static setStars(numStars) {
        console.log(`class viewChanger setStars(${numStars}) : changes number of stars in View`);
        const d = document.getElementsByClassName("stars")[0];
        const starHTML = '<li><i class="fa fa-star"></i></li>';
        d.innerHTML = starHTML.repeat(numStars);
    }

    static setMoves(numMoves) {
        console.log(`class viewChanger setMoves(${numMoves}) : changes number of moves in View`);
        const d = document.getElementsByClassName("moves")[0];
        d.innerHTML = numMoves;
    }
    static setTime(seconds) {
        console.log(`class viewChanger setTime(${seconds}) : changes timer in View`);
        const d = document.getElementsByClassName("timer")[0];
        d.innerHTML = seconds;
    }

    static openCard(cardIndex) {
        console.log(`class viewChanger openCard(${cardIndex}) : opens up a card in deck`);
        const d = document.getElementsByClassName("card");
        d[cardIndex].setAttribute("class", Position.OPENED);
    }

    static closeCard(cardIndex) {
        console.log(`class viewChanger closeCard(${cardIndex}) : closes a card in deck`);
        const d = document.getElementsByClassName("card");
        d[cardIndex].setAttribute("class", Position.CLOSED);
    }

    static matchCard(cardIndex) {
        console.log(`class viewChanger matchCard(${cardIndex}) : changes a card in a match position`);
        const d = document.getElementsByClassName("card");
        d[cardIndex].setAttribute("class", Position.MATCHED);
    }

    static setCardsSymbols(cards) {
        console.log(`class viewChanger setCardsSymbols(${cards}) : set cards symbols`);
        const d = document.getElementsByClassName("card");
        for (let i = 0; i < cards.length; i++) {
            d[i].firstChild.setAttribute("class", cards[i]);
        }
    }

//start of game
    static hideStartButton(bool) {
        const d = document.getElementsByClassName("modal")[0];
        if (bool === true) {
            d.innerHTML = `Ready to Play? <br><br>
            3 stars &lt; 30 moves <br>
            2 stars &lt; 40 moves <br>
            1 star  &ge; 40 moves<br><br>
            Click to Play`;
            d.className = "modal hide";
        } else {
//end of game
            d.innerHTML = `Congratulations! <br><br> Time: ${ScorePanel.time} <br> Star Rating: ${ScorePanel.star} <br> Moves: ${ScorePanel.move}  <br><br> Click and Try Again;)`;
            d.className = "modal show";
        }
    }
}

//methods attached to eventListener

class EventListener {
    static setClickStart() {
        console.log("class EventListener setClickStart() : setup click eventListener for start button...");
        console.log("[Listening...] start button ");
        const d = document.getElementsByClassName('modal')[0];
        d.addEventListener("click", EventHandler.clickStart);
    }

    static setClickRestart() {
        console.log("class EventListener setClickRestartListener() : setup click eventListener for restart button...");
        console.log("[Listening...] restart button ");
        const d = document.getElementsByClassName('restart')[0];
        d.addEventListener("click", EventHandler.clickRestart);
    }

    static setClickCards() {
        console.log("class EventListener setClickCardsListener(): setup click eventListener for each card...")
        console.log("[Listening...] card clicks");

        // event delegation
        const d = document.getElementsByClassName("deck")[0];

        // event handler call when the card is closed
        d.addEventListener("click", (e) => {
            const position = e.target.className;
            console.log(position);
            if (position === Position.CLOSED) {
                EventHandler.clickCard(e);
            }
        });
    }
}

// has a event handler methods for each possible user's action.

class EventHandler {
    static clickCard(e) {
        console.log(`[EVENT] user clicks card and triggers EventHandler.clickCard()`);
        console.log(`In class EventHandler clickCard() :`);

        const index = e.target.id;
        const position = e.target.className;
        const symbol = e.target.firstChild.className;

        ScorePanel.incrementMove();
        Deck.tryOpeningCard({index, symbol});

    }
    static clickRestart() {
        console.log('[EVENT] user clicks restart button and triggers EventHandler.clickRestart()');
        console.log("In class EventHandler clickRestart() : ");
        Deck.reset();
        ScorePanel.reset();
    }
    static clickStart(e) {
        console.log('[EVENT] user clicks start button and triggers EventHandler.clickStart()');
        console.log("In class EventHandler clickStart() : ");
        Deck.reset();
        ScorePanel.reset();
        Timer = setInterval(ScorePanel.incrementTime, 1000);
        viewChanger.hideStartButton(true);

    }
}

function main() {
    console.log("function main() : Welcome to Matching Game!");
    EventListener.setClickStart();
    EventListener.setClickRestart();
    EventListener.setClickCards();

}

main();
