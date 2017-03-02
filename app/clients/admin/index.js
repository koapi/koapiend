import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router'
import { createHistory } from 'history'
import { connect, Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import { ReduxAsyncConnect } from 'redux-connect'
import { NProgress } from 'redux-nprogress'
import Notifications from 'react-notification-system-redux'
import { UserAuthWrapper } from 'redux-auth-wrapper'
import { storeInitialize } from 'react-redux-oauth2'
import * as Containers from './containers'
import createStore from './store'
import { admin } from '../../../config/client'

const History = useRouterHistory(createHistory)({
  basename: admin.basename || '/'
})
const store = createStore(History)
const history = syncHistoryWithStore(History, store)

const ReduxNotifications = connect(
  state => ({ notifications: state.notifications })
)(Notifications)

const UserIsAuthenticated = UserAuthWrapper({
  authSelector: state => state.oauth.user, // how to get the user state
  failureRedirectPath: '/signin',
  wrapperDisplayName: 'UserIsAuthenticated' // a nice name for this auth check
})

function oauthInit (store) {
  return function (n, r, cb) {
    if (!process.env.__SERVER__) {
      const { oauth: { user } } = store.getState()
      if (!user) {
        storeInitialize(document.cookie, store).then(data => cb()).catch(e => {
          console.error(e)
          cb()
        })
      } else {
        cb()
      }
    } else {
      cb()
    }
  }
}

ReactDOM.render((
  <Provider store={store}>
    <Router render={props => <ReduxAsyncConnect {...props} />} history={history}>
      <Route
        component={props =>
          <div>
            <NProgress />
            <ReduxNotifications />
            {props.children}
          </div>}
      >
        <Route path='/signin' component={Containers.Signin} />
        <Route
          path='/'
          onEnter={oauthInit(store)}
          component={UserIsAuthenticated(Containers.Index)}
        >
          <IndexRoute component={Containers.Dashboard} />
          <Route path='test' component={Containers.Test} />
          <Route path='list' component={Containers.List} />
          <Route path='form' component={Containers.Form} />
        </Route>
      </Route>
    </Router>
  </Provider>
), document.getElementById('koapp'))
