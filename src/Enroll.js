import React from 'react';
import Footer from './Footer';
import LoadingPage from './Loading';
import ErrorPage from './ErrorPage';
import * as system from './systemFunction';
import * as enroll from './enrollCourseFunction';

class Enroll extends React.Component {

    state = {
        isLoadingComplete: false,
        isError: false,
        errorMessage: '',
        isEnrollmentSuccess: false
    }

    componentDidMount = () => {
        system.getURLParam('courseYear')
            .then(res => {
                this.setState({ courseYear: res });
                return system.getURLParam('courseID');
            })
            .then(res => {
                this.setState({courseID: res});
                return system.getSystemConfig();
            })
            .then(res => {
                const systemConfig = res.systemConfig;
                const { courseYear } = this.state;
                return enroll.checkCourseYearAvailable(courseYear,systemConfig);
            })
            .then(res => {
                const { courseYear, courseID } = this.state;
                return system.getCourseData(courseYear, courseID);
            })
            .then(res => {
                const courseData = res;
                this.setState({
                    courseName: courseData.courseName,
                    courseGrade: courseData.courseGrade
                });
                console.log(courseData.courseGrade)
                const { courseYear } = this.state;
                return enroll.checkCourseAvailable(courseYear,courseData);
            })
            .then(res => {
                this.setState({ isLoadingComplete: true });
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    errorMessage: err,
                    isLoadingComplete: true,
                    isError: true
                });
            })

    }

    goBack = () => {
        window.history.back();
    }

    updateInput = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        });
        console.log(event.target.id, ':', event.target.value)
    }

    enrollCourse = (event) => {
        event.preventDefault();
        const {
            courseYear,
            courseID,

            studentID,
            nameTitle,
            nameFirst,
            nameLast,
            studentGrade,
            studentClass,
            studentRoll
        } = this.state
        const studentData = {
            studentID: studentID,
            nameTitle: nameTitle,
            nameFirst: nameFirst,
            nameLast: nameLast,
            studentGrade: parseInt(studentGrade),
            studentClass: parseInt(studentClass),
            studentRoll: parseInt(studentRoll),
            enrolledCourse: courseID,
        }
        this.setState({ isLoadingComplete: false });
        enroll.enrollCourse(courseYear,courseID,studentData)
            .then(res => {
                this.setState({
                    isLoadingComplete: true,
                    isEnrollmentSuccess: true,
                    studentData: studentData
                });
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    isLoadingComplete: true,
                    isError: true,
                    errorMessage: err
                });
            })
    }

    enrollmentForm = () => {
        const enrollCourse = this.enrollCourse;
        const updateInput = this.updateInput;
        const goBack = this.goBack;
        return (
            <form onSubmit={enrollCourse}>
                <div className="form-group">
                    <label htmlFor="studentID">Student ID</label>
                    <input type="text" className="form-control" id="studentID" placeholder="Student ID" onChange={updateInput} required />
                </div>
                <div className="form-group">
                    <label htmlFor="nameTitle">Title</label>
                    <select id="nameTitle" className="form-control" onChange={updateInput} defaultValue="" required>
                        <option value="" disabled>Choose...</option>
                        <option value="Master">Master</option>
                        <option value="Mister">Mister</option>
                        <option value="Miss">Miss</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="nameFirst">First Name</label>
                    <input type="text" className="form-control" id="nameFirst" placeholder="First Name" onChange={updateInput} required />
                </div>
                <div className="form-group">
                    <label htmlFor="nameLast">Last Name</label>
                    <input type="text" className="form-control" id="nameLast" placeholder="Last Name" onChange={updateInput} required />
                </div>
                <div className="form-group">
                    <label htmlFor="studentGrade">Grade</label>
                    <input type="number" pattern="[0-9]*" className="form-control" id="studentGrade" placeholder="Grade" onChange={updateInput} required />
                </div>
                <div className="form-group">
                    <label htmlFor="studentClass">Class</label>
                    <input type="number" pattern="[0-9]*" className="form-control" id="studentClass" placeholder="Class" onChange={updateInput} required />
                </div>
                <div className="form-group">
                    <label htmlFor="studentRoll">Roll</label>
                    <input type="number" pattern="[0-9]*" className="form-control" id="studentRoll" placeholder="Roll Number" onChange={updateInput} required />
                </div>
                <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="chkConfirm" required />
                    <label className="form-check-label" htmlFor="chkConfirm">Confirm</label>
                </div>
                <br />
                <button type="submit" className="btn btn-purple">Enroll</button>
                <button onClick={goBack} className="btn btn-secondary ml-2">Back</button>
            </form>
        );
    }

    render() {
        const {
            isLoadingComplete,
            isError,
            isEnrollmentSuccess,
            errorMessage
        } = this.state;

        if (!isLoadingComplete) {
            return (
                <LoadingPage />
            )
        } else if (isError) {
            return (
                <ErrorPage errorMessage={errorMessage} btn={'back'} />
            )
        } else {
            if (isEnrollmentSuccess) {
                const {
                    courseName,
                    courseID,
                    courseYear,
                    studentData
                } = this.state;
                const {
                    nameTitle,
                    nameFirst,
                    nameLast,
                    studentID
                } = studentData;
                return (
                    <div className="body body-center bg-gradient">
                        <div className="wrapper text-left">
                            <h1>Your enrollment is completed!</h1>
                            <p>{nameTitle} {nameFirst} {nameLast} (student ID: {studentID}) has enrolled to the {courseName} ({courseID}) in course year {courseYear} successfully!</p>
                            <a className="btn btn-wrapper-bottom btn-green" href="/">Home</a>
                        </div>
                        <Footer />
                    </div>
                )
            } else {
                const {
                    courseName,
                    courseID,
                    courseYear,
                } = this.state;
                return (
                    <div className="body bg-gradient">
                        <div className="wrapper">
                            <h1>Enroll in {courseName}</h1>
                            <p>You're enrolling in {courseName} ({courseID}) in course year {courseYear}.</p>
                            {this.enrollmentForm()}
                        </div>
                        <Footer />
                    </div>
                )
            }

        }
    }
}

export default Enroll;