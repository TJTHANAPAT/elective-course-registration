import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';
import Admin from './Admin';

import * as auth from './functions/authenticationFuctions';
import * as admin from '../systemFunction';

class CourseManagement extends React.Component {
    state = {
        courses: [],

        isLoadingComplete:false,
        isError:false,
        errorMessage:'',
        isFirstInitSystem:false,

        courseYearArr:[],
        selectedCourseYear:''
    }

    componentDidMount = () => {
        auth.checkAuthState()
            .then( res => {
                const user = res.user;
                const isLogin = res.isLogin;
                this.setState({
                    currentUser: user,
                    isLogin: isLogin,
                })
                return admin.getSystemConfig(false)
            })
            .then( res => {
                const isFirstInitSystem = res.isFirstInitSystem;
                if (!isFirstInitSystem) {
                    const systemConfig = res.systemConfig;
                    this.setState({
                        selectedCourseYear: systemConfig.currentCourseYear,
                        courseYearArr: systemConfig.courseYears
                    });
                    this.getCoursesData(systemConfig.currentCourseYear);
                } else {
                    this.setState({
                        isFirstInitSystem: true,
                    })
                }
                console.log(res);
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
    
    getCoursesData = (courseYear) => {
        const db = firebase.firestore();
        const courseRef = db.collection(courseYear).doc('course').collection('course');
        let coursesArr = [];
        courseRef.onSnapshot(querySnapshot => {
            coursesArr = [];
            querySnapshot.forEach(doc => {
                coursesArr.push(doc.data())
            })
            this.setState({
                courses: coursesArr,
                isLoadingComplete: true,
            });
        });
    }

    courseDashboard = (coursesData) => {
        const courseYear = this.state.selectedCourseYear;
        if (coursesData.length === 0){
            return (
                <div className="mt-4 text-center">
                    <p>No course has been created for Course Year {courseYear}.</p>
                </div>
            )
        } else {
            let courseDashboard = coursesData.map((course, i) => {
                let courseStatus = null;
                let courseEditLink = `/admin/editcourse?courseYear=${courseYear}&courseID=${course.courseID}`;
                let courseViewLink = `/admin/viewcourse?courseYear=${courseYear}&courseID=${course.courseID}`;
                if (course.courseEnrolled < course.courseCapacity) {
                    courseStatus = course.courseCapacity - course.courseEnrolled
                } else {
                    courseStatus = 'Full'
                }
                let stat = (text, number) => {
                    return (
                        <div className="col stat">
                            <span className="stat-description">{text}</span>
                            <span className="stat-number">{number}</span>
                        </div>
                    )
                }
                return (
                    <div className="course row admin" key={i}>
                        <div className="col-md-9">
                            <div className="row align-items-center">
                                <div className="detail col-sm-6">
                                    <span className="course-name">{course.courseID} {course.courseName}</span>
                                    <span><i className="fa fa-fw fa-user" aria-hidden="true"></i> {course.courseTeacher}</span>
                                    <span><i className="fa fa-fw fa-check-square-o" aria-hidden="true"></i> Grade {course.courseGrade.join(', ')} students</span> 
                                </div>
                                <div className="col-sm-6">
                                    <div className="row align-items-center">
                                        {stat('Capacity',course.courseCapacity)}
                                        {stat('Enrolled',course.courseEnrolled)}
                                        {stat('Available',courseStatus)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="course-btn col-md-3">
                            <a className="col btn btn-admin btn-left btn-purple fa fa-file-text-o" href={courseViewLink}></a>
                            <a className="col btn btn-admin btn-right btn-green fa fa-pencil" href={courseEditLink}></a>
                        </div>
                    </div>
                )
            })
            return (courseDashboard)
        }
    }

    selectCourseYear = (event) => {
        const { selectCourseYear } = this.state;
        const newSelectCourseYear = event.target.value;
        if (selectCourseYear !== newSelectCourseYear) {
            this.setState({ selectedCourseYear:newSelectCourseYear });
            this.getCoursesData(newSelectCourseYear);
        }
    }

    courseYearSelector = () => {
        const { courseYearArr, selectedCourseYear } = this.state;
        let courseYearSelector = courseYearArr.map((courseYear, i) => {
            return <option value={courseYear.year} key={i}>Course Year {courseYear.year}</option>
        });
        return (
            <select id="courseyear-selector" className="form-control form-control-lg" defaultValue={selectedCourseYear} onChange={this.selectCourseYear}>
                {courseYearSelector}
            </select>
        )
    }

    signOut = () => {
        this.setState({ isLoadingComplete: false });
        auth.signOut()
            .then( () => {
                this.setState({
                    isLoadingComplete: true,
                    isLogin: false
                })
            })
    }

    render(){
        const {
            isLoadingComplete,
            isLogin,
            isFirstInitSystem,
            isError,
            errorMessage
        } = this.state;
        
        if (!isLoadingComplete){
            return <LoadingPage/>
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'none'}/>
        } else if (isLogin) {
            if (isFirstInitSystem) {
                return (
                    <div className="body body-center bg-gradient">
                        <div className="wrapper text-left">
                            <h1>Elective Course Enrollment System</h1>
                            <h2>System Configuration</h2>
                            <p className="mt-2">No course year has been created. You have to create one by press the button below</p>
                            <div className="mt-2 text-center">
                                <a role="button" className="btn btn-purple m-1" href="/admin/system/config/year">Config Course Years</a>
                                <button className="btn btn-green m-1" onClick={this.signOut}><i className="fa fa-sign-out"></i> Logout</button>
                            </div>
                        </div>
                        <Footer/>
                    </div>
                )
            } else {
                const { courses, selectedCourseYear } = this.state;
                return (
                    <div className="body bg-gradient">
                        <div className="wrapper">
                            <h1>Elective Course Enrollment System</h1>
                            <h2>System Management</h2>
                            <label htmlFor="courseyear-selector">Select course year which you want to config:</label>
                            {this.courseYearSelector()}
                            {this.courseDashboard(courses)}
                            <div>
                                <a role="button" className="btn btn-purple m-1" href={`/admin/createcourse?courseYear=${selectedCourseYear}`}>Create New Course</a>
                                <a role="button" className="btn btn-purple m-1" href={`/admin/config/grade?courseYear=${selectedCourseYear}`}>Config Grade</a>
                            </div>
                            <hr/>
                            <div>
                                <button className="btn btn-green m-1" onClick={this.signOut}><i className="fa fa-sign-out"></i> Logout</button>
                                <a role="button" className="btn btn-green m-1" href="/admin/system/config/year">Config Course Years</a>
                            </div>
                        </div>
                        <Footer/>
                    </div>
                )
            }
        } else {
            return <Admin/>
        }
    }
}

export default CourseManagement;
