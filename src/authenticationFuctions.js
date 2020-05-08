import firebase from 'firebase/app';
import 'firebase/auth';

export function checkAuthState(rejectIfUserNotFound = true){
    const auth = firebase.auth()
    return new Promise ((resolve,reject) => {
        auth.onAuthStateChanged(user => {
            if (user) {
                console.log('User has signed in.')
                resolve({user:user, isLogin:true});
            } else if (rejectIfUserNotFound) {
                console.log('User has not signed in.')
                reject('You have to sign in to access this page.');
            } else {
                console.log('User has not signed in.')
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
                console.log('Signed out.')
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
                console.log('Signed in.')
                resolve(response.user);
            })
            .catch( err => {
                reject(err.message)
            })
        })
}