import React from 'react';

export default class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            color: this.props.hexColor,
            speed: this.props.speed,
            error: false
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleColorChange = this.handleColorChange.bind(this);
        this.handleSpeedChange = this.handleSpeedChange.bind(this);
    }

    handleSave(event) {
        event.preventDefault();
        const config = {
            hexColor: this.state.color,
            speed: this.state.speed
        }
        this.props.handleSubmit(config)
        this.props.closeModal()
    }
    // handling input color change
    handleColorChange(event) {
        const regExp = /^#(?:[0-9a-f]{3}){1,2}$/i
        const value = event.target.value
        if (regExp.test(value)) {
            this.setState({color: event.target.value});
            this.setState({error: false})
        } else {
            this.setState({error: true})
        }        
    }
    // handling input speed change
    handleSpeedChange(event) {
        this.setState({speed: event.target.value});
    }
    render() {
        return(
            <div className={`modal-container display-flex ${this.props.showModal ? '':'hide'} `}>
                <div className="modal-header">
                    <h2>Config</h2>
                    <button className="close-btn" onClick={this.props.closeModal}>x</button>
                </div>
                <div className="modal-body">
                    <form name="configForm">
                        <label className={this.state.error ? 'error': ''}>
                            Color(Hex):
                            <input type="text" name="color" placeholder={`ex. ${this.state.color}`} onChange={this.handleColorChange}/>
                            <div className="error-message">Please enter a valid color</div>
                        </label>
                        <label>
                            Speed(Seconds):
                            <input type="number" name="speed" placeholder={`ex. ${this.state.speed}s`} onChange={this.handleSpeedChange}/>
                        </label>
                        <button onClick={this.handleSave}>Save</button>
                    </form>
                </div>
            </div>
        )
    }
}