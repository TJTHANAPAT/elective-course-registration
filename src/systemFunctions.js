import firebase from 'firebase/app';
import 'firebase/firestore';

export function getSystemConfig(rejectIfFirstInitSystem = true) {
    const db = firebase.firestore();
    const configRef = db.collection('systemConfig').doc('config')
    return new Promise((resolve, reject) => {
        configRef.get()
            .then(doc => {
                if (!doc.exists && rejectIfFirstInitSystem) {
                    const err = 'No system config has been initilized.';
                    reject(err);
                } else if (!doc.exists) {
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
                console.error(err);
                const errorMessage = `Firebase failed getting system config. ${err.message}`;
                reject(errorMessage);
            })
    })
}

export function getURLParam(paramKey = '') {
    const searchParams = new URLSearchParams(window.location.search);
    const param = searchParams.get(paramKey);
    return new Promise((resolve, reject) => {
        if (paramKey === '') {
            reject('Parameter key must be non empty string.')
        }
        if (param === '') {
            reject(`Parameter with key '${paramKey}' is found but it is blank.`);
        } else if (param === null) {
            reject(`Parameter with key '${paramKey}' is not found in url.`);
        } else {
            resolve(param)
        }
    })
}

export function checkCourseYearExist(courseYear, courseYearsArr) {
    let isCourseYearExist = false;
    for (let i = 0; i < courseYearsArr.length; i++) {
        if (courseYearsArr[i].year === courseYear) {
            isCourseYearExist = true
        }
    }
    return (isCourseYearExist);
}

export function getCourseYearGrades(courseYear = '', courseYearsArr, rejectIfFirstInitConfig = true) {
    const db = firebase.firestore();
    const configRef = db.collection(courseYear).doc('config')
    return new Promise((resolve, reject) => {
        if (checkCourseYearExist(courseYear, courseYearsArr)) {
            configRef.get()
                .then(doc => {
                    if (!doc.exists && rejectIfFirstInitConfig) {
                        const err = `No config of Course Year ${courseYear} has been found in database.`;
                        reject(err);
                    } else if (!doc.exists) {
                        const warn = `No config of Course Year ${courseYear} has been found in database. It will be initialized after saving.`;
                        console.warn(warn);
                        resolve({
                            isFirstInitConfig: true,
                            grades: []
                        });
                    } else {
                        resolve({
                            isFirstInitConfig: false,
                            grades: doc.data().grades
                        });
                    }
                })
                .catch(err => {
                    const errorMessage = `Firebase failed getting course year config. ${err.message}`;
                    reject(errorMessage);
                    console.error(err);
                })
        } else {
            const err = `No course year ${courseYear} has been found in database.`;
            reject(err);
        }

    })

}

export function getCourseData(courseYear = '', courseID = '') {
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