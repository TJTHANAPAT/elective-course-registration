import React from 'react';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';
import * as auth from './functions/authenticationFuctions';
import * as system from '../functions/systemFunctions';
import updateCourse from './functions/updateCourseFunction';
import deleteCourse from './functions/deleteCourseFunction';

class EditCourse extends React.Component {
    state = {
        isLoadingComplete: false
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
                this.setCheckBoxGrade();
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

    // Functions for updating course data.
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
        }
        if (courseGrade.length !== 0) {
            this.setState({ isLoadingComplete: false });
            updateCourse(courseYear, courseData)
                .then(() => {
                    this.setState({
                        isLoadingComplete: true
                    });
                    this.setCheckBoxGrade();
                    alert(`${courseName} (${courseID}) has been updated successfully!`);
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
    UpdateCourseForm = () => {
        return (
            <form onSubmit={this.updateCourse}>
                <div className="form-group">
                    <label htmlFor="courseID">Course ID</label>
                    <input type="text" className="form-control" id="courseID" placeholder="Course ID" onChange={this.updateInput} value={this.state.courseID} required disabled />
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
                    {this.GradeSelector()}
                </div>


                <div className="form-group">
                    <label htmlFor="courseCapacity">Course Capacity</label>
                    <input type="number" className="form-control" id="courseCapacity" placeholder="Course Capacity" onChange={this.updateInput} value={this.state.courseCapacity} required />
                </div>

                <button type="submit" className="btn btn-purple">Save</button>
                <button onClick={this.initDeleteCourse} className="btn btn-danger ml-2">Delete</button>
                <button onClick={this.goBack} className="btn btn-secondary ml-2">Back</button>
            </form>
        )
    }

    GradeSelector = () => {
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

    // Functions for deleting course data.
    deleteCourse = (event) => {
        event.preventDefault();
        const { courseYear, courseID } = this.state;
        console.log(courseYear, courseID)
        this.setState({ isLoadingComplete: false });
        deleteCourse(courseYear, courseID)
            .then(() => {
                this.setState({
                    isLoadingComplete: true,
                    isDeleteCourseComplete: true
                });
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
    initDeleteCourse = () => {
        this.setState({ isDeleteCourse: true });
    }
    ConfirmDeleteCoursePage = () => {
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
                            {this.ConfirmDeleteCourseForm()}
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }
    ConfirmDeleteCourseForm = () => {
        const { courseID, isDeleteCourseConfirm } = this.state;
        const setTimeOutThenDo = (timeout, callback) => {
            setTimeout(() => {
                callback()
            }, timeout)
        }
        let handleChangeConfirmDelete = (event) => {
            const iconConfirmStatus = document.getElementById('iconConfirmStatus')
            iconConfirmStatus.className = 'fa fa-circle-o-notch fa-spin fa-fw';
            this.setState({ isDeleteCourseConfirm: false });
            const confirmText = event.target.value
            setTimeOutThenDo(300, () => {
                if (confirmText === courseID) {
                    iconConfirmStatus.className = 'fa fa-check fa-fw';
                    this.setState({ isDeleteCourseConfirm: true });
                } else {
                    iconConfirmStatus.className = 'fa fa-times fa-fw';
                    this.setState({ isDeleteCourseConfirm: false });
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
            this.setState({ isDeleteCourse: false });
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
    CompleteDeleteCoursePage = () => {
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
                <Footer />
            </div>
        )
    }

    render() {
        const { isLoadingComplete, isError, errorMessage, isDeleteCourse, isDeleteCourseComplete } = this.state;
        if (!isLoadingComplete) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'back'} />
        } else if (isDeleteCourseComplete) {
            return this.CompleteDeleteCoursePage();
        } else if (isDeleteCourse) {
            return this.ConfirmDeleteCoursePage();
        } else {
            const { courseID, courseYear } = this.state
            return (
                <div className="body bg-gradient">
                    <div className="wrapper">
                        <h1>Elective Course Enrollment System</h1>
                        <h2>Edit Course</h2>
                        <p>Editing course {courseID} in course year {courseYear}.</p>
                        {this.UpdateCourseForm()}
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default EditCourse;