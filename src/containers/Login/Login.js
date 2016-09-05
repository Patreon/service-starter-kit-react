import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import * as authActions from 'redux/modules/auth';

@connect(
    state => ({user: state.auth.user}),
    authActions
)
export default class Login extends Component {
    static propTypes = {
        user: PropTypes.object,
        login: PropTypes.func,
        logout: PropTypes.func,
        signup: PropTypes.func
    }

    state = {
        showSignup: false
    }

    showLogin = () => {
        this.setState({ showSignup: false });
    }

    showSignup = () => {
        this.setState({ showSignup: true });
    }

    handleSubmitLogin = (event) => {
        event.preventDefault();
        const emailInput = this.refs.loginEmail;
        const passwordInput = this.refs.loginPassword;
        this.props.login(emailInput.value, passwordInput.value);
    }

    handleSubmitSignup = (event) => {
        event.preventDefault();
        const emailInput = this.refs.signupEmail;
        const passwordInput = this.refs.signupPassword;
        const confirmPasswordInput = this.refs.signupConfirmPassword;
        if (passwordInput.value !== confirmPasswordInput.value) {
            console.log('no match');
        }
        this.props.signup(emailInput.value, passwordInput.value);
    }

    render() {
        const {user, logout} = this.props;
        const styles = require('./Login.scss');
        return (
            <div className={styles.loginPage + ' container'}>
                <Helmet title="Login"/>
                <h1>Login</h1>
                {!user && !this.state.showSignup &&
                    <div>
                        <form className="login-form form-inline" onSubmit={this.handleSubmitLogin}>
                            <div className="form-group">
                                <input type="text" ref="loginEmail" placeholder="Enter your email" className="form-control"/>
                            </div>
                            <div className="form-group">
                                <input type="password" ref="loginPassword" placeholder="Enter your password" className="form-control"/>
                            </div>
                            <button className="btn btn-success" onClick={this.handleSubmitLogin}><i className="fa fa-sign-in"/>
                                {' '}Log In
                            </button>
                        </form>
                        <div>
                            Or,{' '}
                            <button className="btn" onClick={this.showSignup}>
                                Sign Up
                            </button>
                        </div>
                    </div>
                }
                {!user && this.state.showSignup &&
                    <div>
                        <form className="signup-form form-inline" onSubmit={this.handleSubmitSignup}>
                            <div className="form-group">
                                <input type="text" ref="signupEmail" placeholder="Enter your email" className="form-control"/>
                            </div>
                            <div className="form-group">
                                <input type="password" ref="signupPassword" placeholder="Enter your password" className="form-control"/>
                            </div>
                            <div className="form-group">
                                <input type="password" ref="signupConfirmPassword" placeholder="Confirm your password" className="form-control"/>
                            </div>
                            <button className="btn btn-success" onClick={this.handleSubmitSignup}><i className="fa fa-sign-in"/>
                                {' '}Sign Up
                            </button>
                        </form>
                        <div>
                            Or,{' '}
                            <button className="btn" onClick={this.showLogin}>
                                Log In
                            </button>
                        </div>
                    </div>
                }
                {user &&
                    <div>
                        <p>You are currently logged in as {user.email}.</p>

                        <div>
                            <button className="btn btn-danger" onClick={logout}><i className="fa fa-sign-out"/>{' '}Log Out</button>
                        </div>
                    </div>
                }
            </div>
        );
    }
}
