import React from 'react';
import firebase, { firestore } from 'firebase';
import setupConfig from './setupConfig';
const { courseYear } = setupConfig

class Dashboard extends React.Component {
    state = {
        courses: [],
        isLoadingComplete:false
    }

    componentDidMount = () => {
        this.getCoursesDashboard();
    }

    getCoursesDashboard = () => {
        const db = firebase.firestore();
        const courseValidateRef = db.collection(courseYear).doc('course').collection('courseValidate')
        courseValidateRef.onSnapshot(querySnapshot => {
            const coursesArr = [];
            querySnapshot.forEach(doc => {
                console.log(doc.id, ' => ', doc.data())
                coursesArr.push(doc.data())
            })
            console.log(coursesArr)
            this.setState({ courses: coursesArr, isLoadingComplete:true})
        });
    }

    render(){
        const courses = this.state.courses
        let courseDashboard = courses.map((course, i) => {
            let courseStatus = ''
            let btnText = ''
            let btnLink = ''
            let btnStyle = ''
            let btnDisabled = 'false'
            if (course.courseEnrolled < course.courseCapacity) {
                courseStatus = course.courseCapacity - course.courseEnrolled
                btnText = 'Enroll'
                btnLink = `/course/enroll?courseID=${course.courseID}&courseName=${course.courseName}`
                btnStyle = 'btn btn-primary'
            } else {
                courseStatus = 'Full'
                btnText = 'Full'
                btnLink = ''
                btnStyle = 'btn btn-secondary disabled'
                btnDisabled = 'true'
            }
            
            return (
                <tr key={i}>
                    <td>
                        <b>{course.courseID} {course.courseName}</b><br/>
                        Teacher: {course.courseTeacher}<br/>
                        Available for grade {course.courseGrade} students
                    </td>
                    <td>{course.courseCapacity}</td>
                    <td>{course.courseEnrolled}</td>
                    <td>{courseStatus}</td>
                    <td style={{textAlign:'center'}}><a href={btnLink} className={btnStyle} role="button" aria-disabled={btnDisabled}>{btnText}</a></td>
                </tr>
            )
        })
        if(this.state.isLoadingComplete){
            return (
                <div className="container-fluid">
                    <h1 className="mt-3">Dashboard</h1>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col">Course</th>
                                <th scope="col">Capacity</th>
                                <th scope="col">Enrolled</th>
                                <th scope="col">Available</th>
                                <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {courseDashboard}
                        </tbody>
                    </table>
     
                    
                </div>
            )
        } else {
            return (
                <p>Loading...</p>
            )
        }
        
    }
}

export default Dashboard;
