import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import LoadingPage from './Loading';
import ErrorPage from './ErrorPage';
import Footer from './Footer';

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
        this.getSystemConfig()
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

    getSystemConfig = () => {
        const db = firebase.firestore();
        const configRef = db.collection('systemConfig').doc('config')
        return new Promise ((resolve, reject) => {
            configRef.get()
                .then(doc => {
                    if (!doc.exists) {
                        console.warn('No system config has been initilized.');
                        resolve({ isFirstInitSystem: true });
                    } else {
                        resolve({
                            isFirstInitSystem: false,
                            systemConfig: doc.data()
                        });
                    }
                })
                .catch(err => {
                    const errorMessage = 'Firebase failed getting system config.';
                    reject(errorMessage);
                    console.error(err);
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
                let courseEditLink = `/admin/editcourse?courseYear=${courseYear}&courseID=${course.courseID}`
                if (course.courseEnrolled < course.courseCapacity) {
                    courseStatus = course.courseCapacity - course.courseEnrolled
                } else {
                    courseStatus = 'Full'
                }
                return (
                    <div className="course row" key={i}>
                        <div className="col-md-10">
                            <div className="row align-items-center">
                                <div className="detail col-sm-6">
                                    <span className="course-name">{course.courseID} {course.courseName}</span>
                                    <span><i className="fa fa-fw fa-user" aria-hidden="true"></i> {course.courseTeacher}</span>
                                    <span><i className="fa fa-fw fa-check-square-o" aria-hidden="true"></i> Grade {course.courseGrade.join(', ')} students</span> 
                                </div>
                                <div className="col-sm-6">
                                    <div className="row align-items-center">
                                        <div className="col stat">
                                            <span className="stat-description">Capacity</span>
                                            <span className="stat-number">{course.courseCapacity}</span>
                                        </div>
                                        <div className="col stat">
                                            <span className="stat-description">Enrolled</span>
                                            <span className="stat-number">{course.courseEnrolled}</span>
                                        </div>
                                        <div className="col stat">
                                            <span className="stat-description">Available</span>
                                            <span className="stat-number">{courseStatus}</span>
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                            
                        </div>
                        <div className="course-btn col-md-2">
                            <a className="btn btn-enroll btn-purple" href={courseEditLink}>Edit</a>
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

    render(){
        const {isLoadingComplete, isFirstInitSystem, isError, errorMessage } = this.state;
        
        if (!isLoadingComplete){
            return <LoadingPage/>
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'none'}/>
        } else {
            const { courses, courseYearArr, selectedCourseYear } = this.state;
            const courseDashboard = this.courseDashboard;
            if (isFirstInitSystem) {
                return (
                    <div className="body body-center bg-gradient">
                        <div className="wrapper">
                            <h1>Elective Course Enrollment System</h1>
                            <h2>System Configuration</h2>
                            <p className="mt-2">No course year has been created. You have to create one by press the button below</p>
                            <a role="button" className="btn btn-primary mt-2" href="/admin/system/config/year">Config Course Years</a>
                        </div>
                        <Footer/>
                    </div>
                )
            } else {
                const courseYearSelector = courseYearArr.map((courseYear, i) => {
                    return <option value={courseYear.year} key={i}>Course Year {courseYear.year}</option>
                });
                return (
                    <div className="body bg-gradient">
                        <div className="wrapper">
                            <h1>Elective Course Enrollment System</h1>
                            <h2>System Configuration</h2>
                            <label htmlFor="courseyear-selector">Select course year which you want to config:</label>
                            <select id="courseyear-selector" className="form-control form-control-lg" defaultValue={selectedCourseYear} onChange={this.selectCourseYear}>
                                {courseYearSelector}
                            </select>
                            {courseDashboard(courses)}
                            <div>
                                <a role="button" className="btn btn-purple m-1" href={`/admin/createcourse?courseYear=${selectedCourseYear}`}>Create New Course</a>
                                <a role="button" className="btn btn-purple m-1" href={`/admin/config/grade?courseYear=${selectedCourseYear}`}>Config Grade</a>
                            </div>
                            <hr/>
                            <div>
                                <a role="button" className="btn btn-green m-1" href="/admin/system/config/year">Config Course Years</a>
                            </div>
                        </div>
                        <Footer/>
                    </div>
                    
                )
                
            }
        }
        
    }
}

export default CourseManagement;
