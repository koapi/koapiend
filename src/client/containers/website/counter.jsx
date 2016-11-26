import React from 'react'
import Counter from '../../components/counter'
import { connect } from '../../lib/helper'
import { actions } from '../../reduxers'

class CounterApp extends React.Component {
  render () {
    return <div><Counter {...this.props} /></div>
  }
}

export default connect(state => ({ counter: state.counter }), actions.counter)(CounterApp)