import React from 'react';
import Switch from 'react-switch';
import firebase from 'firebase/app';
import 'firebase/firestore';

import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';

import * as auth from './functions/authenticationFuctions';
import * as system from '../functions/systemFunctions';

class Settings extends React.Component {

    state = {
        isLoadingComplete: false,
        isError: false,
        errorMessage: '',
        isRegisterEnabled: false
    }

    componentDidMount = () => {
        auth.checkAuthState()
            .then(() => {
                return system.getSystemConfig();
            })
            .then(res => {
                const systemConfig = res.systemConfig;
                this.setState({
                    isRegisterEnabled: systemConfig.isRegisterEnabled,
                    isSearchEnabled: systemConfig.isSearchEnabled,
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

    handleChangeEnableBtn = (checked, event, id) => {
        event.preventDefault();
        console.log(id, checked);
        this.setState({ [id]: checked });
    }

    save = (event) => {
        event.preventDefault();
        const db = firebase.firestore();
        const configRef = db.collection('systemConfig').doc('config')
        const { isRegisterEnabled, isSearchEnabled } = this.state;
        let config = {
            isRegisterEnabled: isRegisterEnabled,
            isSearchEnabled: isSearchEnabled
        }
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
            const { isRegisterEnabled, isSearchEnabled } = this.state;
            return (
                <div className="body bg-gradient">
                    <div className="wrapper text-left">
                        <h1>Elective Course Enrollment System</h1>
                        <h2>Settings</h2>
                        <ul className="list-group admin mt-3 mb-3">
                            <li className="list-group-item">
                                <div className="list-item-text">
                                    <span>Enable Register</span>
                                </div>
                                <div className="list-item-action-panel">
                                    <Switch
                                        id={'isRegisterEnabled'}
                                        onChange={this.handleChangeEnableBtn}
                                        checked={isRegisterEnabled}
                                    />
                                </div>
                            </li>
                            <li className="list-group-item">
                                <div className="list-item-text">
                                    <span>Enable Search Student Data</span>
                                </div>
                                <div className="list-item-action-panel">
                                    <Switch
                                        id={'isSearchEnabled'}
                                        onChange={this.handleChangeEnableBtn}
                                        checked={isSearchEnabled}
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

export default Settings;