import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import * as auth from './functions/authenticationFuctions';
import * as system from '../functions/systemFunctions';
import LoadingPage from '../components/LoadingPage';
import ErrorPage from '../components/ErrorPage';
import Footer from '../components/Footer';

class ManageStudent extends React.Component {
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
        auth.checkAuthState()
            .then(() => {
                return system.getURLParam('courseYear');
            })
            .then(res => {
                this.setState({ selectedCourseYear: res });
                return system.getSystemConfig();
            })
            .then(res => {
                const systemConfig = res.systemConfig;
                const courseYearArr = systemConfig.courseYears;
                this.setState({
                    courseYearArr: courseYearArr,
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

    updateStudentData = (event) => {
        const studentData = this.state.studentData;
        const newStudentData = { ...studentData, ...{ [event.target.id]: event.target.value } };
        this.setState({ studentData: newStudentData });
    }

    saveStudentData = (event) => {
        event.preventDefault();
        this.setState({ isLoadingComplete: false });
        const courseYear = this.state.lastSearchCourseYear;
        const { studentData } = this.state;
        const studentID = studentData.studentID
        const db = firebase.firestore();
        const studentRef = db.collection(courseYear).doc('student').collection('student').doc(studentID);
        studentRef.update(studentData)
            .then(() => {
                this.setState({ isLoadingComplete: true });
                alert('Update student data successfully!');
            })
            .catch(err => {
                this.setState({ isLoadingComplete: true });
                alert('Failed updating student data.');
                console.error(err);
            })
    }

    deleteStudentData = (event) => {
        event.preventDefault();
        const courseYear = this.state.lastSearchCourseYear;
        const { studentData } = this.state;
        const { studentID, enrolledCourse } = studentData
        console.log('Delete Student Data.')
        const db = firebase.firestore();
        const studentRef = db.collection(courseYear).doc('student').collection('student').doc(studentID);
        const courseRef = db.collection(courseYear).doc('course').collection('course').doc(enrolledCourse);
        const confirmDelete = window.confirm('Are you sure to delete this student?');
        if (confirmDelete) {
            this.setState({ isLoadingComplete: false });
            studentRef.delete()
                .then(() => {
                    courseRef.get()
                        .then(doc => {
                            const courseEnrolled = doc.data().courseEnrolled;
                            const updateCourseEnrolled = courseEnrolled - 1;
                            courseRef.update({ courseEnrolled: updateCourseEnrolled })
                                .then(() => {
                                    this.setState({ isLoadingComplete: true });
                                    alert('Student has been deleted successfully!')
                                    window.location.reload();
                                })
                                .catch(err => {
                                    console.log(err);
                                    alert('Failed deleting student data.')
                                })
                        })
                        .catch(err => {
                            console.log(err);
                            alert('Failed deleting student data.')
                        })
                })
                .catch(err => {
                    console.log(err);
                    alert('Failed deleting student data.')
                })

        }

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
                                    timestamp: timestamp
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
            const { lastSearchCourseYear } = this.state;
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
            const updateInput = this.updateStudentData;
            return (
                <div>
                    <h4>Student ID {studentID} in course year {lastSearchCourseYear}</h4>
                    <form onSubmit={this.saveStudentData}>
                        <div className="form-group">
                            <label htmlFor="studentID">Student ID</label>
                            <input type="number" className="form-control" id="studentID" placeholder="Student ID" value={studentID} disabled />
                        </div>
                        <div className="form-row">
                            <div className="col-sm-2 form-group">
                                <label htmlFor="nameTitle">Title</label>
                                <select id="nameTitle" className="form-control" onChange={updateInput} defaultValue={nameTitle} required>
                                    <option value="" disabled>Choose...</option>
                                    <option value="Master">Master</option>
                                    <option value="Mister">Mister</option>
                                    <option value="Miss">Miss</option>
                                </select>
                            </div>
                            <div className="col-sm-5 form-group">
                                <label htmlFor="nameFirst">First Name</label>
                                <input type="text" className="form-control" id="nameFirst" placeholder="First Name" onChange={updateInput} value={nameFirst} required />
                            </div>
                            <div className="col-sm-5 form-group">
                                <label htmlFor="nameLast">Last Name</label>
                                <input type="text" className="form-control" id="nameLast" placeholder="Last Name" onChange={updateInput} value={nameLast} required />
                            </div>

                            <div className="col-sm-4 form-group">
                                <label htmlFor="studentGrade">Grade</label>
                                <input type="number" pattern="[0-9]*" className="form-control" id="studentGrade" placeholder="Grade" value={studentGrade} disabled />
                            </div>
                            <div className="col-sm-4 form-group">
                                <label htmlFor="studentClass">Class</label>
                                <input type="number" pattern="[0-9]*" className="form-control" id="studentClass" placeholder="Class" onChange={updateInput} value={studentClass} required />
                            </div>
                            <div className="col-sm-4 form-group">
                                <label htmlFor="studentRoll">Roll</label>
                                <input type="number" pattern="[0-9]*" className="form-control" id="studentRoll" placeholder="Roll Number" onChange={updateInput} value={studentRoll} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="nameLast">Enrolled Course</label>
                            <input type="text" className="form-control" value={`${enrolledCourse} ${courseName}`} disabled />
                            <p><i>Enrolled since {new Date(timestamp.seconds * 1000).toLocaleString()}</i></p>
                        </div>
                        <div>
                            <button type="submit" className="btn btn-purple m-1">Save</button>
                            <button className="btn btn-danger m-1" onClick={this.deleteStudentData}>Delete</button>
                        </div>
                    </form>
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
                        <h1>Student Management</h1>
                        <p>Select course year and type student ID.</p>
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

export default ManageStudent;