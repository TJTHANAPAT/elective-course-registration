import React from 'react';
import Switch from 'react-switch';
import firebase from 'firebase/app';
import 'firebase/firestore';

import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';

import * as auth from './functions/authenticationFuctions';
import * as system from '../systemFunctions';

class Registration extends React.Component {
    state = {
        isLoadingComplete: false,
        isError: false,
        errorMessage: '',
        isRegisterEnabled: false
    }
    componentDidMount = () => {
        const shortid = require('shortid');
        console.log(shortid.generate());
        auth.checkAuthState()
            .then(() => {
                return system.getSystemConfig();
            })
            .then(res => {
                const systemConfig = res.systemConfig;
                this.setState({
                    isRegisterEnabled: systemConfig.isRegisterEnabled,
                    isLoadingComplete: true
                })
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

    goBack = () => {
        window.history.back();
    }

    updateInput = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        })
        console.log(event.target.id, ':', event.target.value)
    }

    handleChangeEnableBtn = (checked, event) => {
        event.preventDefault();
        this.setState({ isRegisterEnabled: checked });
    }

    save = (event) => {
        event.preventDefault();
        const db = firebase.firestore();
        const configRef = db.collection('systemConfig').doc('config')
        const { isRegisterEnabled } = this.state;
        let config = { isRegisterEnabled: isRegisterEnabled }
        configRef.update(config)
            .then(() => {
                console.log('Save successfully!')
                alert('Save successfully!')
            })
            .catch(err => {
                console.error('Error: ', err)
                alert('Save failed!')
            })
    }

    render() {
        const { isLoadingComplete, isError, errorMessage } = this.state;

        if (!isLoadingComplete) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'back'} />
        } else {
            const { isRegisterEnabled } = this.state;
            return (
                <div className="body bg-gradient">
                    <div className="wrapper text-left">
                        <h1>Elective Course Enrollment System</h1>
                        <h2>Registration</h2>
                        <ul className="list-group admin mt-3 mb-3">
                            <li className="list-group-item">
                                <div className="list-item-text">
                                    <span>Enable Register</span>
                                </div>
                                <div className="list-item-action-panel">
                                    <Switch
                                        onChange={this.handleChangeEnableBtn}
                                        checked={isRegisterEnabled}
                                    />
                                </div>
                            </li>
                        </ul>
                        <div className="mt-2">
                            <button type="submit" className="btn btn-purple" onClick={this.save}>Save</button>
                            <button onClick={this.goBack} className="btn btn-secondary ml-2">Back</button>
                        </div>
                    </div>
                    <Footer />
                </div>
            )
        }
    }
}

export default Registration;