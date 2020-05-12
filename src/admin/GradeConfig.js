import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';
import * as auth from './functions/authenticationFuctions';
import * as system from '../functions/systemFunctions';

class GradeConfig extends React.Component {
    state = {
        isLoadingComplete: false,
        isError: false,
        errorMessage: '',

        courseYear:'',
        gradesArr:[],
        gradeAdd:''
    }
    componentDidMount = () => {
        auth.checkAuthState()
            .then( () => {
                return system.getURLParam('courseYear');
            })
            .then( res => {
                const courseYear = res;
                this.setState({ courseYear:courseYear });
                return system.getSystemConfig();
            })
            .then( res => {
                const courseYearsArr = res.systemConfig.courseYears;
                const { courseYear } = this.state;
                return system.getCourseYearGrades(courseYear, courseYearsArr, false);
            })
            .then( res => {
                this.setState({
                    gradesArr: res.grades,
                    isFirstInitConfig: res.isFirstInitConfig,
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

    goBack = (event) => {
        event.preventDefault();
        window.history.back();
    }

    updateInput = (event) => {
        this.setState({
            [event.target.id]:event.target.value
        })
        console.log(event.target.id,':',event.target.value)
    }

    addNewGrade = (event) => {
        event.preventDefault();
        const {gradeAdd, gradesArr} = this.state
        gradesArr.push(parseInt(gradeAdd))
        gradesArr.sort((a, b) => a - b)
        this.setState({gradesArr:gradesArr,gradeAdd:''})
        console.log(gradesArr)
    }

    removeGrade = (event) => {
        event.preventDefault();
        const gradesArr = this.state.gradesArr
        for( var i = 0; i < gradesArr.length; i++){
            if ( gradesArr[i] === parseInt(event.target.value)) {
                gradesArr.splice(i, 1);
                console.log('Remove Grade', event.target.value)
            }
        }
        this.setState({ gradesArr:gradesArr })
    }

    saveGrade = (event) => {
        event.preventDefault();
        const { courseYear, isFirstInitConfig, gradesArr} = this.state
        const db = firebase.firestore();
        const configRef = db.collection(courseYear).doc('config')
        if(!isFirstInitConfig){
            configRef.update({grades:gradesArr})
            .then(() => {
                console.log('Update successfully!')
                alert('Update successfully!')
            })
            .catch(err => { 
                console.error('Error: ', err)
            })
        } else {
            configRef.set({grades:gradesArr})
            .then(() => {
                console.log('Update successfully!')
                alert('Update successfully!')
            })
            .catch(err => { 
                console.error('Error: ', err)
            })
        }
        
    }

    gradeList = () => {
        const { gradesArr } = this.state;
        if (gradesArr.length !== 0) {
            let gradeList = gradesArr.map((grade, i) => {
                return (
                    <li className="list-group-item" key={i}>
                        <div className="list-item-text">
                            <span>Grade {grade}</span>
                        </div>
                        <div className="list-item-action-panel">
                            <button className="btn btn-danger m-1 fa fa-trash" onClick={this.removeGrade} value={grade}></button>
                        </div>
                    </li>
                )
            })
            return <ul className="list-group admin">{gradeList}</ul>
        } else {
            return <p>No grade has been added.</p>
        }
    }

    render(){
        const {isLoadingComplete, isError, errorMessage } = this.state;

        if (!isLoadingComplete) {
            return <LoadingPage/>
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'back'}/>
        } else {
            const { courseYear } = this.state
            return (
                <div className="body bg-gradient">
                    <div className="wrapper text-left">
                        <h1>Elective Course Enrollment System</h1>
                        <h2>Grade Configuration</h2>
                        <p>Configure grade of course year {courseYear}.</p>
                        {this.gradeList()}
                        <form onSubmit={this.addNewGrade} className="mt-3">
                            <div className="form-config row">
                                <div className="col-9 form-input-inline form-group">
                                    <input type="number" pattern="[0-9]*" className="form-control" id="gradeAdd" placeholder="Add new grade" onChange={this.updateInput} value={this.state.gradeAdd} required/>
                                </div>
                                <div className="col-3 form-btn-inline">
                                    <button type="submit" className="btn btn-purple full-width">Add</button> 
                                </div>
                            </div>
                        </form>
                        <div className="mt-2">
                            <button type="submit" className="btn btn-purple" onClick={this.saveGrade}>Save</button>
                            <button onClick={this.goBack} className="btn btn-secondary ml-2">Back</button>
                        </div>
                    </div>
                    <Footer/>
                </div>
            )
        }
    }
}

export default GradeConfig;