import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// Square is a presentation component - consists in only a render method
function Square(props) {
    return (
        <div className='square' style={{backgroundColor: props.color}}>
        {props.value}
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
            <div>
                {rows}
            </div>
        );
    }

    // renderSquare - accepts an index and a key
    // the props.drawn returns a true/false value stored in the drawing array from the state of the app
    renderSquare(i, key) {
        return (
            <Square
                color={this.props.drawn[i] ? this.props.hexColor || 'red' : '#ffffff'}
                key={key}
                value={i}
            />
        );
    }
}

class Modal extends React.Component {
    render() {
        return(
            <div className={`modal-container display-flex ${this.props.showModal ? '':'hide'} `}>
                <div className="modal-header">
                    <h2>Config</h2>
                    <button onClick={this.props.closeModal}>x</button>
                </div>
                <div className="modal-body">
                    <form name="configForm">
                        <label>
                            Color(Hex):
                            <input type="text" name="color" placeholder="ex. #cc0000"/>
                        </label>
                        <label>
                            Speed(Seconds):
                            <input type="number" name="speed" placeholder="ex. 5s"/>
                        </label>
                        <input type="submit" value="Save" />
                    </form>
                </div>
            </div>
        )
    }
}

// App is the Container component
// Stores all the shared state between the popup and the board
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drawing: Array(49).fill(null),
            isDrawn: false,
            showModal: false,
            drawTime: 2
        }
        this.closeModal = this.closeModal.bind(this)
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
            drawing: currentDrawing
        })
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
            const move = drawSnakeCell(lastMove)
            // checkCell(move, historySnake, rightWall, leftWall)
            const moveStatus = checkCell(move, snakeArray, rightWall, leftWall)
            if (moveStatus === 'dead') {
                isSnakeAlive = false;
                this.setState({
                    isDrawn: true
                })
            } else {
                lastMove = move.pos
                snakeArray.push(lastMove)
                currentDrawing[lastMove] = true;
                // updating the array sent to the view
                this.setState({
                    drawing: currentDrawing
                })
            }
        } 
    }

    render() {
        const btnText = this.state.isDrawn ? 'Redraw' : 'Draw'
        return (
            <div className="app disp-flex">
                <div className="app-header disp-flex">
                    <div className="logo">LOGO</div>
                    <div className="config">
                        <div>
                            <button onClick={() => this.openModal()}>Config</button>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="app-board disp-flex">
                        <Board drawn={this.state.drawing}/>
                    </div>
                    <div className="app-modal disp-flex">
                        <Modal showModal={this.state.showModal} closeModal={this.closeModal}/>
                    </div>
                    <div className="draw-btn-container disp-flex row-center">
                        <button onClick={() => this.drawSnake()}>{btnText}</button>
                    </div>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

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

function checkCell(move, historySnake, rightWall, leftWall) {
    /* // checking if the snake went into itself - commented out since it does this often
    if(historySnake.includes(move.pos)) {        
        return 'dead'
    } else {*/
        // checking if the snake went into the walls (aka, deadzones)
        switch(move.dir) {
            case 'up':
                return move.pos < 0 ? 'dead' : move.pos
                break;
            case 'down': 
                return move.pos > 48 ? 'dead' : move.pos
                break;
            case 'right':
                return rightWall.includes(move.pos) ? 'dead' : move.pos
                break;
            case 'left':
                return leftWall.includes(move.pos) ? 'dead' : move.pos
                break;
            default:
                return 'dead'
        }
    // }    
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