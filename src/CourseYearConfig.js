import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import Switch from 'react-switch';

class CourseYearConfig extends React.Component {
    state = {
        isLoadingComplete: false,
        courseYearAdd:'',
        courseYearArr:[],
        currentCourseYear:'',
    }
    componentDidMount = () => {
        const db = firebase.firestore();
        const configRef = db.collection('systemConfig').doc('config')
        configRef.get()
            .then(doc => {
                if(doc.exists){
                    this.setState({
                        courseYearArr:doc.data().courseYears,
                        currentCourseYear:doc.data().currentCourseYear
                    })
                    console.log(doc.data().courseYears)
                } else {
                    this.setState({isFirstInit:true});
                    console.error('No course year has ever been created.')
                }
                this.setState({isLoadingComplete: true})
                
            })
            .catch(err => { 
                console.error('Error: ', err)
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
                console.log('Remove Course Year ', event.target.value)
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
        const { courseYearArr, currentCourseYear, isFirstInit } = this.state;
        if (currentCourseYear === '') {
            alert('You have to set the current year.');
        } else if (!isFirstInit) {
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

    handleChange = (checked) => {
        this.setState({ checked });
        console.log(this.state.checked)
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


    render(){
        
        if (this.state.isLoadingComplete) {
            const {courseYearArr, currentCourseYear} = this.state
            if (courseYearArr.length !== 0){
                let courseYearSelector = courseYearArr.map((courseYear, i) => {
                    if (currentCourseYear === courseYear.year) {
                        return (
                            <li className="list-group-item inline" key={i}>
                                <span>Course Year {courseYear.year}</span>
                                <div className="float-right flex-container">
                                    <Switch
                                        id={courseYear.year}
                                        onChange={this.handleChangeCourseYearAvailable}
                                        checked={courseYear.available}
                                    />
                                    <button className="btn btn-success m-1 fa fa-bookmark"></button>
                                    <button className="btn btn-danger m-1 fa fa-trash" onClick={this.removeCourseYear} value={courseYear.year}></button>
                                </div>
                            </li>
                        )
                    } else {
                        return (
                            <li className="list-group-item inline" key={i}>
                                <span>Course Year {courseYear.year}</span>
                                <div className="float-right flex-container">
                                    <Switch
                                        id={courseYear.year}
                                        onChange={this.handleChangeCourseYearAvailable}
                                        checked={courseYear.available}
                                    />
                                    <button className="btn btn-light m-1 fa fa-bookmark" onClick={this.setCurrentCourseYear} value={courseYear.year}></button>
                                    <button className="btn btn-danger m-1 fa fa-trash" onClick={this.removeCourseYear} value={courseYear.year}></button>
                                </div>
                            </li>
                        )
                    }
                    
                })
                return (
                    <div className="wrapper">
                        <h1>
                            Course Years Config
                        </h1>
                        <ul className="list-group">
                            {courseYearSelector}
                        </ul>
                        
                        <form onSubmit={this.addNewCourseYear} className="form-inline mt-2">
                            <div className="form-group">
                                <input type="number" className="form-control" id="courseYearAdd" placeholder="Add new course year" onChange={this.updateInput} value={this.state.courseYearAdd} required/>
                            </div>
                            <button type="submit" className="btn btn-primary ml-2">Add</button>
                        </form>
                        <button type="submit" className="btn btn-primary mt-2" onClick={this.save}>Save</button>
                        <button onClick={this.goBack} className="btn btn-secondary mt-2 ml-2">Back</button>
                        
                    </div>
                )
            } else {
                return (
                    <div className="wrapper">
                        <h1>
                            Course Years Config
                        </h1>
                        <p>No Course Year has been added.</p>
                        <form onSubmit={this.addNewCourseYear} className="form-inline">
                            <div className="form-group">
                                <input type="number" className="form-control" id="courseYearAdd" placeholder="Add new course year" onChange={this.updateInput} value={this.state.courseYearAdd} required/>
                            </div>
                            <button type="submit" className="btn btn-primary ml-2">Add</button>
                        </form>
                        <button onClick={this.goBack} className="btn btn-secondary mt-2">Back</button>
                    </div>
                )
            }
        } else {
            return (
                <div className="wrapper">
                        <h1>
                            Course Years Config
                        </h1>
                        <p>Loading...</p>
                        <button onClick={this.goBack} className="btn btn-secondary mt-2">Back</button>
                    </div>
            )
        }
    }
}

export default CourseYearConfig;