import React from 'react';
import Footer from './Footer';

class ErrorPage extends React.Component {
    goBack = () => {
        window.history.back();
    }
    render(){
        const btn = () => {
            if (this.props.btn === 'home') {
                return <a href="/" className="btn btn-wrapper-bottom btn-green">Home</a>
            } else if (this.props.btn === 'none') {
                return true
            } else {
                return <button className="btn btn-wrapper-bottom btn-green" onClick={this.goBack}>Back</button>
            }
        }
        
        return (
            <div className="body body-center bg-gradient">
                <div className="wrapper">
                    <div className="row align-items-center">
                        <div className="col-sm-3 text-center mb-3">
                            <i className="fa fa-exclamation-triangle fa-5x" aria-hidden="false"></i>
                        </div>
                        <div className="col-sm-9 text-left">
                            <h2>Unfortunately, something went wrong.</h2>
                            <p>{this.props.errorMessage}</p>
                        </div>
                    </div>
                    {btn()}
                </div>
                <Footer/>
            </div>
        )
    }
}

export default ErrorPage