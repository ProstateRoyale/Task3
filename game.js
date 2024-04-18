const crypto = require('crypto');
const readline = require('readline');
const process = require('process');

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
    }

    whoWinner(playerMove, computerMove) {
        const playerIndex = this.moves.indexOf(playerMove);
        const computerIndex = this.moves.indexOf(computerMove);
        const n = this.moves.length;
        const winDistance = Math.floor(n / 2);

        if (playerMove === computerMove) {
            return 'Draw';
        } else if (
            (playerMove === 'Rock' && computerMove === 'Scissor') ||
            (playerMove === 'Scissor' && computerMove === 'Paper') ||
            (playerMove === 'Paper' && computerMove === 'Rock')
        ) {
            return 'Player wins';
        } else {
            return 'Computer wins';
        }
    }
}

class HelpDisplay {
    static showComputerMove(computerMove) {
        console.log(`Computer's move was ${computerMove}`);
    }
}

class GameInterface {
    constructor(moves) {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.moves = moves;
        this.logic = new GameLogic(moves);
        this.key = KeyGenerator.generateKey();
        this.computerMove = this.moves[Math.floor(Math.random() * this.moves.length)];
        this.hmac = KeyGenerator.generateHMAC(this.key, this.computerMove);
    }

    displayMenu() {
        console.log(`HMAC: ${this.hmac}`);
        this.moves.forEach((move, index) => {
            console.log(`${index + 1} - ${move}`);
        });
        console.log(`0 - Exit`);
        console.log(`Type 'help' to reveal the computer's move`);
        console.log(`Enter your choice:`);
    }

    start() {
        this.displayMenu();
        this.rl.on('line', (line) => {
            if (line.trim() === 'help') {
                HelpDisplay.showComputerMove(this.computerMove);
                this.displayMenu();
                return;
            }
            const choice = parseInt(line, 10);
            if (choice === 0) {
                this.rl.close();
                return;
            } else if (choice < 1 || choice > this.moves.length) {
                this.displayMenu();
            } else {
                const playerMove = this.moves[choice - 1];
                const result = this.logic.whoWinner(playerMove, this.computerMove);
                console.log(`You chose: ${playerMove}`);
                console.log(`Computer chose: ${this.computerMove}`);
                console.log(result);
                console.log(`Key: ${this.key.toString('hex')}`);
                this.rl.close();
            }
        });
    }
}

const args = process.argv.slice(2);

if (args.length < 3 || args.length % 2 === 0) {
    console.error('!!! odd number of moves >= 3 is required !!!');
    process.exit(1);
}

const game = new GameInterface(args);
game.start();