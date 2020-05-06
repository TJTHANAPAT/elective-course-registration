import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import LoadingPage from './Loading';
import Footer from './Footer';
import ErrorPage from './ErrorPage';

class CreateCourse extends React.Component {
    state = {
        courseName:'',
        courseID:'',
        courseCapacity:'',
        courseTeacher:'',
        courseGrade:[],
        gradesArr:[],
        isLoadingComplete:false
    }

    componentDidMount = () => {

        this.getURLParam('courseYear')
            .then( res => {
                const courseYear = res;
                this.setState({ courseYear:courseYear });
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

    getURLParam = (parameter) => {
        const searchParams = new URLSearchParams(window.location.search);
        const param = searchParams.get(parameter);
        return new Promise ((resolve, reject) => {
            if (param === '') {
                reject(`Parameter with key '${parameter}' is found but it is blank.`);
            } else if (param === null) {
                reject(`Parameter with key '${parameter}' is not found in url.`);
            } else {
                resolve(param)
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

    addCourseData = (courseYear, courseData) => {
        const { courseID, courseGrade, courseCapacity } = courseData;
        const db = firebase.firestore();
        const courseRef = db.collection(courseYear).doc('course').collection('course').doc(courseID)
        const courseValidateRef = db.collection(courseYear).doc('course').collection('courseValidate').doc(courseID)
        const courseValidate = {
            courseID: courseID,
            courseGrade: courseGrade,
            courseCapacity: parseInt(courseCapacity)
        }
        return new Promise ((resolve, reject) => {
            courseRef.get()
                .then( doc => {
                    if (doc.exists) {
                        const { courseID, courseName }= doc.data();
                        const err = `Course with ID '${courseID}' (${courseName}) has already been created in course year ${courseYear}.)`;
                        reject(err);
                    } else {
                        courseRef.set(courseData)
                            .then( () => {
                                courseValidateRef.set(courseValidate)
                                    .then( ()=> {
                                        console.log(`Course ${courseID} has been added to database in course year ${courseYear} successfully!`)
                                        resolve(true);
                                    })
                                    .catch( err => {
                                        console.error(err);
                                        const errorMessage = 'Firebase failed adding course data to database (courseValidateRef).'
                                        reject(errorMessage)
                                    })
                            })
                            .catch( err => {
                                console.error(err);
                                const errorMessage = 'Firebase failed adding course data to database (courseRef).'
                                reject(errorMessage)
                            })
                    }
                })
        })
    }

    createCourse = (event) => {
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
            this.addCourseData(courseYear, courseData)
                .then( () => {
                    this.setState({
                        courseName:'',
                        courseID:'',
                        courseGrade:[],
                        courseCapacity:'',
                        courseTeacher:'',
                        isLoadingComplete:true
                    });
                    let checkboxes = document.getElementsByName('courseGradeCheckBox')
                    for (let i = 0; i < checkboxes.length; i++) {
                        const checkbox = checkboxes[i];
                        checkbox.checked = false;
                    }
                    alert(`${courseName} (${courseID}) has been created successfully!`);
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

    createCourseForm = () => {
        return (
            <form onSubmit={this.createCourse}>
                <div className="form-group">
                    <label htmlFor="courseName">Course Name</label>
                    <input type="text" className="form-control" id="courseName" placeholder="Course Name" onChange={this.updateInput} value={this.state.courseName} required/>
                </div>
                <div className="form-group">
                    <label htmlFor="courseID">Course ID</label>
                    <input type="text" className="form-control" id="courseID" placeholder="Course ID" onChange={this.updateInput} value={this.state.courseID} required/>
                </div>
                <div className="form-group">
                    <label htmlFor="courseTeacher">Course Teacher</label>
                    <input type="text" className="form-control" id="courseTeacher" placeholder="Course Teacher" onChange={this.updateInput} value={this.state.courseTeacher} required/>
                </div>
                <div className="form-group">
                    <label htmlFor="courseGrade">Course Grade</label><br/>
                    <i>This course is available for students at which grade</i>
                    {this.gradeSelector()}
                </div>
                
                
                <div className="form-group">
                    <label htmlFor="courseCapacity">Course Capacity</label>
                    <input type="number" className="form-control" id="courseCapacity" placeholder="Course Capacity" onChange={this.updateInput} value={this.state.courseCapacity} required/>
                </div>

                <button type="submit" className="btn btn-purple">Create</button> <button onClick={this.goBack} className="btn btn-secondary">Back</button> 
            </form>
        )
    }

    render(){
        const { isLoadingComplete, isError, errorMessage } = this.state;
        if (!isLoadingComplete) {
            return <LoadingPage/>
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'back'}/>
        } else {
            const { courseYear } = this.state
            return (
                <div className="body bg-gradient">
                    <div className="wrapper">
                        <h1>Elective Course Enrollment System</h1>
                        <h2>Create Course</h2>
                        <p>Creating a course for course year {courseYear}.</p>
                        {this.createCourseForm()}
                    </div>
                    <Footer/>
                </div>
            )
        }
    }
}

export default CreateCourse;