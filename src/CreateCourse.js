import React from 'react';
import firebase from 'firebase';

class CreateCourse extends React.Component {
    state = {
        courseName:'',
        courseID:'',
        courseCapacity:'',
        courseTeacher:''
    }

    componentDidMount = () => {
        
    }

    updateInput = (event) => {
        this.setState({
          [event.target.id]: event.target.value
        });
    }

    createCard = (event) => {
        event.preventDefault();

        const db = firebase.firestore();
        const courseYear = '2020'
        const courseRef = db.collection(courseYear).doc('course').collection('course')
        
        const { courseName, courseID, courseTeacher, courseCapacity } = this.state
        const course = {
            courseName: courseName,
            courseID: courseID,
            courseTeacher: courseTeacher,
            courseCapacity: courseCapacity,
            currentAmount: 0
        }
        courseRef.doc(courseID).set(course)
            .then(() => {
                console.log(`Course: ${courseName} (${courseID}) has been added succesfully!`);
                alert(`Course: ${courseName} (${courseID}) has been added succesfully!`)
                this.setState({
                    courseName:'',
                    courseID:'',
                    courseCapacity:'',
                    courseTeacher:''
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
                <form onSubmit={this.createCard}>
                    <div className="form-group">
                        <label htmlFor="course-name">Course Name</label>
                        <input type="text" className="form-control" id="courseName" placeholder="Course Name" onChange={this.updateInput} value={this.state.courseName} required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="course-id">Course ID</label>
                        <input type="text" className="form-control" id="courseID" placeholder="Course ID" onChange={this.updateInput} value={this.state.courseID} required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="course-id">Course Teacher</label>
                        <input type="text" className="form-control" id="courseTeacher" placeholder="Course Teacher" onChange={this.updateInput} value={this.state.courseTeacher} required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="course-id">Course Capacity</label>
                        <input type="number" className="form-control" id="courseCapacity" placeholder="Course Capacity" onChange={this.updateInput} value={this.state.courseCapacity} required/>
                    </div>

                    <button type="submit" className="btn btn-primary">Submit</button> <a href="/" className="btn btn-secondary ">Back</a> 
                </form>
            </div>
        )
    }
}

export default CreateCourse;