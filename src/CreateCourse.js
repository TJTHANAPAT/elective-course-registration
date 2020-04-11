import React from 'react';
import firebase from 'firebase';
import setupConfig from './setupConfig';
const { courseYear } = setupConfig

class CreateCourse extends React.Component {
    state = {
        courseName:'',
        courseID:'',
        courseCapacity:'',
        courseTeacher:'',
        courseGrade:''
    }

    componentDidMount = () => {
        
    }

    updateInput = (event) => {
        this.setState({
          [event.target.id]: event.target.value
        });
    }

    createCourse = (event) => {
        event.preventDefault();

        const db = firebase.firestore();
        const courseRef = db.collection(courseYear).doc('course').collection('course')
        const courseValidateRef = db.collection(courseYear).doc('course').collection('courseValidate')
        
        const { courseName, courseID, courseTeacher, courseGrade, courseCapacity } = this.state
        const course = {
            courseName: courseName,
            courseID: courseID,
            courseGrade: courseGrade,
            courseTeacher: courseTeacher,
            courseCapacity: courseCapacity,
        }
        const courseValidate = {
            courseName: courseName,
            courseID: courseID,
            courseGrade: courseGrade,
            courseTeacher: courseTeacher,
            courseCapacity: courseCapacity,
            courseEnrolled:0
        }
        courseRef.doc(courseID).set(course)
            .then(() => {
                courseValidateRef.doc(courseID).set(courseValidate)
                    .then(() => {
                        console.log(`Course: ${courseName} (${courseID}) has been added succesfully!`);
                        alert(`Course: ${courseName} (${courseID}) has been added succesfully!`)
                        this.setState({
                            courseName:'',
                            courseID:'',
                            courseGrade:'',
                            courseCapacity:'',
                            courseTeacher:''
                        })
                    })
                    .catch(err => {
                        console.error('Error: ', err)
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
                <form onSubmit={this.createCourse}>
                    <div className="form-group">
                        <label htmlFor="courseName">Course Name</label>
                        <input type="text" className="form-control" id="courseName" placeholder="Course Name" onChange={this.updateInput} value={this.state.courseName} required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="courseID">Course ID</label>
                        <input type="text" className="form-control" id="courseID" placeholder="Course ID" onChange={this.updateInput} value={this.state.courseID} required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="courseGrade">Course Grade</label>
                        <input type="number" className="form-control" id="courseGrade" placeholder="Course Grade" onChange={this.updateInput} value={this.state.courseGrade} required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="courseTeacher">Course Teacher</label>
                        <input type="text" className="form-control" id="courseTeacher" placeholder="Course Teacher" onChange={this.updateInput} value={this.state.courseTeacher} required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="courseCapacity">Course Capacity</label>
                        <input type="number" className="form-control" id="courseCapacity" placeholder="Course Capacity" onChange={this.updateInput} value={this.state.courseCapacity} required/>
                    </div>

                    <button type="submit" className="btn btn-primary">Submit</button> <a href="/" className="btn btn-secondary ">Back</a> 
                </form>
            </div>
        )
    }
}

export default CreateCourse;