import firebase from 'firebase/app';
import 'firebase/firestore';

const getURLParam = (parameter) => {
    const searchParams = new URLSearchParams(window.location.search);
    const param = searchParams.get(parameter);
    return new Promise ((resolve, reject) => {
        if (param === '') {
            reject(`Parameter with key '${parameter}' is found but it is blank.`);
        } else if (param === null) {
            reject(`Parameter with key '${parameter}' is not found in url.`);
        } else {
            resolve(param)
        }
    })
}

const getSystemConfig = () => {
    const db = firebase.firestore();
    const configRef = db.collection('systemConfig').doc('config')
    return new Promise ((resolve, reject) => {
        configRef.get()
            .then(doc => {
                if (!doc.exists) {
                    const err = 'No system config has been initilized.'
                    reject(err);
                } else {
                    resolve(doc.data());
                }
            })
            .catch(err => {
                reject(err)
            })
    })
}

export { getURLParam, getSystemConfig };

