import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';

class CreateCourse extends React.Component {
    state = {
        courseName:'',
        courseID:'',
        courseCapacity:'',
        courseTeacher:'',
        courseGrade:[],
        gradeArr:[],
        isLoadingComplete:false
    }

    componentDidMount = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const courseYear = searchParams.get('courseYear');
        this.setState({courseYear:courseYear});
        
        const db = firebase.firestore();
        const configRef = db.collection(courseYear).doc('config')
        configRef.get()
            .then(doc => {
                if(doc.exists){
                    this.setState({gradeArr:doc.data().grades});
                } else {
                    console.error('No config has been initialized.')
                }
                this.setState({isLoadingComplete: true})
                
                
            })
            .catch(err => { 
                console.error('Error: ', err)
            })
    }

    updateInput = (event) => {
        this.setState({
          [event.target.id]: event.target.value
        });
    }

    updateCourseGrade = (event) => {
        if(event.target.checked){
            console.log(`Checked Grade ${event.target.value}`)
            const gradeArr = this.state.courseGrade
            gradeArr.push(parseInt(event.target.value))
            gradeArr.sort((a, b) => a - b)
            this.setState({courseGrade:gradeArr})
            console.log(this.state.courseGrade)
        } else {
            console.log(`Unchecked Grade ${event.target.value}`)
            const gradeArr = this.state.courseGrade
            for( var i = 0; i < gradeArr.length; i++){
                if ( gradeArr[i] === parseInt(event.target.value)) {
                    gradeArr.splice(i, 1);
                }
            }
            this.setState({courseGrade:gradeArr})
            console.log(this.state.courseGrade)
        }
    }

    createCourse = (event) => {
        event.preventDefault();
        const {courseYear} = this.state;
        const db = firebase.firestore();
        const courseRef = db.collection(courseYear).doc('course').collection('course')
        const courseValidateRef = db.collection(courseYear).doc('course').collection('courseValidate')
        
        const {
            courseName,
            courseID,
            courseTeacher,
            courseGrade,
            courseCapacity
        } = this.state
        const course = {
            courseName: courseName,
            courseID: courseID,
            courseGrade: courseGrade,
            courseTeacher: courseTeacher,
            courseCapacity: parseInt(courseCapacity),
            courseEnrolled:0
        }
        const courseValidate = {
            courseID: courseID,
            courseGrade: courseGrade,
            courseCapacity: parseInt(courseCapacity)
        }
        if (courseGrade.length !== 0) {
            courseRef.doc(courseID).set(course)
            .then(() => {
                courseValidateRef.doc(courseID).set(courseValidate)
                    .then(() => {
                        console.log(`Course: ${courseName} (${courseID}) has been added succesfully!`);
                        alert(`Course: ${courseName} (${courseID}) has been added succesfully!`)
                        this.setState({
                            courseName:'',
                            courseID:'',
                            courseGrade:[],
                            courseCapacity:'',
                            courseTeacher:''
                        });
                        let checkboxes = document.getElementsByName('courseGradeCheckBox')
                        for (let i = 0; i < checkboxes.length; i++) {
                            const checkbox = checkboxes[i];
                            checkbox.checked = false;
                        }
                    })
                    .catch(err => {
                        console.error('Error: ', err)
                    })
            })
            .catch(err => {
                console.error('Error: ', err)
            })
        } else {
            alert('You must select at least one grade for CourseGrade')
        }
        
    }

    goBack = () => {
        window.history.back();
    }

    uncheckAll = (event) => {
        event.preventDefault();
        let checkboxes = document.getElementsByName('courseGradeCheckBox')
        for (let i = 0; i < checkboxes.length; i++) {
            const checkbox = checkboxes[i];
            checkbox.checked = false;
        }
    }
    checkAll = (event) => {
        event.preventDefault();
        let checkboxes = document.getElementsByName('courseGradeCheckBox')
        for (let i = 0; i < checkboxes.length; i++) {
            const checkbox = checkboxes[i];
            checkbox.checked = true;
        }
    }

    render(){
        const {gradeArr, courseYear, isLoadingComplete} = this.state
        let gradeSelector = gradeArr.map( (grade,i)=>{
            return (
                <div className="form-check" key={i}>
                    <input className="form-check-input" type="checkbox" name="courseGradeCheckBox" value={grade} id={`grade-${grade}`} onChange={this.updateCourseGrade}/>
                    <label className="form-check-label" htmlFor={`grade-${grade}`}>
                        Grade {grade}
                    </label>
                </div>
            )
        })

        if (isLoadingComplete) {
            if (gradeArr.length !== 0) {
                return (
                    <div className="wrapper">
                        <h1>Create Course</h1>
                        <p>Creating a course for course year {courseYear}</p>
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
                                <label htmlFor="courseGrade">Course Grade: This course is available for students at which grade</label>
                                {gradeSelector}
                                <button onClick={this.checkAll} className="btn btn-secondary btn-sm">Check All</button> 
                                <button onClick={this.uncheckAll} className="btn btn-secondary btn-sm ml-1">Uncheck</button> 
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="courseTeacher">Course Teacher</label>
                                <input type="text" className="form-control" id="courseTeacher" placeholder="Course Teacher" onChange={this.updateInput} value={this.state.courseTeacher} required/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="courseCapacity">Course Capacity</label>
                                <input type="number" className="form-control" id="courseCapacity" placeholder="Course Capacity" onChange={this.updateInput} value={this.state.courseCapacity} required/>
                            </div>
        
                            <button type="submit" className="btn btn-primary">Create</button> <button onClick={this.goBack} className="btn btn-secondary">Back</button> 
                        </form>
                    </div>
                )
            } else {
                return (
                    <div className="wrapper">
                        <h1>Create Course</h1>
                        <p>You have to config grade(s) for course year {courseYear} first in order to create a new course.</p>
                        <button onClick={this.goBack} className="btn btn-secondary mt-2">Back</button>
                    </div>
                )
                
            }
            
        } else {
            return (
                <p>Loading...</p>
            )
        }
        
        
    }
}

export default CreateCourse;