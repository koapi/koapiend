import middlewares from './middlewares';
import {compose, createStore, applyMiddleware, combineReducers} from 'redux';
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux'
import {browserHistory} from 'react-router'
import {reducer as formReducer} from 'redux-form'
import { reducer as reduxAsyncConnect } from 'redux-connect'
import _ from 'lodash'
import * as reducers from './reducers'
import config from './config'
import configure_oauth2, { reducer as oauthReducer } from 'redux-oauth2'

export function configure(reducers, initial, history) {
  // middlewares.push(routerMiddleware(history));
  const store = createStore(reducers, initial,
    compose(
    applyMiddleware.apply(this, middlewares),
    (window && window.devToolsExtension) ? window.devToolsExtension() : f => f
  ));

  return store;
}
export default function (history) {
  configure_oauth2(config.oauth);

  return configure(combineReducers({
    ...reducers,
    ...oauthReducer,
    reduxAsyncConnect,
    routing: routerReducer,
    form: formReducer
  }), __CLIENT__ ? window.__INITIAL_STATE__ : {}, history);
}
