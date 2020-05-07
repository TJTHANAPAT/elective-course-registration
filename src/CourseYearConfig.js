import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import Switch from 'react-switch';
import LoadingPage from './Loading';
import ErrorPage from './ErrorPage';
import Footer from './Footer';

class CourseYearConfig extends React.Component {
    state = {
        isLoadingComplete: false,
        courseYearAdd:'',
        courseYearArr:[],
        currentCourseYear:'',
    }
    componentDidMount = () => {
        this.getSystemConfig()
            .then( res => {
                const isFirstInitSystem = res.isFirstInitSystem;
                if (!isFirstInitSystem) {
                    const systemConfig = res.systemConfig;
                    this.setState({
                        isLoadingComplete: true,
                        currentCourseYear: systemConfig.currentCourseYear,
                        courseYearArr: systemConfig.courseYears
                    });
                } else {
                    console.warn('No course year config has ever been found in database. It will be initialized after saving.')
                    this.setState({
                        isLoadingComplete: true,
                        isFirstInitSystem: true
                    })
                }
                console.log(res);
            })
            .catch( err => {
                console.error(err);
            })

        //add FontAwesome
        const link = document.createElement('link');
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }
    updateInput = (event) => {
        this.setState({
            [event.target.id]:event.target.value
        })
        console.log(event.target.id,':',event.target.value)
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

    checkCourseYearExist = (courseYear) => {
        const { courseYearArr } = this.state;
        let isCourseYearExist = false;
        for (let i = 0; i < courseYearArr.length; i++) {
            if (courseYearArr[i].year === courseYear) {
                isCourseYearExist = true
            }
        }
        return (isCourseYearExist)
    }

    addNewCourseYear = (event) => {
        event.preventDefault();
        const {courseYearAdd, courseYearArr} = this.state
        if(!this.checkCourseYearExist(courseYearAdd)){
            const newCourseYear = {
                year: courseYearAdd.toString(),
                available: false,
            };
            courseYearArr.push(newCourseYear)
            const courseYearArrSortedYear = [];
            for (let i = 0; i < courseYearArr.length; i++) {
                courseYearArrSortedYear.push(courseYearArr[i].year);
            }
            courseYearArrSortedYear.sort((a, b) => a - b);
            const courseYearArrSorted = [];
            for (let i = 0; i < courseYearArrSortedYear.length; i++) {
                const year = courseYearArrSortedYear[i];
                for (let j = 0; j < courseYearArr.length; j++) {
                    const courseYear = courseYearArr[j];
                    if(year === courseYear.year) {
                        courseYearArrSorted.push(courseYear);
                    }
                }
            }
            this.setState({courseYearArr:courseYearArrSorted,courseYearAdd:''})
            console.log(courseYearArrSorted)
        } else {
            alert(`${courseYearAdd} is already exist!`)
        }
        
    }

    removeCourseYear = (event) => {
        event.preventDefault();
        const courseYearArr = this.state.courseYearArr;
        for (let i = 0; i < courseYearArr.length; i++) {
            if ( courseYearArr[i].year === event.target.value) {
                courseYearArr.splice(i, 1);
                console.log('Remove Course Year', event.target.value)
            }
        }
        this.setState({TestArr:courseYearArr})
    }

    setCurrentCourseYear = (event) => {
        event.preventDefault();
        this.setState({ currentCourseYear:event.target.value });
    }

    save = (event) => {
        event.preventDefault();
        const db = firebase.firestore();
        const configRef = db.collection('systemConfig').doc('config')
        const { courseYearArr, currentCourseYear, isFirstInitSystem } = this.state;
        if (currentCourseYear === '') {
            alert('You have to set the current course year.');
        } else if (!isFirstInitSystem) {
            configRef.update({
                courseYears:courseYearArr,
                currentCourseYear:currentCourseYear
            })
                .then(() => {
                    console.log('Update successfully!')
                    alert('Update successfully!')
                })
                .catch(err => { 
                    console.error('Error: ', err)
                })
        } else {
            configRef.set({
                courseYears:courseYearArr,
                currentCourseYear:currentCourseYear
            })
            .then(() => {
                console.log('Update successfully!')
                alert('Update successfully!')
            })
            .catch(err => { 
                console.error('Error: ', err)
            })
        }
        
    }

    goBack = () => {
        window.history.back();
    }

    handleChangeCourseYearAvailable = (checked, event, id) => {
        console.log(id)
        console.log(checked)
        const { courseYearArr } = this.state;
        for (let i = 0; i < courseYearArr.length; i++) {
            const courseYear = courseYearArr[i];
            if (courseYear.year === id) {
                courseYear.available = checked;
            }
            
        }
        this.setState({courseYearArr:courseYearArr})
        console.log(this.state.courseYearArr)
    }

    courseYearList = () => {
        const { courseYearArr, currentCourseYear } = this.state
        if (courseYearArr.length !== 0) {
            let courseYearSelector = courseYearArr.map((courseYear, i) => {
                let btnCurrentYear = () => {
                    if (currentCourseYear === courseYear.year) {
                        return <button className="btn btn-success m-1 ml-2 fa fa-bookmark"></button>
                    } else {
                        return <button className="btn btn-light m-1 ml-2 fa fa-bookmark" onClick={this.setCurrentCourseYear} value={courseYear.year}></button>
                    }
                }
                return (
                    <li className="list-group-item" key={i}>
                        <div className="list-item-text">
                            <span>Course Year {courseYear.year}</span>
                        </div>
                        <div className="list-item-action-panel">
                            <Switch
                                id={courseYear.year}
                                onChange={this.handleChangeCourseYearAvailable}
                                checked={courseYear.available}
                            />
                            {btnCurrentYear()}
                            <button className="btn btn-danger m-1 fa fa-trash" onClick={this.removeCourseYear} value={courseYear.year}></button>
                        </div>
                    </li>
                )
            })
            return (
                <div>
                    <ul className="list-group admin">{courseYearSelector}</ul>
                    <p className="mt-1">
                        <i>
                            Warning: Deleting a course year does not delete its course data 
                            and student data in that course year! 
                            To do that, you have to delete every course in that course year.
                        </i>
                    </p>
                </div>
            )
        } else {
            return <p>No course year has been added.</p>
        }
    }

    addNewCourseYearForm = () => {
        return (
            <form onSubmit={this.addNewCourseYear} className="form-config row mt-3">
                <div className="col-9 form-input-inline form-group">
                    <input type="number" className="form-control" id="courseYearAdd" placeholder="Add new course year" onChange={this.updateInput} value={this.state.courseYearAdd} required/>
                </div>
                <div className="col-3 form-btn-inline">
                    <button type="submit" className="btn btn-purple full-width">Add</button> 
                </div>
            </form>
        )
    }


    render(){
        const { isLoadingComplete, isError, errorMessage } = this.state;
        if (!isLoadingComplete){
            return <LoadingPage/>
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'back'}/>
        } else {
            return (
                <div className="body bg-gradient">
                    <div className="wrapper">
                        <h1>Course Years Configuration</h1>
                        {this.courseYearList()}
                        {this.addNewCourseYearForm()}
                        <div className="mt-2">
                            <button type="submit" className="btn btn-purple" onClick={this.save}>Save</button>
                            <button onClick={this.goBack} className="btn btn-secondary ml-2">Back</button>
                        </div>
                    </div>
                    <Footer/>
                </div>
            )
        }
    }
}

export default CourseYearConfig;