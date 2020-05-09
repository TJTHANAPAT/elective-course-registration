import firebase from 'firebase/app';
import 'firebase/firestore';

export function checkCourseYearAvailable(courseYear = '', systemConfig = {}) {
    return new Promise((resolve, reject) => {
        const courseYearsArr = systemConfig.courseYears;
        let isCourseYearExists = false;
        let isCourseYearAvailable = false;
        for (let i = 0; i < courseYearsArr.length; i++) {
            if (courseYearsArr[i].year === courseYear) {
                isCourseYearAvailable = courseYearsArr[i].available;
                isCourseYearExists = true;
            }
        }
        if (!isCourseYearExists) {
            reject(`Course year ${courseYear} has not been found in the system.`)
        } else if (isCourseYearAvailable) {
            resolve();
        } else {
            reject(`Courses in course year ${courseYear} is currently not available to enroll.`);
        }
    })
}

export function checkCourseAvailable(courseYear = '', courseData = {}) {
    const { courseID, courseCapacity, courseEnrolled } = courseData;
    return new Promise((resolve, reject) => {
        if (courseEnrolled < courseCapacity) {
            resolve();
        } else {
            const err = `Course ${courseID} in course year ${courseYear} has reached its capacity, therefore it is not available to enroll.`
            reject(err);
        }
    })
}

const getCourseData = (courseYear = '', courseID = '') => {
    const db = firebase.firestore();
    const courseRef = db.collection(courseYear).doc('course').collection('course').doc(courseID)
    return new Promise((resolve, reject) => {
        courseRef.get()
            .then(doc => {
                if (doc.exists) {
                    resolve(doc.data());
                } else {
                    const err = `Course ${courseID} data in ${courseYear} has not been found in database.`
                    reject(err);
                }
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Firebase failed getting course data of course ${courseID} in ${courseYear}. ${err.message}`;
                reject(errorMessage);
            })
    })
}

const getCourseValidateData = (courseYear = '', courseID = '') => {
    const db = firebase.firestore();
    const courseValidateRef = db.collection(courseYear).doc('course').collection('courseValidate').doc(courseID);
    return new Promise((resolve, reject) => {
        courseValidateRef.get()
            .then(doc => {
                if (doc.exists) {
                    resolve(doc.data());
                } else {
                    const err = `Course ${courseID} validate data in ${courseYear} has not been found in database.`
                    reject(err);
                }
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `Firebase failed getting course data of course ${courseID} in ${courseYear}. ${err.message}`;
                reject(errorMessage);
            })
    })
}

const arraysEqual = (arr1, arr2) => {
    // arraysEqual function used to validate course grade.
    if (arr1 === arr2) return true;
    if (arr1 == null || arr2 == null) return false;
    arr1.sort((a, b) => a - b);
    arr2.sort((a, b) => a - b);
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

const validateCourse = (courseYear, courseID) => {
    return new Promise((resolve, reject) => {
        let courseData = null;
        let courseValidateData = null;
        getCourseData(courseYear, courseID)
            .then(res => {
                courseData = res;
                return checkCourseAvailable(courseYear, courseData);
            })
            .then(() => {
                return getCourseValidateData(courseYear, courseID);
            })
            .then(res => {
                courseValidateData = res;
                const validateCourseCapacity = courseData.courseCapacity === courseValidateData.courseCapacity;
                const validateCourseGrade = arraysEqual(courseData.courseGrade, courseValidateData.courseGrade);
                console.log('Validate capacity ', validateCourseCapacity);
                console.log('Validate grade ', validateCourseGrade);
                if (validateCourseCapacity && validateCourseGrade) {
                    resolve(courseData);
                } else {
                    const err = `Technical issue has been found in the system. The data of course ${courseID} in course year ${courseYear} is not valid. Please contact admin for more infomation.`;
                    reject(err);
                }
            })
            .catch(err => {
                reject(err);
            })
    })
}

const checkStudentGrade = (studentData, courseYear, courseData) => {
    const { studentGrade } = studentData;
    const { courseID, courseName, courseGrade } = courseData;
    return new Promise((resolve, reject) => {
        let isStudentGradeValid = false;
        for (let i = 0; i < courseGrade.length; i++) {
            if (parseInt(studentGrade) === courseGrade[i]) {
                isStudentGradeValid = true;
            }
        }
        if (isStudentGradeValid) {
            resolve();
        } else {
            const err = `${courseName} (${courseID}) in course year ${courseYear} is only available for students at grade ${courseGrade.join(', ')}.`;
            reject(err);
        }
    })
}

const checkStudentID = (courseYear, studentID) => {
    const db = firebase.firestore();
    const studentRef = db.collection(courseYear).doc('student').collection('student').doc(studentID);
    return new Promise((resolve, reject) => {
        studentRef.get()
            .then(doc => {
                if (!doc.exists) {
                    resolve();
                } else {
                    const student = doc.data();
                    const err = `Student with ID ${student.studentID} has already enrolled in a course in course year ${courseYear} as ${student.nameFirst} ${student.nameLast}.`
                    reject(err);
                }
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `System failed checking student ID. ${err.message}`;
                reject(errorMessage);
            })
    })
}

const updatingCourseEnrolled = (courseYear, courseData) => {
    const course = courseData;
    const db = firebase.firestore();
    const courseRef = db.collection(courseYear).doc('course').collection('course').doc(course.courseID);
    return new Promise((resolve, reject) => {
        const updateCourseEnrolled = course.courseEnrolled + 1;
        courseRef.update({ courseEnrolled: updateCourseEnrolled })
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `System failed updating course enrolled student. ${err.message}`;
                reject(errorMessage);
            })
    })
}

const addStudentData = (courseYear, courseData, studentData) => {
    const { studentID } = studentData;
    const db = firebase.firestore();
    const studentRef = db.collection(courseYear).doc('student').collection('student').doc(studentID);
    return new Promise((resolve, reject) => {
        studentRef.set(studentData)
            .then(() => {
                return updatingCourseEnrolled(courseYear, courseData);
            })
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.error(err);
                const errorMessage = `System failed adding student data. ${err.message}`;
                reject(errorMessage);
            })
    })
}

export function enrollCourse(courseYear, courseID, studentData) {
    return new Promise((resolve, reject) => {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        studentData = { ...studentData, ...{ timestamp: timestamp } };
        let courseData = null
        validateCourse(courseYear, courseID)
            .then(res => {
                courseData = res;
                return checkStudentGrade(studentData, courseYear, courseData);
            })
            .then(() => {
                const studentID = studentData.studentID;
                return checkStudentID(courseYear, studentID);
            })
            .then(() => {
                return addStudentData(courseYear, courseData, studentData);
            })
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject(err);
            })
    })
}