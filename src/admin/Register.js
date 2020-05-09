import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import Footer from '../components/Footer';
import * as auth from './functions/authenticationFuctions';
import * as system from '../functions/systemFunctions';
import LoadingPage from '../components/LoadingPage';
import ErrorPage from '../components/ErrorPage';

class Register extends React.Component {
    state = {
        isLoadingComplete: false,
        isSignedIn: false
    };

    componentDidMount() {
        system.getSystemConfig(false)
            .then(res => {
                const isFirstInitSystem = res.isFirstInitSystem;
                this.setState({ isFirstInitSystem: isFirstInitSystem });
                console.log(isFirstInitSystem)
                const isRegisterEnabled = isFirstInitSystem ? true : res.systemConfig.isRegisterEnabled;
                if (isRegisterEnabled) {
                    // Listen to the Firebase Auth state and set the local state.
                    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
                        (user) => this.setState({ isSignedIn: !!user })
                    );
                }
                this.setState({
                    isLoadingComplete: true,
                    isRegisterEnabled: isRegisterEnabled
                });
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    isLoadingComplete: true,
                    isError: true,
                    errorMessage: err
                })
            })
    }
    // Make sure we un-register Firebase observers when the component unmounts.
    componentWillUnmount() {
        this.unregisterAuthObserver();
    }

    uiConfig = {
        // Popup signin flow rather than redirect flow.
        signInFlow: 'popup',
        // We will display Google , Facebook , Etc as auth providers.
        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
        ],
        callbacks: {
            // Avoid redirects after sign-in.
            signInSuccess: () => false
        }
    };

    render() {
        const { isLoadingComplete, isFirstInitSystem, isRegisterEnabled, isSignedIn, isError, errorMessage } = this.state;
        if (!isLoadingComplete) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'none'} />
        } else if (isRegisterEnabled) {
            if (isSignedIn && isFirstInitSystem) {
                return (
                    <div className="body body-center bg-gradient">
                        <div className="wrapper text-left">
                            <h1>Welcome</h1>
                            <p>Welcome {firebase.auth().currentUser.displayName}!</p>
                            <p>No course year has been created. You have to create one by press the button below</p>
                            <div>
                                <a role="button" className="btn btn-purple m-1" href="/admin/system/config/year">Config Course Years</a>
                                <button className="btn btn-green m-1" onClick={() => firebase.auth().signOut()}>Sign out</button>
                            </div>
                        </div>
                        <Footer />
                    </div>
                )
            } else if (isSignedIn) {
                return (
                    <div className="body body-center bg-gradient">
                        <div className="wrapper text-left">
                            <h1>Welcome</h1>
                            <p>Welcome {firebase.auth().currentUser.displayName}!</p>
                            <div>
                                <a className="btn btn-purple m-1" href="/admin">System Management</a>
                                <button className="btn btn-green m-1" onClick={() => firebase.auth().signOut()}>Sign out</button>
                            </div>
                        </div>
                        <Footer />
                    </div>
                )

            } else {
                return (
                    <div className="body body-center bg-gradient">
                        <div className="wrapper-no-color text-white">
                            <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()} />
                        </div>
                        <Footer />
                    </div>
                )
            }
        } else {
            return (
                <ErrorPage
                    errorTitle={'Sorry, register is currently disabled.'}
                    errorMessage={'Register is currently disabled. Contact the admin for more information.'}
                    btn={'none'}
                />
            )
        }

    }
}

export default Register;