import { Layout } from 'antd';
import React, { Component } from 'react';
import { Route, Router, Redirect, Switch } from 'react-router';

import Header from './components/Header';
import MarketFooter from './components/MarketFooter';

import { routes } from './routes';

import './less/App.less';

const { Content } = Layout;

class App extends Component {
  componentDidMount() {
    if (localStorage) {
      localStorage.setItem('showWelcomeMessage', true);
    }
  }

  render() {
    return (
      <Router history={this.props.history}>
        <Switch>
          <Layout style={{ minHeight: '100vh' }}>
            <Header />
            <Content>
              {routes.map(route => <Route key={route.path} {...route} />)}
              <Redirect from='/exchange/*' to='/exchange' />
            </Content>

            <MarketFooter />
          </Layout>
          
        </Switch>
      </Router>
    );
  }
}

export default App;
