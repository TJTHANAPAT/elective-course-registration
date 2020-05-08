import firebase from 'firebase/app';
import 'firebase/firestore';

const updateCourseData = (courseYear, courseData) => {
    const {
        courseName,
        courseID,
        courseTeacher,
        courseGrade,
        courseCapacity
    } = courseData
    const courseDataUpdate = {
        courseName: courseName,
        courseGrade: courseGrade,
        courseTeacher: courseTeacher,
        courseCapacity: parseInt(courseCapacity),
    }
    const db = firebase.firestore();
    const courseRef = db.collection(courseYear).doc('course').collection('course').doc(courseID);
    return new Promise((resolve, reject) => {
        courseRef.update(courseDataUpdate)
            .then(() => {
                console.log(`Course ${courseID} data has been updated to course database of course year ${courseYear} successfully!`)
                resolve();
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Firebase failed updating course ${courseID} data to the database. ${err.message}`
                reject(errorMessage)
            })
    })
}

const updateCourseValidateData = (courseYear, courseData) => {
    const {
        courseID,
        courseGrade,
        courseCapacity
    } = courseData
    const courseValidateDataUpdate = {
        courseGrade: courseGrade,
        courseCapacity: parseInt(courseCapacity),
    }
    const db = firebase.firestore();
    const courseValidateRef = db.collection(courseYear).doc('course').collection('courseValidate').doc(courseID)
    return new Promise((resolve, reject) => {
        courseValidateRef.update(courseValidateDataUpdate)
            .then(() => {
                console.log(`Course ${courseID} validate data has been updated to courseValidate database of course year ${courseYear} successfully!`)
                resolve();
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Firebase failed updating course ${courseID} validate data to the database. ${err.message}`
                reject(errorMessage)
            })
    })
}

export default function updateCourse(courseYear = '', courseData = { courseID: '' }) {
    return new Promise((resolve, reject) => {
        updateCourseData(courseYear, courseData)
            .then(() => {
                return updateCourseValidateData(courseYear, courseData);
            })
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.error(err);
                reject(err);
            })
    })
}
