import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import LoadingPage from './Loading';
import Footer from './Footer';
import ErrorPage from './ErrorPage';

class EditCourse extends React.Component {
    state = {
        isLoadingComplete:false
    }

    componentDidMount = () => {

        this.getURLParams()
            .then( res => {
                const courseYear = res.courseYear;
                const courseID = res.courseID
                this.setState({ courseYear:courseYear });
                return this.getCourseData(courseYear, courseID);
            })
            .then( course => {
                this.setState({
                    courseName: course.courseName,
                    courseID: course.courseID,
                    courseCapacity: course.courseCapacity,
                    courseTeacher: course.courseTeacher,
                    courseGrade: course.courseGrade,
                })
                return this.getSystemConfig();
            })
            .then( res => {
                const systemConfig = res;
                const { courseYear } = this.state;
                return this.getCourseYearGrades(courseYear, systemConfig);
            })
            .then( res => {
                this.setState({
                    gradesArr: res,
                    isLoadingComplete: true
                })
                this.setCheckBoxGrade();
            })
            .catch( err => {
                console.error(err);
                this.setState({
                    isLoadingComplete: true,
                    isError: true,
                    errorMessage: err
                })
            })
    }

    updateInput = (event) => {
        this.setState({
          [event.target.id]: event.target.value
        });
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

    getSystemConfig = () => {
        const db = firebase.firestore();
        const configRef = db.collection('systemConfig').doc('config')
        return new Promise ((resolve, reject) => {
            configRef.get()
                .then(doc => {
                    if (doc.exists) {
                        resolve(doc.data());
                    } else {
                        const err = 'No system config has been initilized.';
                        reject(err);
                        
                    }
                })
                .catch(err => {
                    const errorMessage = 'Firebase failed getting system config.';
                    reject(errorMessage);
                    console.error(err);
                })
        })
    }
    checkCourseYearExist = (courseYear, systemConfigDoc) => {
        let isCourseYearExist = false;
        const courseYearArr = systemConfigDoc.courseYears;
        for (let i = 0; i < courseYearArr.length; i++) {
            if (courseYearArr[i].year === courseYear) {
                isCourseYearExist = true
            }
        }
        return isCourseYearExist;
    }
    getCourseYearGrades = (courseYear, systemConfig) => {
        const db = firebase.firestore();
        const configRef = db.collection(courseYear).doc('config')
        return new Promise ((resolve, reject) => {
            if (this.checkCourseYearExist(courseYear, systemConfig)) {
                configRef.get()
                    .then( doc => {
                        if (doc.exists) {
                            const gradesArr = doc.data().grades;
                            if (gradesArr !== 0) {
                                resolve(gradesArr);
                            } else {
                                const err = `No gradesArr of Course Year ${courseYear} has been found in database.`
                                reject(err);
                            }
                        } else {
                            const err = `No config of Course Year ${courseYear} has been found in database.`;
                            resolve(err);
                        }
                    })
                    .catch( err => { 
                        const errorMessage = 'Firebase failed getting course year config.';
                        reject(errorMessage);
                        console.error(err);
                    })
            } else {
                const err = `No course year ${courseYear} has been found in database`;
                reject(err);
            }
            
        })
        
    }
    getCourseData = (courseYear, courseID) => {
        const db = firebase.firestore();
        const courseRef = db.collection(courseYear).doc('course').collection('course').doc(courseID)
        return new Promise((resolve, reject) => {
            courseRef.get()
                .then( doc => {
                    if (doc.exists) {
                        resolve(doc.data());
                    } else {
                        const err = `Course ${courseID} in ${courseYear} has not been found in database.`
                        reject(err);
                    }
                })
                .catch( err => { 
                    const errorMessage = `Firebase failed getting course data of course ${courseID} in ${courseYear}.`;
                    reject(errorMessage);
                    console.error(err);
                })
        })
    }
    setCheckBoxGrade = () => {
        const courseGradeArr = this.state.courseGrade;
        let checkboxes = document.getElementsByName('courseGradeCheckBox')
        for (let i = 0; i < courseGradeArr.length; i++) {
            const grade = courseGradeArr[i];
            for (let j = 0; j < checkboxes.length; j++) {
                const checkbox = checkboxes[j];
                if (grade === parseInt(checkbox.value)) {
                    checkbox.checked = true;
                }
            }
        }
    }

    updateCourseData = (courseYear, courseData) => {
        const {
            courseName,
            courseID,
            courseTeacher,
            courseGrade,
            courseCapacity
        } = courseData
        
        const db = firebase.firestore();
        const courseRef = db.collection(courseYear).doc('course').collection('course').doc(courseID)
        const courseValidateRef = db.collection(courseYear).doc('course').collection('courseValidate').doc(courseID)
        const courseDataUpdate = {
            courseName: courseName,
            courseGrade: courseGrade,
            courseTeacher: courseTeacher,
            courseCapacity: parseInt(courseCapacity),
        }
        const courseValidate = {
            courseGrade: courseGrade,
            courseCapacity: parseInt(courseCapacity)
        }
        return new Promise ((resolve, reject) => {
            courseRef.update(courseDataUpdate)
                .then( () => {
                    courseValidateRef.update(courseValidate)
                    .then( () => {
                        console.log(`Course ${courseID} in course year ${courseYear} has been updated successfully!`)
                        resolve(true);
                    })
                    .catch( err => {
                        console.error(err);
                        const errorMessage = 'Firebase failed updating course data to database (courseValidateRef).';
                        reject(errorMessage)
                    })
                })
                .catch( err => {
                    console.error(err);
                    const errorMessage = 'Firebase failed updating course data to database (courseRef).';
                    reject(errorMessage);
                })
        })
    }

    updateCourse = (event) => {
        event.preventDefault();
        const {
            courseYear,
            courseName,
            courseID,
            courseTeacher,
            courseGrade,
            courseCapacity
        } = this.state
        const courseData = {
            courseName: courseName,
            courseID: courseID,
            courseGrade: courseGrade,
            courseTeacher: courseTeacher,
            courseCapacity: parseInt(courseCapacity),
            courseEnrolled: 0
        }
        if (courseGrade.length !== 0) {
            this.setState({ isLoadingComplete:false });
            this.updateCourseData(courseYear, courseData)
                .then( () => {
                    this.setState({
                        isLoadingComplete:true
                    });
                    this.setCheckBoxGrade();
                    alert(`${courseName} (${courseID}) has been updated successfully!`);
                })
                .catch( err => {
                    console.error(err);
                    this.setState({
                        isLoadingComplete: true,
                        isError: true,
                        errorMessage: err
                    })
                })
        } else {
            alert('You must select at least one grade.');
        }
    }

    goBack = () => {
        window.history.back();
    }

    updateCourseGrade = (event) => {
        const courseGradeArr = this.state.courseGrade
        if (event.target.checked) {
            console.log(`Checked Grade ${event.target.value}`)
            courseGradeArr.push(parseInt(event.target.value))
            courseGradeArr.sort((a, b) => a - b)
            this.setState({ courseGrade:courseGradeArr })
        } else {
            console.log(`Unchecked Grade ${event.target.value}`)
            for( var i = 0; i < courseGradeArr.length; i++){
                if (courseGradeArr[i] === parseInt(event.target.value)) {
                    courseGradeArr.splice(i, 1);
                }
            }
            this.setState({ courseGrade:courseGradeArr })
        }
        console.log('Current GradesArr: ', this.state.gradesArr);
        console.log('Current Course Grade: ', this.state.courseGrade);
    }

    uncheckAll = (event) => {
        event.preventDefault();
        let checkboxes = document.getElementsByName('courseGradeCheckBox')
        for (let i = 0; i < checkboxes.length; i++) {
            const checkbox = checkboxes[i];
            checkbox.checked = false;
        }
        const courseGrade = [];
        this.setState({ courseGrade: courseGrade });
        console.log('Uncheck All');
        console.log('Current GradesArr: ', this.state.gradesArr);
        console.log('Current Course Grade: ', courseGrade);
    }

    gradeSelector = () => {
        const { gradesArr } = this.state
        let gradeSelector = gradesArr.map((grade, i) => {
            return (
                <div className="form-check" key={i}>
                    <input className="form-check-input" type="checkbox" name="courseGradeCheckBox" value={grade} id={`grade-${grade}`} onChange={this.updateCourseGrade}/>
                    <label className="form-check-label" htmlFor={`grade-${grade}`}>
                        Grade {grade}
                    </label>
                </div>
            )
        })
        return (
            <div>
                {gradeSelector}
                <button onClick={this.uncheckAll} className="btn btn-green btn-sm mt-1">Uncheck All</button> 
            </div>
        );
    }

    updateCourseForm = () => {
        return (
            <form onSubmit={this.updateCourse}>
                <div className="form-group">
                    <label htmlFor="courseID">Course ID</label>
                    <input type="text" className="form-control" id="courseID" placeholder="Course ID" onChange={this.updateInput} value={this.state.courseID} required disabled/>
                </div>
                <div className="form-group">
                    <label htmlFor="courseName">Course Name</label>
                    <input type="text" className="form-control" id="courseName" placeholder="Course Name" onChange={this.updateInput} value={this.state.courseName} required/>
                </div>
                <div className="form-group">
                    <label htmlFor="courseTeacher">Course Teacher</label>
                    <input type="text" className="form-control" id="courseTeacher" placeholder="Course Teacher" onChange={this.updateInput} value={this.state.courseTeacher} required/>
                </div>
                <div className="form-group">
                    <label htmlFor="courseGrade">Course Grade</label><br/>
                    <i>This course is available for students at</i>
                    {this.gradeSelector()}
                </div>
                
                
                <div className="form-group">
                    <label htmlFor="courseCapacity">Course Capacity</label>
                    <input type="number" className="form-control" id="courseCapacity" placeholder="Course Capacity" onChange={this.updateInput} value={this.state.courseCapacity} required/>
                </div>

                <button type="submit" className="btn btn-purple">Save</button>
                <button onClick={this.initDeleteCourse} className="btn btn-danger ml-2">Delete</button>
                <button onClick={this.goBack} className="btn btn-secondary ml-2">Back</button> 
            </form>
        )
    }

    initDeleteCourse = () => {
        this.setState({ isDeleteCourse:true });
    }
    confirmDeleteCourseForm = () => {
        const { courseID, isDeleteCourseConfirm } = this.state;
        const setTimeOutThenDo = (timeout, callback) => {
            setTimeout(()=>{
                callback()
            }, timeout)
        }
        let handleChangeConfirmDelete = (event) => {
            const iconConfirmStatus = document.getElementById('iconConfirmStatus')
            iconConfirmStatus.className = 'fa fa-circle-o-notch fa-spin fa-fw';
            this.setState({ isDeleteCourseConfirm:false });
            const confirmText = event.target.value
            setTimeOutThenDo(300,()=>{
                if (confirmText === courseID) {
                    iconConfirmStatus.className = 'fa fa-check fa-fw';
                    this.setState({ isDeleteCourseConfirm:true });
                } else {
                    iconConfirmStatus.className = 'fa fa-times fa-fw';
                    this.setState({ isDeleteCourseConfirm:false });
                }
            })
        }
        let btnDeleteCourse = () => {
            if (isDeleteCourseConfirm) {
                return <button className="btn btn-danger" type="submit">Delete</button>
            } else {
                return <button className="btn btn-danger" disabled>Delete</button>
            }
        }
        let cancelDeleteProcess = () => {
            this.setState({ isDeleteCourse:false });
        }
        return (
            <form onSubmit={this.deleteCourse} autoComplete="off"> 
                <span>Type '{courseID}' to confirm</span>
                <div className="input-group mt-2">
                    <div className="input-group-prepend">
                        <div className="input-group-text"><i id="iconConfirmStatus" className="fa fa-times fa-fw"></i></div>
                    </div>
                    <input type="text" className="form-control" id="confirmDeleteCourse" placeholder={courseID} onChange={handleChangeConfirmDelete} value={this.state.confirmDeleteCourse} required />
                </div>
                <div className="mt-2">
                    {btnDeleteCourse()}
                    <button className="btn btn-secondary ml-2" onClick={cancelDeleteProcess} type="button">Back</button>
                </div>
            </form>
        )
    }
    deleteCourseData = (courseYear, courseID) => {
        const db = firebase.firestore();
        const courseRef = db.collection(courseYear).doc('course').collection('course').doc(courseID)
        return new Promise ((resolve, reject) => {
            courseRef.delete()
                .then( () => {
                    resolve()
                })
                .catch( err => {
                    console.error(err);
                    const errorMessage = 'Firebase failed deleting course data from database (courseRef).';
                    reject(errorMessage);
                })
        })
    }
    deleteCourseValidateData = (courseYear, courseID) => {
        const db = firebase.firestore();
        const courseValidateRef = db.collection(courseYear).doc('course').collection('courseValidate').doc(courseID)
        return new Promise ((resolve, reject) => {
            courseValidateRef.delete()
                .then( () => {
                    resolve()
                })
                .catch( err => {
                    console.error(err);
                    const errorMessage = 'Firebase failed deleting course data from database (courseValidateRef).';
                    reject(errorMessage);
                })
        })
    }
    deleteStudentIndividual = (courseYear, studentID) => {
        const db = firebase.firestore();
        const studentRef = db.collection(courseYear).doc('student').collection('student').doc(studentID);
        return new Promise ((resolve, reject) => {
            studentRef.delete()
                .then( () => {
                    console.log(`Student with ID '${studentID}' has been deleted successfully!`)
                    resolve();
                })
                .catch( err => {
                    console.error(err);
                    const errorMessage = `Firebase failed deleting student data of student ID '${studentID}' from database.`;
                    reject(errorMessage);
                })
        })
    }

    deleteCourseStudents = (courseYear, studentsIDArr) => {
        return new Promise((resolve, reject) => {
            studentsIDArr.map( studentID => {
                this.deleteStudentIndividual(courseYear, studentID)
                    .catch( err => { reject(err); })
            })
            resolve(true);
        })
    }
    getCourseStudentsID = (courseYear, courseID) => {
        const db = firebase.firestore();
        const studentRef = db.collection(courseYear).doc('student').collection('student').where('enrolledCourse','==',courseID);
        return new Promise ((resolve, reject) => {
            studentRef.get()
                .then( querySnapshot => {
                    let studentsIDArr = [];
                    querySnapshot.forEach( doc => {
                        studentsIDArr.push(doc.data().studentID);
                    });
                    resolve(studentsIDArr);
                })
                .catch( err => {
                    console.error(err);
                    const errorMessage = `Firebase failed getting student data of course ${courseID} in ${courseYear}.`
                    reject(errorMessage)
                })
        })
    }
    deleteCourse = (event) => {
        event.preventDefault();
        const { courseYear, courseID } = this.state;
        let studentsIDArr = [];
        this.setState({ isLoadingComplete: false });
        this.getCourseStudentsID(courseYear, courseID)
            .then( res => {
                studentsIDArr = res
                return this.deleteCourseData(courseYear, courseID);
            })
            .then( () => {
                return this.deleteCourseValidateData(courseYear, courseID);
            })
            .then( () => {
                return this.deleteCourseStudents(courseYear, studentsIDArr);
            })
            .then( res => {    
                console.log('Student in this course ',studentsIDArr);
                this.setState({
                    isLoadingComplete: true,
                    isDeleteCourseComplete: true
                });
            })
            .catch( err => {
                console.error(err);
                this.setState({
                    isLoadingComplete: true,
                    isError: true,
                    errorMessage: err
                })
            })
    }

    render(){
        const { isLoadingComplete, isError, errorMessage, isDeleteCourse, isDeleteCourseComplete} = this.state;
        if (!isLoadingComplete) {
            return <LoadingPage/>
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'back'}/>
        } else if (isDeleteCourseComplete) {
            const { courseID, courseName, courseYear } = this.state
            return (
                <div className="body body-center bg-gradient">
                    <div className="wrapper">
                        <div className="row align-items-center">
                            <div className="col-sm-3 text-center mb-3">
                                <i className="fa fa-trash-o fa-5x" aria-hidden="false"></i>
                            </div>
                            <div className="col-sm-9 text-left">
                                <h2>Complete Deleting {courseName} ({courseID})</h2>
                                <p>{courseName} ({courseID}) in course year {courseYear}, 
                                along with data of students enrolling in this course, has been deleted!</p>
                            </div>
                        </div>
                        <button className="btn btn-wrapper-bottom btn-green" onClick={this.goBack}>Back</button>
                    </div>
                    <Footer/>
                </div>
            )
        } else if (isDeleteCourse) {
            const { courseID, courseName, courseYear } = this.state
            return (
                <div className="body body-center bg-gradient">
                    <div className="wrapper">
                        <div className="row align-items-center">
                            <div className="col-sm-3 text-center mb-3">
                                <i className="fa fa-exclamation-triangle fa-5x" aria-hidden="false"></i>
                            </div>
                            <div className="col-sm-9 text-left">
                                <h2>Deleting {courseName} ({courseID})</h2>
                                <p>This action cannot be undone. You are deleting {courseName} ({courseID}) in course year {courseYear}. 
                                After deleting, data of students enrolling in this course will be wiped too. 
                                Please confirm that you are willing to continue.</p>
                                {this.confirmDeleteCourseForm()}
                            </div>
                        </div>
                    </div>
                    <Footer/>
                </div>
            )
        } else {
            const { courseID, courseYear } = this.state
            return (
                <div className="body bg-gradient">
                    <div className="wrapper">
                        <h1>Elective Course Enrollment System</h1>
                        <h2>Edit Course</h2>
                        <p>Editing course {courseID} in course year {courseYear}.</p>
                        {this.updateCourseForm()}
                    </div>
                    <Footer/>
                </div>
            )
        }
    }
}

export default EditCourse;