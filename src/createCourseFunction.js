import firebase from 'firebase/app';
import 'firebase/firestore';

const checkCourseExists = (courseYear, courseID) => {
    const db = firebase.firestore();
    const courseRef = db.collection(courseYear).doc('course').collection('course').doc(courseID);
    return new Promise((resolve, reject) => {
        courseRef.get()
            .then(doc => {
                if (!doc.exists) {
                    resolve();
                } else {
                    const err = `Course with ID '${courseID}' has already been created in course year ${courseYear} as ${doc.data().courseName}.)`;
                    reject(err);
                }
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Checking if course ${courseID} exists in course year ${courseYear} failed. ${err.message}`;
                reject(errorMessage);
            })
    })
}

const addCourseData = (courseYear, courseData) => {
    const { courseID } = courseData;
    const db = firebase.firestore();
    const courseRef = db.collection(courseYear).doc('course').collection('course').doc(courseID);
    return new Promise((resolve, reject) => {
        courseRef.set(courseData)
            .then(() => {
                console.log(`Course ${courseID} data has been added to course database of course year ${courseYear} successfully!`)
                resolve();
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Firebase failed adding course ${courseID} data to course database. ${err.message}`
                reject(errorMessage)
            })
    })
}
const addCourseValidateData = (courseYear, courseData) => {
    const { courseID, courseGrade, courseCapacity } = courseData;
    const db = firebase.firestore();
    const courseValidateRef = db.collection(courseYear).doc('course').collection('courseValidate').doc(courseID)
    const courseValidateData = {
        courseID: courseID,
        courseGrade: courseGrade,
        courseCapacity: parseInt(courseCapacity)
    }
    return new Promise((resolve, reject) => {
        courseValidateRef.set(courseValidateData)
            .then(() => {
                console.log(`Course ${courseID} validate data has been added to courseValidate database of course year ${courseYear} successfully!`)
                resolve();
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Firebase failed adding course ${courseID} validate data to the database. ${err.message}`
                reject(errorMessage)
            })
    })
}

export default function createCourse(courseYear = '', courseData = { courseID: '' }) {
    const { courseID } = courseData;
    return new Promise((resolve, reject) => {
        checkCourseExists(courseYear, courseID)
            .then(() => {
                return addCourseData(courseYear, courseData);
            })
            .then(() => {
                return addCourseValidateData(courseYear, courseData);
            })
            .then(() => {
                console.log(`Course ${courseID} has been created in course year ${courseYear} successfully!`);
                resolve();
            })
            .catch(err => {
                reject(err);
            })
    })
}