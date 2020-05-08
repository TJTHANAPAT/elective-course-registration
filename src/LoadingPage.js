import React from 'react';
import Footer from './Footer';

class LoadingPage extends React.Component {
    render(){
        return (
            <div className="body body-center bg-gradient text-white">
                <div className="wrapper-no-bg-color">
                    <i className="fa fa-circle-o-notch fa-spin fa-2x fa-fw"></i>
                    <p className="mt-1">Loading...</p>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default LoadingPage