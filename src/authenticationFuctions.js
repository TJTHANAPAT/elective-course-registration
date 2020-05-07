import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

export function checkAuthState(rejectIfUserNotFound = true){
    const auth = firebase.auth()
    return new Promise ((resolve,reject) => {
        auth.onAuthStateChanged(user => {
            if (user) {
                resolve({user:user, isLogin:true});
            } else if (rejectIfUserNotFound) {
                reject('You have to log in first.');
            } else {
                resolve({user:null, isLogin:false});
            }
        })
    })
}

export function signOut() {
    const auth = firebase.auth()
    return new Promise ((resolve,reject) => {
        auth.signOut()
            .then( () => {
                resolve()
            })
            .catch( err => {
                reject(err.message)
            })
    })
}

export function signInWithEmailAndPassword(email, password) {
    const auth = firebase.auth()
    return new Promise ((resolve,reject) => {
        auth.signInWithEmailAndPassword(email, password)
        .then( response => {
            resolve(response.user);
        })
        .catch( err => {
            reject(err.message)
        })
    })
}