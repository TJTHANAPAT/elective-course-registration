import React from 'react';
import firebase, { firestore } from 'firebase';

class Dashboard extends React.Component {
    state = {
        courses: []
    }

    componentDidMount = () => {
        this.getCoursesDashboard();
    }

    getCoursesDashboard = () => {
        const db = firebase.firestore();
        const courseYear = '2020'
        const courseRef = db.collection(courseYear).doc('course').collection('course')
        courseRef.onSnapshot(querySnapshot => {
            const coursesArr = [];
            querySnapshot.forEach(doc => {
                console.log(doc.id, ' => ', doc.data())
                coursesArr.push(doc.data())
            })
            console.log(coursesArr)
            this.setState({courses: coursesArr})
        });
    }

    render(){
        const courses = this.state.courses
        let courseDashboard = courses.map((course, i) => {
            let courseStatus = ''
            if (course.currentAmount < course.courseCapacity) {
                courseStatus = course.courseCapacity - course.currentAmount
            } else {
                courseStatus = "Full"
            }
            
            return (
                /*<div key={i} className="card" style={{width:"18rem",margin:"10px",padding:"10px"}}>
                    <h5 className="card-title">{course.courseName}</h5>
                    <p>Course Name: {course.courseName}</p>
                    <p>Course ID: {course.courseID}</p>
                    <p>Capacity: {course.courseCapacity}</p>
                </div>*/
                <tr key={i}>
                    <td>
                        {course.courseID} {course.courseName}<br/>
                        Teacher: {course.courseTeacher}
                    </td>
                    <td>{course.courseCapacity}</td>
                    <td>{course.currentAmount}</td>
                    <td>{courseStatus}</td>
                </tr>
            )
        })
        return (
            <div className="container-fluid">
                <h1>Dashboard</h1>
                {/*<div className="row">
                    {courseDashboard}
                </div>*/}
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Course</th>
                            <th scope="col">Capacity</th>
                            <th scope="col">Enrolled</th>
                            <th scope="col">Available</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courseDashboard}
                    </tbody>
                </table>
 
                
            </div>
        )
    }
}

export default Dashboard;
