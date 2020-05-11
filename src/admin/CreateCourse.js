import React from 'react';
import 'firebase/firestore';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';

import * as auth from './functions/authenticationFuctions';
import * as system from '../functions/systemFunctions';
import createCourse from './functions/createCourseFunction';

class CreateCourse extends React.Component {
    state = {
        courseName: '',
        courseID: '',
        courseCapacity: '',
        courseTeacher: '',
        courseGrade: [],
        gradesArr: [],
        isLoadingComplete: false
    }

    componentDidMount = () => {
        auth.checkAuthState()
            .then(() => {
                return system.getURLParam('courseYear');
            })
            .then(res => {
                const courseYear = res;
                this.setState({ courseYear: courseYear });
                return system.getSystemConfig();
            })
            .then(res => {
                const courseYearsArr = res.systemConfig.courseYears;
                const { courseYear } = this.state;
                return system.getCourseYearGrades(courseYear, courseYearsArr);
            })
            .then(res => {
                this.setState({
                    gradesArr: res.grades,
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

    goBack = () => {
        window.history.back();
    }

    updateInput = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        });
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
            this.setState({ isLoadingComplete: false });
            createCourse(courseYear, courseData)
                .then(() => {
                    this.setState({
                        courseName: '',
                        courseID: '',
                        courseGrade: [],
                        courseCapacity: '',
                        courseTeacher: '',
                        isLoadingComplete: true
                    });
                    let checkboxes = document.getElementsByName('courseGradeCheckBox')
                    for (let i = 0; i < checkboxes.length; i++) {
                        const checkbox = checkboxes[i];
                        checkbox.checked = false;
                    }
                    alert(`${courseName} (${courseID}) in course year ${courseYear} has been created successfully!`);
                })
                .catch(err => {
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

    updateCourseGrade = (event) => {
        const courseGradeArr = this.state.courseGrade
        if (event.target.checked) {
            console.log(`Checked Grade ${event.target.value}`)
            courseGradeArr.push(parseInt(event.target.value))
            courseGradeArr.sort((a, b) => a - b)
            this.setState({ courseGrade: courseGradeArr })
        } else {
            console.log(`Unchecked Grade ${event.target.value}`)
            for (var i = 0; i < courseGradeArr.length; i++) {
                if (courseGradeArr[i] === parseInt(event.target.value)) {
                    courseGradeArr.splice(i, 1);
                }
            }
            this.setState({ courseGrade: courseGradeArr })
        }
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
        console.log('Current Course Grade: ', courseGrade);
    }

    gradeSelector = () => {
        const { gradesArr } = this.state
        let gradeSelector = gradesArr.map((grade, i) => {
            return (
                <div className="form-check" key={i}>
                    <input className="form-check-input" type="checkbox" name="courseGradeCheckBox" value={grade} id={`grade-${grade}`} onChange={this.updateCourseGrade} />
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
                    <label htmlFor="courseID">Course ID</label>
                    <input type="text" className="form-control" id="courseID" placeholder="Course ID" onChange={this.updateInput} value={this.state.courseID} required />
                </div>
                <div className="form-group">
                    <label htmlFor="courseName">Course Name</label>
                    <input type="text" className="form-control" id="courseName" placeholder="Course Name" onChange={this.updateInput} value={this.state.courseName} required />
                </div>
                <div className="form-group">
                    <label htmlFor="courseTeacher">Course Teacher</label>
                    <input type="text" className="form-control" id="courseTeacher" placeholder="Course Teacher" onChange={this.updateInput} value={this.state.courseTeacher} required />
                </div>
                <div className="form-group">
                    <label htmlFor="courseGrade">Course Grade</label><br />
                    <i>This course is available for students at</i>
                    {this.gradeSelector()}
                </div>
                <div className="form-group">
                    <label htmlFor="courseCapacity">Course Capacity</label>
                    <input type="number" className="form-control" id="courseCapacity" placeholder="Course Capacity" onChange={this.updateInput} value={this.state.courseCapacity} required />
                </div>
                <button type="submit" className="btn btn-purple">Create</button> <button onClick={this.goBack} className="btn btn-secondary">Back</button>
            </form>
        )
    }

    render() {
        const { isLoadingComplete, isError, errorMessage } = this.state;
        if (!isLoadingComplete) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'back'} />
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
                    <Footer />
                </div>
            )
        }
    }
}

export default CreateCourse;