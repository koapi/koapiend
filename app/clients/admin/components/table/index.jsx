import React from 'react'
import { Provider, Header, Body } from 'reactabular-table'
import _ from 'lodash'
import { translate } from 'react-i18next'

export function column (property, label, definition) {
  const base = {property, header: { label }}
  return _.merge(base, definition)
}

export default class extends React.Component {
  render () {
    const { data, columns, components, rowKey, ...others } = this.props
    const { status, response } = data || {}
    const rows = response || []
    return (
      <Provider columns={columns} components={components} {...others}>
        <Header />
        {(['pending', 'rejected'].includes(status))
          ? <Body error={response} loading={status === 'pending'} rows={[]} />
        : <Body rows={rows} empty={rows.length === 0} rowKey={rowKey || 'id'} />}
      </Provider>
    )
  }
}
