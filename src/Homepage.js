import React from 'react';
import Footer from './components/Footer';

class Homepage extends React.Component {
    render(){
        return (
            <div className="body body-center bg-gradient text-white">
                <div className="wrapper-no-bg-color">
                    <h1>Elective Course Enrollment System</h1>
                    <div className="mt-3">
                        <a className="btn btn-landing m-2" href="/course">Enroll in a Course</a>
                        <a className="btn btn-landing m-2" href="/search">Search</a>
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default Homepage;