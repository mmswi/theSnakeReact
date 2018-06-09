import React from 'react';
import Modal from '../components/Modal';

// Square is a presentation component - consists in only a render method
function Square(props) {
    return (
        <div className='square' style={{backgroundColor: props.hexColor}}>
        {/* {props.value} */}
        </div>
    );
}

// Board is a presentation component that draws the board and passes the drawn squers as an array
class Board extends React.Component {

    render() {
        const rows = [];
        //  creating the board
        for(let i = 0; i<49; i=i+7) {
            const oneRow = [];
            for(let j = i; j < i+7; j++) {
                oneRow.push(this.renderSquare(j, j))
            }
            rows.push(<div className="board-row" key={i + 'board-row'}>{oneRow}</div>)
        }
        return (
            <div className="board">
                {rows}
            </div>
        );
    }

    // renderSquare - accepts an index and a key
    // the props.drawn returns a true/false value stored in the drawing array from the state of the app
    renderSquare(i, key) {
        return (
            <Square
                hexColor={this.props.drawn[i] ? this.props.hexColor : '#afada8'}
                key={key}
                value={i}
            />
        );
    }
}


// App is the Container component
// Stores all the shared state between the popup and the board
export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drawing: Array(49).fill(null),
            isDrawn: false,
            showModal: false,
            drawTime: 3,
            hexColor: '#f4424b'
        }
        this.closeModal = this.closeModal.bind(this)
        this.handleModal = this.handleModal.bind(this)
    }

    openModal() {
        this.setState({
            showModal: true
        })
    }

    closeModal() {
        this.setState({
            showModal: false
        })
    }

    drawSnake() {
        // the current drawing in the state
        let currentDrawing = this.state.drawing.slice()
        currentDrawing = currentDrawing.fill(null, 0, 49)
        this.setState({
            drawing: currentDrawing,
            isDrawn: false
        })
        // disabling the button to prevent double click
        this.refs.drawBtn.setAttribute("disabled", "disabled");
        // the start of the snake drawing is random
        const startIndex = getRandomInt(0, 48)
        let isSnakeAlive = true
        // array containing the positions on the board with the drawn snake
        const snakeArray = []
        // the last move will be the last correct move
        let lastMove = startIndex
        // snakeArray will contain all the correct moves
        snakeArray.push(lastMove)
        
        // THIS IS SENT IN THE VIEW - adding the move in the state also
        currentDrawing[lastMove] = true;
        
        // generating the "dead zones" arrays
        const rightWall = generateDeadZoneRight(7)
        const leftWall = generateDeadZoneLeft(7)
        // drawing the snake while it's still alive
        while (isSnakeAlive) {
            let move = drawSnakeCell(lastMove)
            // checkCell(move, historySnake, rightWall, leftWall)
            let moveStatus = checkCell(move, snakeArray, rightWall, leftWall)
            if (moveStatus === 'retry') {
                // if the snake hits itself, try to draw to anothe path
                move = drawSnakeCell(lastMove)
                moveStatus = checkCell(move, snakeArray, rightWall, leftWall)
            } else if (moveStatus === 'dead') {
                isSnakeAlive = false;
                // this.setState({
                //     isDrawn: true
                // })
            } else {
                lastMove = move.pos
                snakeArray.push(lastMove)
                // currentDrawing[lastMove] = true;
                // const prevState = this.state
                // // updating the array sent to the view
                // this.setState({
                //     ...prevState,
                //     drawing: currentDrawing
                // })
            }
        }

        if(!isSnakeAlive) {
            // calculating the time for each move, to put in setTimeout
            const time = this.state.drawTime*1000 / snakeArray.length

            for (var i=0; i < snakeArray.length; i++) {
                (function (i) {
                    // arrow function binds the this to the this in call, else use .bind(this) on the anon function
                    setTimeout(() => {
                        // setting the state one cell at a time
                        const theMove = snakeArray[i]
                        currentDrawing[theMove] = true;
                        const prevState = this.state  
                        this.setState({
                                ...prevState,
                                drawing: currentDrawing
                            })
                        if(snakeArray.length-1 === i) {
                            this.setState({isDrawn: true})
                            // making the button clickable again
                            this.refs.drawBtn.removeAttribute("disabled");
                        }
                    }, time*i)
                }).call(this, i)

            }   
        }
    }

    // this will be called from the modal component with passed data
    // @param: {hexColor: String, speed: Number}
    handleModal(passed) {
        const prevState = this.state
        this.setState({
            ...prevState,
            hexColor: passed.hexColor,
            speed: passed.speed
        })
    }

    render() {
        const btnText = this.state.isDrawn ? 'Restart' : 'Start'
        return (
            <div className="app disp-flex">
                <div className="disp-flex row-center">
                    <div className="app-header-wrapper disp-flex">
                        <div className="logo">LOGO</div>
                        <div className="config">
                            <div>
                                <button onClick={() => this.openModal()}>Config {this.props.seconds}</button>
                            </div>                        
                        </div>
                    </div>
                </div>
                <div>
                <div className="draw-btn-container disp-flex row-center">
                        <button ref="drawBtn" className="draw-btn" onClick={() => this.drawSnake()}>{btnText}</button>
                    </div>
                    <div className="app-board disp-flex">
                        <Board drawn={this.state.drawing}
                                hexColor={this.state.hexColor}
                        />
                    </div>
                    <div className="app-modal disp-flex">
                        <Modal showModal={this.state.showModal} 
                                closeModal={this.closeModal} 
                                handleSubmit={this.handleModal}
                                speed={this.state.drawTime}
                                hexColor={this.state.hexColor}
                        />
                    </div>
                </div>
            </div>
        );
    }
}


// Helper functions
// Function for just drawing one cell
function drawSnakeCell(index) {
    function add1(index) {
        // moving snake head right
        return {
            pos: index+1,
            dir: "right"
        }
    }
    function minus1(index) {
        //moving snake head left
        return {
            pos: index-1,
            dir: "left"
        }
    }
    function add7(index) {
        //moving head snake down
        return {
            pos: index+7,
            dir: "down"
        }
    }
    function minus7(index) {
        //moving head snake up
        return {
            pos: index-7,
            dir: "up"
        }
    }
    // registering one of the four moves
    const availableMoves = [add1, minus1, add7, minus7]
    // generating a random move out of the fore
    const randomMove = getRandomInt(0, 3)

    // the drawing of the cell is random
    const nextMoveValue = availableMoves[randomMove](index)
    
    return nextMoveValue;
}

/*
Understanding the board - the lines are walls up<0, down>48, 
rightWall - going from 6 to 7, left wall - going from 14 to 13 in the array
_____________________
| 0  1  2  3  4  5  6 |
| 7  8  9 10 11 12 13 |
|14 15 16 17 18 19 20 |
|21 22 23 24 25 26 27 |
|28 29 30 31 32 33 34 |
|35 36 37 38 39 40 41 |
|42 43 44 45 46 47 48 |
_____________________
*/

function checkCell(move, historySnake, rightWall, leftWall) {
    // checking if the snake went into itself - commented out since it does this often
    if(historySnake.includes(move.pos)) {  
        return 'retry'
    } else {
        // checking if the snake went into the walls (aka, deadzones)
        switch(move.dir) {
            case 'up':
                return move.pos < 0 ? 'dead' : move.pos
            case 'down': 
                return move.pos > 48 ? 'dead' : move.pos
            case 'right':
                return rightWall.includes(move.pos) ? 'dead' : move.pos
            case 'left':
                return leftWall.includes(move.pos) ? 'dead' : move.pos
            default:
                return 'retry'
        }
    }    
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function generateDeadZoneRight(rows) {
    // this array is used to check if the snake move right into the wall
    const arr = []
    let deadIndex = 0;
    for(let i=0; i<rows;i++) {
        arr.push(deadIndex+7)
        deadIndex+=7;
    }
    return arr;
}

function generateDeadZoneLeft(rows) {
    // this array is used to check if the snake move left into the wall
    const arr = []
    let deadIndex = 0;
    for(let i=0; i<rows;i++) {
        arr.push(deadIndex+6)
        deadIndex+=7;
    }
    return arr;
}