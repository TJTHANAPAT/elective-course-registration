import React from 'react';
import firebase from 'firebase';
import setupConfig from './setupConfig';
const { courseYear } = setupConfig

class GetStudentData extends React.Component {
    state = {
        searchStudentID:'',

        studentID:'',
        firstName:'',
        lastName:'',
        studentGrade:'',
        studentClass:'',
        studentRoll:'',

        enrolledCourse:'',
        courseName:'',

        isGetDataComplete:false,
        alertMessage:''
    }
    componentDidMount = () => {
        
    }
    updateInputByID = (event) => {
        this.setState({
            [event.target.id]:event.target.value
        })
    }

    searchStudentByID = (event) => {
        event.preventDefault();
        const {searchStudentID, studentID} = this.state;
        const db = firebase.firestore();
        const studentRef = db.collection(courseYear).doc('student').collection('student')
        
        if (searchStudentID !== studentID) {
            this.setState({
                isGetDataComplete: false,
                alertMessage:'Loading...'
            })
            studentRef.doc(searchStudentID).get()
            .then(studentDoc => {
                if(studentDoc.exists) {
                    const {firstName, lastName, studentID, studentGrade, studentClass, studentRoll, enrolledCourse} = studentDoc.data();
                    this.setState({
                        studentID: studentID,
                        firstName: firstName,
                        lastName: lastName,
                        studentGrade: studentGrade,
                        studentClass: studentClass,
                        studentRoll: studentRoll,
                        enrolledCourse: enrolledCourse,
                    })
                    const courseRef = db.collection(courseYear).doc('course').collection('course')
                    courseRef.doc(enrolledCourse).get()
                        .then(courseDoc => {
                            const {courseName} = courseDoc.data()
                            this.setState({
                                courseName: courseName,
                                isGetDataComplete: true,
                                alertMessage:''
                            })
                        })
                        .catch(err => {
                            console.error('Error: ', err)
                            this.setState({alertMessage:`Error: ${err}`})
                        })
                } else {
                    this.setState({alertMessage:`No student with ID ${searchStudentID} found in database! Please enroll to the course first.`})
                }
            })
            .catch(err => {
                console.error('Error: ', err)
                this.setState({alertMessage:`Error: ${err}`})
            })
        }
        
    }

    render(){
        let data = () => {
            return (<p>Hello</p>)
        }
        const {
            searchStudentID,
            isGetDataComplete,
            firstName,
            lastName,
            studentID,
            studentGrade,
            studentClass,
            studentRoll,
            enrolledCourse,
            courseName,
            alertMessage
        } = this.state;
        if(isGetDataComplete) {
            return (
                <div className="wrapper">
                    <h2>Search Your Data by StudentID</h2>
                    <form onSubmit={this.searchStudentByID}>
                        <div className="form-group">
                            <input type="text" id="searchStudentID" className="form-control" onChange={this.updateInputByID} value={searchStudentID} placeholder="StudentID" required/>
                        </div>
                        <button type="submit" className="btn btn-primary">Search</button>
                    </form>
                    <br/>
                    <p>
                        Fullname: {firstName} {lastName} ({studentID})<br/>
                        Grade: {studentGrade} Class: {studentClass} Roll: {studentRoll}<br/>
                        Enrolled Course: {enrolledCourse} {courseName}
                    </p>
                    <p>{alertMessage}</p>
                </div>
            )
        } else {
            return (
                <div className="wrapper">
                    <h2>Search Your Data by StudentID</h2>
                    <form onSubmit={this.searchStudentByID}>
                        <div className="form-group">
                            <input type="text" id="searchStudentID" className="form-control" onChange={this.updateInputByID} value={searchStudentID} placeholder="StudentID" required/>
                        </div>
                        <button type="submit" className="btn btn-primary">Search</button>
                    </form>
                    <br/>
                    <p>{alertMessage}</p>
                </div>
            )
        }
        
    }
}

export default GetStudentData;