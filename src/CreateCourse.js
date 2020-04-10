import React from 'react';
import firebase from 'firebase';

class CreateCourse extends React.Component {
    state = {
        courseName:'',
        courseID:'',
        courseCapacity:'',
    }

    componentDidMount = () => {
        const db = firebase.firestore();
        const courseRef = db.collection('2020').doc('course').collection('course')
    }

    updateInput = (event) => {
        this.setState({
          [event.target.id]: event.target.value
        });
    }

    createCard = (event) => {
        event.preventDefault();
        const db = firebase.firestore();
        const courseName = this.state.courseName
        const courseID = this.state.courseID
        const courseCapacity = this.state.courseCapacity
        const course = {courseName:courseName,courseid:courseID,courseCapacity:courseCapacity,currentAmount:0}
        db.collection('2020').doc('course').collection('course').doc(courseID).set(course)
            .then(() => {
                console.log(`Course: ${courseName} (${courseID}) has been added succesfully!`);
                alert(`Course: ${courseName} (${courseID}) has been added succesfully!`)
                this.setState({
                    courseName:'',
                    courseID:'',
                    courseCapacity:''
                })
                
            })
            .catch(err => {
                console.error('Error: ', err)
            })
    }

    render(){
        return (
            <div className="wrapper">
                <h1>Create Course</h1>
                <form onSubmit={this.createCard.bind(this)}>
                    <div className="form-group">
                        <label htmlFor="course-name">Course Name</label>
                        <input type="text" className="form-control" id="courseName" placeholder="Course Name" onChange={this.updateInput} value={this.state.courseName}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="course-id">Course ID</label>
                        <input type="text" className="form-control" id="courseID" placeholder="Course ID" onChange={this.updateInput} value={this.state.courseID}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="course-id">Course Capacity</label>
                        <input type="number" className="form-control" id="courseCapacity" placeholder="Course Capacity" onChange={this.updateInput} value={this.state.courseCapacity}/>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button> <a href="/" className="btn btn-secondary ">Back</a> 
                </form>
            </div>
        )
    }
}

export default CreateCourse;