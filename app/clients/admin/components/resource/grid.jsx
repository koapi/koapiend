import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import querystring from 'query-string'
import { push } from 'react-router-redux'
import { withRouter } from 'react-router'
import { ButtonDropdown } from '../../components/form'
import { DropdownToggle,
         DropdownMenu,
         DropdownItem } from 'reactstrap'
import { toastr } from 'react-redux-toastr'
import { Checkbox } from '../form'
import Pagination from '../pagination'
import { api, checklist } from '../../redux/actions'
import pluralize from 'pluralize'
import { FormattedMessage, injectIntl } from 'react-intl'
import style from '../../styles'
import Loading from 'react-loading'
import _ from 'lodash'

export class Grid extends React.Component {
  static childContextTypes = {
    list: React.PropTypes.object,
    location: React.PropTypes.object
  }
  getChildContext () {
    return {
      list: this,
      location: this.currentLocation
    }
  }
  confirmDelete (items, e) {
    const { intl } = this.props
    return toastr.confirm(intl.formatMessage({id: 'toastr.dangerous_confirm_message'}), {
      onOk: e => this.handleDestroy(items),
      onCancel: e => console.log('cancel')
    })
  }
  getConfig () {
    const { config } = this.props
    const resources = pluralize(config.resource)

    return {
      perPage: 12,
      perRow: 4,
      resources,
      resourcePath: `/${resources}`,
      ...config
    }
  }
  fetch (search) {
    const { dispatch, location } = this.props
    const config = this.getConfig()
    const params = querystring.parse(search || location.search)
    params.sort = '-created_at'
    return dispatch(api.list(config.resources, {perPage: config.perPage})(config.resourcePath, {params})).then(res => {
      dispatch(checklist.init(res.action.payload.data))
      return res
    })
  }
  componentWillMount () {
    this.fetch()
  }
  componentWillReceiveProps (nextProps) {
    if (this.props.location !== nextProps.location) {
      this.fetch(nextProps.location.search)
    }
  }
  componentWillUnmount () {
    this.props.dispatch(checklist.clear())
  }
  handlePageChange ({ selected }) {
    const { location, dispatch } = this.props
    let search = querystring.parse(location.search)
    search.page = selected + 1
    let newSearch = querystring.stringify(search)
    dispatch(push({...location, search: newSearch}))
  }
  handleDestroy (checklist) {
    const { dispatch, intl } = this.props
    const config = this.getConfig()
    const items = Object.entries(checklist).reduce((result, [id, checked]) => {
      checked && result.push(id)
      return result
    }, [])
    Promise.all(items.map(item => {
      return dispatch(api.destroy(config.resource)(`${config.resourcePath}/${item}`))
    })).then(v => {
      toastr.success(intl.formatMessage({id: 'toastr.success_title'}), intl.formatMessage({id: 'toastr.success_message'}))
      this.fetch()
    }).catch(e => {
      toastr.error(intl.formatMessage({id: 'toastr.error_title'}), e.response.data.message)
    })
  }
  handleCheckAll (e) {
    const { dispatch } = this.props
    dispatch(checklist.all(e.target.checked))
  }
  handleItemCheck (item, e) {
    const { dispatch } = this.props
    dispatch(checklist.one(item.id, e.target.checked))
  }
  renderItem (item) {
    return (<div>{JSON.stringify(item)}</div>)
  }
  renderCreateButton () {
    const { config } = this.props
    const resources = pluralize(config.resource)
    return (
      <Link to={`/${resources}/create`} className='btn btn-primary btn-sm rounded-s'>
        <FormattedMessage id='upload' />
      </Link>
    )
  }
  renderBatchActions () {
    const { checklist } = this.props
    return (
      <DropdownItem onClick={this.confirmDelete.bind(this, checklist)}>
        <i className='fa fa-remove' /><FormattedMessage id='delete' />
      </DropdownItem>
    )
  }
  renderBody () {
    const { api } = this.props
    const config = this.getConfig()
    const response = _.get(api, `${config.resources}.response`, [])
    return _.chunk(response, config.perRow).map((row, rid) => (
      <div className='row' key={`row-${rid}`}>
        {row.map((item, cid) => (
          <div className='col-sm-3' key={`col-${row}-${cid}`}>
            {this.renderItem(item, cid)}
          </div>
        ))}
      </div>
    ))
  }

  render () {
    const { api, location } = this.props
    const config = this.getConfig()
    const query = querystring.parse(location.search)
    const page = parseInt(query.page || 1) - 1
    const pageCount = (api[config.resources] && api[config.resources].range) ? Math.ceil(api[config.resources].range.length / config.perPage) : 1
    const status = _.get(api, `${config.resources}.status`, 'pending')

    return (
      <article className='content cards-page'>
        <div className='title-search-block'>
          <div className='title-block'>
            <div className='row'>
              <div className='col-md-6'>
                <h3 className='title'> {config.listTitle}&nbsp;
                  {this.renderCreateButton()}
                  &nbsp;
                  <ButtonDropdown style={{marginBottom: '5px'}} group>
                    <DropdownToggle className='rounded-s' caret size='sm'>
                      <FormattedMessage id='batch_actions' />
                    </DropdownToggle>
                    <DropdownMenu>{this.renderBatchActions()}</DropdownMenu>
                  </ButtonDropdown>
                </h3>
                <p className='title-description'> {config.listBrief} </p>
              </div>
            </div>
          </div>
          <div className='items-search' />
        </div>
        <section className='section'>
          {status === 'pending' && (
            <div className='row'>
              <div className='col-sm-12'>
                <div style={{marginLeft: 'auto', marginRight: 'auto', width: '64px', height: '64px'}}>
                  <Loading delay={0} type='cylon' color={style.primaryColor} />
                </div>
              </div>
            </div>
          )}
          {status === 'rejected' && (
            <div className='row'>
              <div className='col-sm-12 text-sm-center'>
                {api[config.resources].response}
              </div>
            </div>
          )}
          {status === 'fulfilled' && this.renderBody()}
        </section>
        <div className='row'>
          <div className='col-sm-4'>
            <Checkbox ref='checkAll' label={<FormattedMessage id='check_all' />} onChange={this.handleCheckAll.bind(this)} />
          </div>
          <div className='col-sm-8'>
            <nav className='text-sm-right'>
              <Pagination initialPage={page} pageCount={pageCount} onPageChange={this.handlePageChange.bind(this)} />
            </nav>
          </div>
        </div>
        {this.props.children}
      </article>
    )
  }
}

export default function (config) {
  const { connectedState, ...others } = config
  return (Component = Grid) => {
    return connect(state => ({
      api: state.api,
      checklist: state.checklist,
      oauth: state.oauth,
      ...connectedState }))(injectIntl(withRouter(props => <Component {...props} config={others} />)))
  }
}