import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// Square is a presentation component - consists in only a render method
function Square(props) {
    return (
        <div className='square' style={{backgroundColor: props.color}}>
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
                color={this.props.drawn[i] ? this.props.hexColor : '#ffffff'}
                key={key}
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
            showModal: false
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
        const startIndex = getRandomArbitrary(0, 49)
        let firstRun = true
        const snakeArray = []
        const firstMove = drawSnakeCell(startIndex, startIndex)
        snakeArray.push(firstMove)
        // just for testing draw snake
        for(let i=0; i<7;i++) {
            const lastMove = snakeArray[snakeArray.length-1]
            const nextMove = drawSnakeCell(startIndex, startIndex)
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
function drawSnakeCell(index, lastMove) {
    function add1(index) {
        return index+1
    }
    function minus1(index) {
        return index-1
    }
    function add7(index) {
        return index+7
    }
    function minus7(index) {
        return index-7
    }
    const nextMove = [add1, minus1, add7, minus7]
    const move = getRandomArbitrary(0, 4)
    const nextMoveValue = nextMove[move](index)
    if (nextMoveValue < 49 &&  nextMoveValue >= 0 &&  nextMoveValue != lastMove){
        return nextMoveValue
    } else {
        drawSnakeCell(index, lastMove)
    }
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
