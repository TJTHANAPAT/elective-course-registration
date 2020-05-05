import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import Footer from './Footer';
import LoadingPage from './Loading';
import ErrorPage from './ErrorPage';

class Enroll extends React.Component {
    state = {
        studentID:'',
        nameFirst:'',
        nameLast:'',
        studentGrade:'',
        studentClass:'',
        studentRoll:'',

        isLoadingComplete: false,
        isError: false,
        errorMessage: '',
        isEnrollmentSuccess: false
        
    }
    componentDidMount = () => {
        this.getURLParams()
            .then( res => {
                console.log('Result ', res);
                const courseYear = res.courseYear;
                const courseID = res.courseID;
                this.setState({
                    courseYear: courseYear,
                    courseID: courseID
                });
                return this.checkCourseYearAvailable(courseYear);
            })
            .then( res => {
                console.log('Result ', res);
                const { courseYear, courseID } = this.state;
                return this.checkCourseAvailable(courseYear, courseID);
            })
            .then( res => {
                console.log('Result ', res);
                this.setState({ isLoadingComplete: true });
            })
            .catch( err => {
                console.error(err);
                this.setState({
                    errorMessage: err,
                    isLoadingComplete: true,
                    isError: true
                });
            })
        
    }
    updateInput = (event) => {
        this.setState({
          [event.target.id]: event.target.value
        });
        console.log(event.target.id,':',event.target.value)
    }

    getURLParams = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const courseID = searchParams.get('courseID');
        const courseYear = searchParams.get('courseYear');
        return new Promise ((resolve, reject) => {
            const isCourseYearUnfound = courseYear === '' || courseYear === null;
            const isCourseIDUnfound = courseID === '' || courseID === null;
            if (isCourseYearUnfound && isCourseIDUnfound) {
                reject('Not found courseYear and courseID parameters. Please visit homepage and try to enroll again.');
            } else if (isCourseYearUnfound) {
                reject('Not found courseYear parameters. Please visit homepage and try to enroll again.');
            } else if (isCourseIDUnfound ){
                reject('Not found courseID parameters. Please visit homepage and try to enroll again.');
            } else {
                resolve({ courseYear: courseYear, courseID: courseID})
            }
        })
    }
    
    checkCourseYearAvailable = (courseYear) => {
        const db = firebase.firestore();
        const configRef = db.collection('systemConfig').doc('config');
        return new Promise ((resolve, reject) => {
            configRef.get()
                .then(doc => {
                    if (doc.exists) {
                        const courseYearArr = doc.data().courseYears;
                        let isCourseYearExists = false;
                        let isCourseYearAvailable = false;
                        for (let i = 0; i < courseYearArr.length; i++) {
                            if(courseYearArr[i].year === courseYear) {
                                isCourseYearAvailable = courseYearArr[i].available;
                                isCourseYearExists = true;
                            }
                        }
                        if (!isCourseYearExists) {
                            reject(`Course year ${courseYear} has not been found in the system.`)
                        } else if (isCourseYearAvailable) {
                            resolve({ isCourseYearAvailable:isCourseYearAvailable });
                        } else {
                            reject(`Courses in course year ${courseYear} is not available to enroll.`);
                        }
                    } else {
                        reject('The system has not been initialized.');
                    }
                })
                .catch(err => {
                    const errorMessage = 'Firebase Error.';
                    reject(errorMessage);
                    console.error(err);
                })
        })
    }

    checkCourseAvailable = (courseYear, courseID) => {
        const db = firebase.firestore();
        const courseRef = db.collection(courseYear).doc('course').collection('course').doc(courseID);
        return new Promise ((resolve, reject) => {
            courseRef.get()
                .then(doc => {
                    if (doc.exists) {
                        const {courseCapacity, courseEnrolled, courseName} = doc.data();
                        if (courseEnrolled < courseCapacity) {
                            this.setState({ courseName: courseName });
                            resolve({ isCourseAvailable: true, courseDoc: doc.data()});
                        } else {
                            reject(`Course ${courseID} in course year ${courseYear} has reached its capacity, therefore it is not available to enroll.`);
                        }
                    } else {
                        this.setState({ isEnrollmentAvailable: false });
                        reject(`Course ${courseID} in course year ${courseYear} has not been found in database.`);
                    }
                })
                .catch(err => {
                    this.setState({ isEnrollmentAvailable: false });
                    reject(err);
                })
        })
    }

    validateCourse = (courseYear, courseID) => {
        const db = firebase.firestore();
        const courseValidateRef = db.collection(courseYear).doc('course').collection('courseValidate').doc(courseID);
        const checkCourseAvailable = this.checkCourseAvailable;
        const arraysEqual = (arr1, arr2) => {
            if (arr1 === arr2) return true;
            if (arr1 == null || arr2 == null) return false;
            arr1.sort((a, b) => a - b);
            arr2.sort((a, b) => a - b);
            for (let i = 0; i < arr1.length; i++) {
                if (arr1[i] !== arr2[i]) return false;
            }
            return true;
        }
        return new Promise ((resolve, reject) => {
            checkCourseAvailable(courseYear, courseID)
                .then( res => {
                    const course = res.courseDoc;
                    courseValidateRef.get()
                        .then(courseValidate => {
                            const validateCourseCapacity = courseValidate.data().courseCapacity === course.courseCapacity;
                            const validateCourseGrade = arraysEqual(courseValidate.data().courseGrade, course.courseGrade);
                            console.log('Validate capacity ', validateCourseCapacity);
                            console.log('Validate grade ', validateCourseGrade);
                            if (validateCourseCapacity && validateCourseGrade) {
                                resolve({ isCourseValid: true, courseDoc: course });
                            } else {
                                const err = `Technical issue has been found in the system. The data of course ${courseID} in course year ${courseYear} is not valid. Please contact admin for more infomation.`;
                                reject(err);
                            }
                        })
                        .catch( err => {
                            const errorMessage = 'Firebase Error.';
                            reject(errorMessage);
                            console.error(err);
                        })
                })
                .catch( err => {
                    reject(err);
                })
        })
    }

    checkStudentGrade = (studentData, courseDoc, courseYear) => {
        const { studentGrade } = studentData;
        const { courseID, courseName, courseGrade } = courseDoc;
        return new Promise ((resolve, reject) => {
            let isStudentGradeValid = false;
            for (let i = 0; i < courseGrade.length; i++) {
                if (parseInt(studentGrade) === courseGrade[i]) {
                    isStudentGradeValid = true;
                }
            }
            if (isStudentGradeValid) {
                resolve({ isStudentGradeValid: true });
            } else {
                const err = `${courseName} (${courseID}) in course year ${courseYear} is only available for students at grade ${courseGrade.join(', ')}.`;
                reject(err);
            }
        })
    }

    checkStudentID = (courseYear, studentID) => {
        const db = firebase.firestore();
        const studentRef = db.collection(courseYear).doc('student').collection('student').doc(studentID);
        return new Promise ((resolve, reject) => {
            studentRef.get()
                .then( doc => {
                    if (!doc.exists) {
                        resolve({ isStudentIDValid: true });
                    } else {
                        const student = doc.data();
                        const err = `Student with ID ${student.studentID} (as ${student.nameFirst} ${student.nameLast}) has already enrolled in a course in course year ${courseYear}.`
                        reject(err);
                    }
                })
                .catch( err => {
                    const errorMessage = 'Firebase Error.';
                    reject(errorMessage);
                    console.error(err);
                })
        })
    }

    addStudentData = (courseYear, courseDoc, studentData) => {
        const { studentID } = studentData;
        const course = courseDoc;
        const db = firebase.firestore();
        const studentRef = db.collection(courseYear).doc('student').collection('student').doc(studentID);
        const courseRef = db.collection(courseYear).doc('course').collection('course').doc(course.courseID);
        return new Promise ((resolve, reject) => {
            studentRef.set(studentData)
                .then(() => {
                    const updateCourseEnrolled = course.courseEnrolled + 1;
                    courseRef.update({ courseEnrolled: updateCourseEnrolled })
                        .then(() => {
                            resolve({ isAddStudentDataComplete: true });
                        })
                        .catch( err => {
                            reject(err);
                        })
                })
                .catch( err => {
                    reject(err);
                })
        })
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
        
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const studentData = {
            studentID: studentID,
            nameTitle: nameTitle,
            nameFirst: nameFirst,
            nameLast: nameLast,
            studentGrade: parseInt(studentGrade),
            studentClass: parseInt(studentClass),
            studentRoll: parseInt(studentRoll),
            enrolledCourse: courseID,
            timestamp: timestamp
        }

        let courseDoc = []
        this.setState({ isLoadingComplete: false });
        this.validateCourse(courseYear, courseID)
            .then( res => {
                courseDoc = res.courseDoc;
                return this.checkStudentGrade(studentData, courseDoc, courseYear);
            })
            .then( res => {
                return this.checkStudentID(courseYear, studentID);
            })
            .then( res => {
                return this.addStudentData(courseYear, courseDoc, studentData);
            })
            .then( res => {
                this.setState({
                    isLoadingComplete: true,
                    isEnrollmentSuccess: true,
                    studentData: studentData
                });
            })
            .catch( err => {
                console.error(err);
                this.setState({
                    isLoadingComplete: true,
                    isError: true,
                    errorMessage: err
                });
            })
    }

    goBack = () => {
        window.history.back();
    }

    enrollmentForm = () => {
        const { 
            studentID,
            nameFirst,
            nameLast,
            studentGrade,
            studentClass,
            studentRoll
        } = this.state;
        const enrollCourse = this.enrollCourse;
        const updateInput = this.updateInput;
        const goBack = this.goBack;
        return (
            <form onSubmit={enrollCourse}>
                <div className="form-group">
                    <label htmlFor="studentID">Student ID</label>
                    <input type="text" className="form-control" id="studentID" placeholder="Student ID" onChange={updateInput} value={studentID} required/>
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
                    <input type="text" className="form-control" id="nameFirst" placeholder="First Name" onChange={updateInput} value={nameFirst} required/>
                </div>
                <div className="form-group">
                    <label htmlFor="nameLast">Last Name</label>
                    <input type="text" className="form-control" id="nameLast" placeholder="Last Name" onChange={updateInput} value={nameLast} required/>
                </div>
                <div className="form-group">
                    <label htmlFor="studentGrade">Grade</label>
                    <input type="number" pattern="[0-9]*" className="form-control" id="studentGrade" placeholder="Grade" onChange={updateInput} value={studentGrade} required/>
                </div>
                <div className="form-group">
                    <label htmlFor="studentClass">Class</label>
                    <input type="number" pattern="[0-9]*" className="form-control" id="studentClass" placeholder="Class" onChange={updateInput} value={studentClass} required/>
                </div>
                <div className="form-group">
                    <label htmlFor="studentRoll">Roll</label>
                    <input type="number" pattern="[0-9]*" className="form-control" id="studentRoll" placeholder="Roll Number" onChange={updateInput} value={studentRoll} required/>
                </div>
                <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="chkConfirm" required />
                    <label className="form-check-label" htmlFor="chkConfirm">Confirm</label>
                </div>
                <br/>
                <button type="submit" className="btn btn-purple">Enroll</button>
                <button onClick={goBack} className="btn btn-secondary ml-2">Back</button>
            </form>
        );
    }

    render(){
        const { 
            isLoadingComplete,
            isError,
            isEnrollmentSuccess,
            errorMessage
        } = this.state;

        if (!isLoadingComplete) {
            return (
                <LoadingPage/>
            )
        } else if (isError) {
            return (
                <ErrorPage errorMessage={errorMessage} btn={'back'}/>
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
                        <Footer/>
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
                        <Footer/>
                    </div>
                ) 
            }
            
        }
    }
}

export default Enroll;