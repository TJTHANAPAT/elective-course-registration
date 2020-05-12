import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import * as system from './functions/systemFunctions';
import LoadingPage from './components/LoadingPage';
import ErrorPage from './components/ErrorPage';
import Footer from './components/Footer';

class GetStudentData extends React.Component {
    state = {
        searchStudentID: '',
        studentID: '',

        courseYearArr: [],
        selectedCourseYear: '',
        lastSearchCourseYear: '',

        isSelectedCourseYearChange: false,
        isLoadingComplete: false,
        isLoadingData: false,
        isGetDataComplete: false,
        isDataExists: false,
        alertMessage: ''
    }
    componentDidMount = () => {
        system.getSystemConfig()
            .then(res => {
                const systemConfig = res.systemConfig;
                const currentCourseYear = systemConfig.currentCourseYear;
                const courseYearArr = systemConfig.courseYears;
                this.setState({
                    courseYearArr: courseYearArr,
                    selectedCourseYear: currentCourseYear,
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
        event.preventDefault();
        window.history.back();
    }

    updateInputByID = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        })
    }

    selectCourseYear = (event) => {
        const newSelectCourseYear = event.target.value;
        this.setState({ selectedCourseYear: newSelectCourseYear });
    }

    searchStudentByID = (event) => {
        event.preventDefault();
        const {
            searchStudentID,
            studentID,
            selectedCourseYear,
            lastSearchCourseYear
        } = this.state;
        const db = firebase.firestore();
        const studentRef = db.collection(selectedCourseYear).doc('student').collection('student');
        const courseRef = db.collection(selectedCourseYear).doc('course').collection('course');

        if ((searchStudentID !== studentID) || (selectedCourseYear !== lastSearchCourseYear)) {
            this.setState({
                isGetDataComplete: false,
                isLoadingData: true
            });
            studentRef.doc(searchStudentID).get()
                .then(studentDoc => {
                    if (studentDoc.exists) {
                        const {
                            nameTitle,
                            nameFirst,
                            nameLast,
                            studentID,
                            studentGrade,
                            studentClass,
                            studentRoll,
                            enrolledCourse,
                            timestamp
                        } = studentDoc.data();

                        courseRef.doc(enrolledCourse).get()
                            .then(courseDoc => {
                                const { courseName } = courseDoc.data()
                                const studentData = {
                                    studentID: studentID,
                                    nameTitle: nameTitle,
                                    nameFirst: nameFirst,
                                    nameLast: nameLast,
                                    studentGrade: studentGrade,
                                    studentClass: studentClass,
                                    studentRoll: studentRoll,
                                    enrolledCourse: enrolledCourse,
                                    courseName: courseName,
                                    timestamp: new Date(timestamp.seconds * 1000).toLocaleString()
                                }
                                this.setState({
                                    studentID: studentID,
                                    studentData: studentData,
                                    lastSearchCourseYear: selectedCourseYear,
                                    isLoadingData: false,
                                    isGetDataComplete: true,
                                    isDataExists: true,
                                    alertMessage: ''
                                })
                            })
                            .catch(err => {
                                console.error(err);
                                this.setState({ alertMessage: `Error: ${err.message}` });
                            })
                    } else {
                        this.setState({
                            isGetDataComplete: true,
                            isLoadingData: false,
                            isDataExists: false,
                            studentID: searchStudentID,
                            lastSearchCourseYear: selectedCourseYear,
                            alertMessage: `No student with ID ${searchStudentID} found in database! Input studentID might be incorrect or haven't be enrolled in any course.`
                        });
                    }
                })
                .catch(err => {
                    console.error(err);
                    this.setState({ alertMessage: `Error: ${err.message}` });
                })
        }
    }

    studentData = () => {
        const {
            studentData,
            studentID,
            isLoadingData,
            isGetDataComplete,
            isDataExists
        } = this.state;

        if (isLoadingData) {
            return <p><i className="fa fa-circle-o-notch fa-spin fa-fw"></i> Loading...</p>
        } else if (isGetDataComplete && isDataExists) {
            const {
                nameTitle,
                nameFirst,
                nameLast,
                studentID,
                studentGrade,
                studentClass,
                studentRoll,
                enrolledCourse,
                courseName,
                timestamp
            } = studentData
            return (
                <div>
                    <h5>{nameFirst} {nameLast} ({studentID})</h5>
                    <p>
                        Fullname: {nameTitle} {nameFirst} {nameLast}<br />
                        Student ID: {studentID}<br />
                        Grade: {studentGrade} Class: {studentClass} Roll: {studentRoll}<br />
                        Enrolled Course: {enrolledCourse} {courseName}
                    </p>
                    <p><i>Enrolled since {timestamp}</i></p>
                </div>
            )
        } else if (isGetDataComplete) {
            return (
                <div>
                    <h5>No student with ID {studentID} found in database!</h5>
                    <p>Input student ID might be incorrect or haven't been enrolled in any course.</p>
                </div>
            )
        }
    }

    render() {
        const { isLoadingComplete, isError, errorMessage } = this.state;
        if (!isLoadingComplete) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'home'} />
        } else {
            const {
                searchStudentID,
                courseYearArr,
                selectedCourseYear
            } = this.state;
            const courseYearSelector = courseYearArr.map((courseYear, i) => {
                return <option value={courseYear.year} key={i}>Course Year {courseYear.year}</option>
            });
            return (
                <div className="body body-center bg-gradient">
                    <div className="wrapper text-left">
                        <h1>Search Your Data</h1>
                        <p>Select course year and type your student ID.</p>
                        <select className="form-control mb-3" defaultValue={selectedCourseYear} onChange={this.selectCourseYear}>
                            {courseYearSelector}
                        </select>
                        <form onSubmit={this.searchStudentByID}>
                            <div className="form-group">
                                <input type="text" id="searchStudentID" className="form-control" onChange={this.updateInputByID} value={searchStudentID} placeholder="Student ID" required />
                            </div>
                            <button type="submit" className="btn btn-purple">Search</button>
                            <button onClick={this.goBack} className="btn btn-secondary ml-2">Back</button>
                        </form>
                        <br />
                        {this.studentData()}
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default GetStudentData;