import React from 'react';
import LoadingPage from '../components/LoadingPage';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';
import SystemManagement from './SystemManagement';
import Register from './Register';
import * as auth from './functions/authenticationFuctions';
import * as system from '../functions/systemFunctions';


class Admin extends React.Component {

    state = {
        isLoadindComplete: false
    }

    componentDidMount = () => {
        system.getSystemConfig(false)
            .then(res => {
                const isFirstInitSystem = res.isFirstInitSystem;
                console.log(res);
                this.setState({ isFirstInitSystem: isFirstInitSystem });
                if (!isFirstInitSystem) {
                    auth.checkAuthState(false)
                        .then(res => {
                            const user = res.user;
                            const isLogin = res.isLogin;
                            this.setState({
                                currentUser: user,
                                isLogin: isLogin,
                                isLoadindComplete: true
                            })
                        })
                        .catch(err => {
                            console.error(err);
                            this.setState({
                                isLoadindComplete: true,
                                isError: true,
                                errorMessage: err
                            })
                        })
                } else {
                    this.setState({ isLoadindComplete: true })
                }
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    isLoadindComplete: true,
                    isError: true,
                    errorMessage: err
                })
            })

    }

    updateInput = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    login = event => {
        event.preventDefault()
        const { email, password } = this.state
        this.setState({ isLoadindComplete: false });
        auth.signInWithEmailAndPassword(email, password)
            .then(res => {
                this.setState({
                    currentUser: res,
                    isLogin: true,
                    isLoadindComplete: true
                })
            })
            .catch(err => {
                this.setState({
                    isLoadindComplete: true,
                    isError: true,
                    errorMessage: err
                })
                console.log(err)
            })
    }

    loginForm = () => {
        const updateInput = this.updateInput;
        return (
            <form onSubmit={this.login} className="mt-4">
                <div className="input-group mb-2">
                    <div className="input-group-prepend">
                        <div className="input-group-text">
                            <i className="fa fa-user"></i>
                        </div>
                    </div>
                    <input type="email" className="form-control" id="email" placeholder="admin@email.com" onChange={updateInput} required />
                </div>
                <div className="input-group mb-2">
                    <div className="input-group-prepend">
                        <div className="input-group-text">
                            <i className="fa fa-lock"></i>
                        </div>
                    </div>
                    <input type="password" className="form-control" id="password" placeholder="Password" onChange={updateInput} required />
                </div>
                <button type="submit" className="btn btn-wrapper-bottom btn-purple ">Sign in</button>
            </form>
        )
    }

    render() {
        const { isLoadindComplete, isFirstInitSystem, isLogin, isError, errorMessage } = this.state;
        if (!isLoadindComplete) {
            return <LoadingPage />
        } else if (isError) {
            return <ErrorPage errorMessage={errorMessage} btn={'none'} />
        } else if (isFirstInitSystem) {
            return <Register />
        } else if (isLogin) {
            return <SystemManagement />
        } else {
            return (
                <div className="body body-center bg-gradient">
                    <div className="wrapper login-form text-left">
                        <h1>Sign In</h1>
                        {this.loginForm()}
                    </div>
                    <Footer />
                </div>
            )
        }
    }

}

export default Admin;