import React from 'react';
import firebase from 'firebase';
import setupConfig from './setupConfig';
const {courseYear} = setupConfig;
class Enroll extends React.Component {
    state = {
        courseID:'',
        courseName:'',

        studentID:'',
        firstName:'',
        lastName:'',
        studentGrade:'',
        studentClass:'',
        studentRoll:'',

        isLoadingComplete:false,
        isCourseAvailable:false,
        errorMessage:''
    }
    componentDidMount = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const courseID = searchParams.get('courseID');
        this.setState({
            courseID:searchParams.get('courseID'),
            courseName:searchParams.get('courseName')
        });
        const db = firebase.firestore();
        const courseValidateRef = db.collection(courseYear).doc('course').collection('courseValidate')
        courseValidateRef.doc(courseID).get()
            .then(doc => {
                console.log(doc.data())
                this.setState({isLoadingComplete:true})
                const {courseCapacity, courseEnrolled} = doc.data();
                if (courseEnrolled < courseCapacity) {
                    this.setState({isCourseAvailable:true});
                } else {
                    this.setState({errorMessage:`Course ${this.state.courseName} is not available to enroll.`})
                }
            })
            .catch(err => {
                console.error('Error: ', err)
            })
    }
    updateInput = (event) => {
        this.setState({
          [event.target.id]: event.target.value
        });
        console.log(event.target.id,':',event.target.value)
    }

    enrollCourse = (event) => {
        event.preventDefault();

        const db = firebase.firestore();
        const courseRef = db.collection(courseYear).doc('course').collection('course')
        const courseValidateRef = db.collection(courseYear).doc('course').collection('courseValidate')
        const studentRef = db.collection(courseYear).doc('student').collection('student')
        const courseID = this.state.courseID
        courseValidateRef.doc(courseID).get()
            .then(courseValidate => {
                const {courseCapacity, courseEnrolled} = courseValidate.data();
                if (courseEnrolled < courseCapacity) {
                    courseRef.doc(courseID).get()
                        .then(course => {
                            if (courseCapacity == course.data().courseCapacity) {
                                const {
                                    studentID, 
                                    firstName,
                                    lastName, 
                                    studentGrade, 
                                    studentClass, 
                                    studentRoll, 
                                    courseID 
                                } = this.state
                                const studentData = {
                                    studentID: studentID,
                                    firstName: firstName,
                                    lastName: lastName,
                                    studentGrade: studentGrade,
                                    studentClass: studentClass,
                                    studentRoll: studentRoll,
                                    selectedCourse: courseID
                                }
                                studentRef.doc(studentID).set(studentData)
                                    .then(() => {
                                        const updateCourseEnrolled = courseEnrolled + 1;
                                        courseValidateRef.doc(courseID).update({courseEnrolled:updateCourseEnrolled})
                                            .then(() => {
                                                alert("You has enrolled to the course successfully!")
                                            })
                                            .catch(err => {
                                                console.error('Error: ', err)
                                            })
                                    })
                                    .catch(err => {
                                        console.error('Error: ', err)
                                    })
                            } else {
                                this.setState({
                                    isCourseAvailable:false,
                                    errorMessage:`Course ${this.state.courseName} is not available to enroll. (Something went worng, please contact admin for futher infomation.)`
                                })
                            }
                        })
                        .catch(err => {
                            console.error('Error: ', err)
                        })
                } else {
                    this.setState({
                        isCourseAvailable:false,
                        errorMessage:`Course ${this.state.courseName} is not available to enroll.`
                    })

                }
            })
            .catch(err => {
                console.error('Error: ', err)
            })
    }

    render(){
        if (this.state.isLoadingComplete) {
            if (this.state.isCourseAvailable) {
                return (
                    <div className="wrapper">
                        <h1>Enroll to {this.state.courseName}</h1>
                        <p>You're enrolling to {this.state.courseName} ({this.state.courseID}).</p>
                        <form onSubmit={this.enrollCourse}>
                            <div className="form-group">
                                <label htmlFor="studentID">Student ID</label>
                                <input type="text" className="form-control" id="studentID" placeholder="Student ID" onChange={this.updateInput} value={this.state.studentID} required/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input type="text" className="form-control" id="firstName" placeholder="First Name" onChange={this.updateInput} value={this.state.firstName} required/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="firstName">Last Name</label>
                                <input type="text" className="form-control" id="lastName" placeholder="Last Name" onChange={this.updateInput} value={this.state.lastName} required/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="studentGrade">Grade</label>
                                <input type="number" className="form-control" id="studentGrade" placeholder="Grade" onChange={this.updateInput} value={this.state.studentGrade} required/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="studentClass">Class</label>
                                <input type="number" className="form-control" id="studentClass" placeholder="Class" onChange={this.updateInput} value={this.state.studentClass} required/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="studentRoll">Roll</label>
                                <input type="number" className="form-control" id="studentRoll" placeholder="Roll Number" onChange={this.updateInput} value={this.state.studentRoll} required/>
                            </div>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="chkConfirm" required />
                                <label className="form-check-label" htmlFor="chkConfirm">Confirm</label>
                                
                            </div>
                            <br/>
                            <button type="submit" className="btn btn-primary">Enroll</button> <a href="/course" className="btn btn-secondary ">Back</a> 
                        </form>
                    </div>
                )
            } else {
                return (
                    <p>{this.state.errorMessage}</p>
                )
            }
            
            
        } else {
            return (
                <p>Loading...</p>
            )
        }
        
    }
}

export default Enroll;