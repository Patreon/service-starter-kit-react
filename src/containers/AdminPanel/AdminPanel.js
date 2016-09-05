import React, {Component} from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router';

export default class AdminPanel extends Component {
    render() {
        return (
            <div className="container">
                <h1>Admin Panel</h1>
                <Helmet title="Admin Panel"/>

                <div>
                    <Link to="/admin/widgets/list">
                        <div>All Widgets</div>
                    </Link>
                </div>
            </div>
        );
    }
}
