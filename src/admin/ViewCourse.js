import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';

import * as auth from './functions/authenticationFuctions';
import * as system from '../functions/systemFunctions';

class ViewCourse extends React.Component {
    state = {
        courseName: '',
        courseID: '',
        courseCapacity: '',
        courseTeacher: '',
        courseGrade: [],
        gradesArr: [],
        isLoadingComplete: false,
        studentsArr: []
    }

    componentDidMount = () => {
        auth.checkAuthState()
            .then(() => {
                return system.getURLParam('courseYear')
            })
            .then(res => {
                const courseYear = res;
                this.setState({ courseYear: courseYear });
                return system.getURLParam('courseID');
            })
            .then(res => {
                const courseID = res;
                const { courseYear } = this.state;
                return system.getCourseData(courseYear, courseID);
            })
            .then(course => {
                this.setState({
                    courseName: course.courseName,
                    courseID: course.courseID,
                    courseCapacity: course.courseCapacity,
                    courseTeacher: course.courseTeacher,
                    courseGrade: course.courseGrade,
                })
                const { courseYear, courseID } = this.state;
                return this.getCourseStudentsData(courseYear, courseID);
            })
            .then(res => {
                this.setState({
                    studentsArr: res,
                    isLoadingComplete: true
                })
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    isLoadingComplete: true,
                    isError: true,
                    errorMessage: err
                })
            })
    }

    goBack = (event) => {
        event.preventDefault()
        window.history.back();
    }

    convertToCSV = (objectArr) => {
        const array = [Object.keys(objectArr[0])].concat(objectArr)
        return array.map(it => {
            return Object.values(it).toString()
        }).join('\n')
    }

    exportCSVFile = (objectArr, fileTitle) => {
        var csv = this.convertToCSV(objectArr);
        var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, exportedFilenmae);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", exportedFilenmae);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    exportStudentList = (event) => {
        event.preventDefault();
        const { studentsArr, courseYear, courseID } = this.state;
        let fileTitle = `${courseYear}_${courseID}`;
        let studentsArrFormated = [];
        studentsArr.map(student => {
            let studentDataFormated = {
                StudentID: student.studentID,
                Title: student.nameTitle,
                FirstName: student.nameFirst,
                LastName: student.nameLast,
                Grade: student.studentGrade,
                Class: student.studentClass,
                Roll: student.studentRoll
            }
            studentsArrFormated.push(studentDataFormated);
        })
        this.exportCSVFile(studentsArrFormated, fileTitle);
    }

    getCourseStudentsData = (courseYear, courseID) => {
        const db = firebase.firestore();
        const studentRef = db.collection(courseYear).doc('student').collection('student').where('enrolledCourse', '==', courseID);
        return new Promise((resolve, reject) => {
            studentRef.get()
                .then(querySnapshot => {
                    let studentsArr = [];
                    querySnapshot.forEach(function (doc) {
                        studentsArr.push(doc.data());
                    });
                    resolve(studentsArr);
                })
                .catch(err => {
                    console.error(err);
                    const errorMessage = `Firebase failed getting student data of course ${courseID} in ${courseYear}. (${err.errorMessage})`
                    reject(errorMessage)
                })
        })
    }

    studentsList = () => {
        const { studentsArr } = this.state
        if (studentsArr.length === 0) {
            return <p className="text-center">No students has enrolled in this course.</p>
        } else {
            let studentsList = studentsArr.map((student, i) => {
                return (
                    <tr key={i}>
                        <td>{student.studentID}</td>
                        <td>{student.nameTitle}</td>
                        <td>{student.nameFirst}</td>
                        <td>{student.nameLast}</td>
                        <td>{student.studentGrade} / {student.studentClass}</td>
                        <td>{student.studentRoll}</td>
                    </tr>
                )
            })
            return (
                <div>
                    <table className="table table-hover table-responsive-md">
                        <thead>
                            <tr>
                                <th scope="col-1">ID</th>
                                <th scope="col-1">Title</th>
                                <th scope="col-4">First</th>
                                <th scope="col-4">Last</th>
                                <th scope="col-1">Grade/Class</th>
                                <th scope="col-1">Roll</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentsList}
                        </tbody>
                    </table>
                    <button className="btn btn-purple" onClick={this.exportStudentList}><i className="fa fa-download fa-fw"></i> Export to CSV File</button>
                </div>

            )
        }
    }

    render() {
        const { isLoadingComplete, isError, errorMessage } = this.state;
        if (!isLoadingComplete) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'back'} />
        } else {
            const { courseID, courseName, courseYear } = this.state
            return (
                <div className="body bg-gradient">
                    <div className="wrapper">
                        <h1>{courseName} ({courseID})</h1>
                        <p>Course {courseName} ({courseID}) in course year {courseYear}.</p>
                        {this.studentsList()}
                        <button className="btn btn-wrapper-bottom btn-green" onClick={this.goBack}>Back</button>
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default ViewCourse;