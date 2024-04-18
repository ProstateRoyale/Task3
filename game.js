const crypto = require('crypto');
const readline = require('readline');
require('console.table');

class KeyGenerator {
    static generateKey() {
        return crypto.randomBytes(32);
    }

    static generateHMAC(key, message) {
        const hmac = crypto.createHmac('sha256', key);
        hmac.update(message);
        return hmac.digest('hex');
    }
}

class GameLogic {
    constructor(moves) {
        this.moves = moves;
        this.n = moves.length;
        this.winDistance = Math.floor(this.n / 2);
    }

    determineWinner(playerMove, computerMove) {
        const playerIndex = this.moves.indexOf(playerMove);
        const computerIndex = this.moves.indexOf(computerMove);

        if (playerIndex === computerIndex) {
            return 'Draw';
        } else if ((playerIndex > computerIndex && playerIndex - computerIndex <= this.winDistance) ||
                   (computerIndex > playerIndex && computerIndex - playerIndex > this.winDistance)) {
            return 'Player wins';
        } else {
            return 'Computer wins';
        }
    }
}

class GameInterface {
    constructor(moves) {
        this.moves = moves;
        this.logic = new GameLogic(moves);
        this.key = KeyGenerator.generateKey();
        this.computerMove = moves[Math.floor(Math.random() * moves.length)];
        this.hmac = KeyGenerator.generateHMAC(this.key, this.computerMove);
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    displayMenu() {
        console.log(`HMAC: ${this.hmac}`);
        this.moves.forEach((move, index) => {
            console.log(`${index + 1} - ${move}`);
        });
        console.log(`0 - Exit`);
        console.log(`? - Help`);
        console.log(`Enter your choice:`);
    }

    start() {
        this.displayMenu();
        this.rl.on('line', (line) => {
            if (line === '?') {
                HelpDisplay.displayHelp(this.moves);
                this.displayMenu();
            } else {
                const choice = parseInt(line, 10);
                if (choice === 0) {
                    this.rl.close();
                } else if (choice < 1 || choice > this.moves.length) {
                    console.log('Invalid choice, try again.');
                    this.displayMenu();
                } else {
                    const playerMove = this.moves[choice - 1];
                    const result = this.logic.determineWinner(playerMove, this.computerMove);
                    console.log(`Your move: ${playerMove}`);
                    console.log(`Computer move: ${this.computerMove}`);
                    console.log(result);
                    console.log(`HMAC key: ${this.key.toString('hex')}`);
                    this.rl.close();
                }
            }
        });
    }
}


class HelpDisplay {
    static displayHelp(moves) {
        let table = moves.map((move1, index1) => {
            let row = { Move: move1 };
            moves.forEach((move2, index2) => {
                const winDistance = Math.floor(moves.length / 2);
                if (index1 === index2) {
                    row[move2] = "Draw";
                } else if ((index1 > index2 && index1 - index2 <= winDistance) ||
                           (index2 > index1 && index2 - index1 > winDistance)) {
                    row[move2] = "Win";
                } else {
                    row[move2] = "Lose";
                }
            });
            return row;
        });
        console.table(table);
    }
}

const args = process.argv.slice(2);
const unique = new Set(args);

if (args.length < 3 || args.length % 2 === 0) {
    console.log(args.length % 2 === 0)
    console.error('!!! odd number of unique moves >= 3 !!!.');
    process.exit(1);
}

if (unique.size !== args.length) {
    console.error('!!! All moves must be unique. !!!');
    process.exit(1);
}

const game = new GameInterface([...unique]);
game.start();