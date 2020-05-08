import firebase from 'firebase/app';
import 'firebase/firestore';

const getCourseStudentsIDArr = (courseYear = '', courseID = '') => {
    const db = firebase.firestore();
    const studentRef = db.collection(courseYear).doc('student').collection('student').where('enrolledCourse', '==', courseID);
    return new Promise((resolve, reject) => {
        studentRef.get()
            .then(querySnapshot => {
                let studentsIDArr = [];
                querySnapshot.forEach(doc => {
                    studentsIDArr.push(doc.data().studentID);
                });
                resolve(studentsIDArr);
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Firebase failed getting student data of course ${courseID} in ${courseYear}. ${err.message}`
                reject(errorMessage)
            })
    })
}

const deleteStudentIndividual = (courseYear, studentID) => {
    const db = firebase.firestore();
    const studentRef = db.collection(courseYear).doc('student').collection('student').doc(studentID);
    return new Promise((resolve, reject) => {
        studentRef.delete()
            .then(() => {
                console.log(`Student with ID '${studentID}' has been deleted successfully!`)
                resolve();
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Firebase failed deleting student data of student ID '${studentID}' in course year ${courseYear} from database.`;
                reject(errorMessage);
            })
    })
}

const deleteCourseStudents = (courseYear, studentsIDArr) => {
    return new Promise((resolve, reject) => {
        studentsIDArr.forEach(studentID => {
            deleteStudentIndividual(courseYear, studentID)
                .catch(err => { reject(err); })
        });
        resolve(true);
    })
}

const deleteCourseData = (courseYear, courseID) => {
    const db = firebase.firestore();
    const courseRef = db.collection(courseYear).doc('course').collection('course').doc(courseID)
    return new Promise((resolve, reject) => {
        courseRef.delete()
            .then(() => {
                console.log(`Course ${courseID} data has been deleted from course database of course year ${courseYear} successfully!`)
                resolve()
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Firebase failed deleting course ${courseID} data from database. ${err.message}`;
                reject(errorMessage);
            })
    })
}

const deleteCourseValidateData = (courseYear, courseID) => {
    const db = firebase.firestore();
    const courseValidateRef = db.collection(courseYear).doc('course').collection('courseValidate').doc(courseID)
    return new Promise((resolve, reject) => {
        courseValidateRef.delete()
            .then(() => {
                console.log(`Course ${courseID} validate data has been deleted from courseValidate database of course year ${courseYear} successfully!`)
                resolve()
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Firebase failed deleting course ${courseID} validate data from database. ${err.message}`;
                reject(errorMessage);
            })
    })
}

export default function deleteCourse(courseYear = '', courseID = '') {
    return new Promise((resolve, reject) => {
        getCourseStudentsIDArr(courseYear, courseID)
            .then(res => {
                const courseStudentsIDArr = res;
                return deleteCourseStudents(courseYear, courseStudentsIDArr);
            })
            .then(() => {
                return deleteCourseData(courseYear, courseID);
            })
            .then(() => {
                return deleteCourseValidateData(courseYear, courseID);
            })
            .then(() => {
                resolve()
            })
            .catch(err => {
                const warn = `Deleting course is incomplete. Some data of this course might not be deleted. Please delete data of this course manually.`
                console.warn(warn)
                reject(err);
            })
    })
}