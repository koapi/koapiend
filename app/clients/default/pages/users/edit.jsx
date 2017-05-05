import React from 'react'
import Joi from 'joi'
import { toastr } from 'react-redux-toastr'
import { Field, change } from 'redux-form'
import { Button, Input } from 'reactstrap'
import { Select } from '../../components/form'
import dropzone from '../../components/dropzone'
import modal from '../../components/resource/modal'
import { api, result } from '../../redux/actions'
import { FormattedMessage } from 'react-intl'
import { CreateForm } from './create'
import _ from 'lodash'

const schema = {
  username: Joi.string().required(),
  avatar: Joi.string().allow(''),
  roles: Joi.array(),
  email: Joi.string().email().required()
}

export class EditForm extends CreateForm {
  renderBody () {
    const { user_form, result: { avatar = {} }, dispatch } = this.props
    const avatarPath = avatar.file_path || _.get(user_form, 'values.avatar')
    const Avatar = dropzone({
      keyName: 'avatar',
      onSuccess: files => {
        dispatch(result.set('avatar')(files[0].value.data))
        dispatch(change('user', 'avatar', files[0].value.data.file_path))
      },
      onError: console.error
    })(props => (
      <div className='image rounded' style={{backgroundImage: `url(${avatarPath})`}}>
        {!avatarPath && <div className='dropfilezone'>拖放头像至此</div>}
      </div>
    ))
    return (
      <div className='row'>
        <div className='col-sm-3'>
          <Avatar multiple={false} refCallback={node => { this.dropzone = node }} />
          <Button type='button' block color='primary' size='sm' onClick={e => this.dropzone.open()}>上传</Button>
          <Field component={({input, meta, ...others}) => (<Input {...input} {...others} />)}
            style={{display: 'none'}} type='text' name='avatar' />
        </div>
        <div className='col-sm-9'>{this.renderFields()}</div>
      </div>
    )
  }
  handleSubmit (values) {
    const { intl, dispatch, match } = this.props
    const { roles } = values
    const data = _.omit(values, ['id', 'roles'])
    return new Promise((resolve, reject) => {
      dispatch(api.patch('user')(`/users/${match.params.id}`, {...data, roles: (roles || []).map(role => role.value)})).then(v => {
        this.handleClose()
        toastr.success(intl.formatMessage({id: 'success_title'}), intl.formatMessage({id: 'success_message'}))
        return v
      }).then(resolve).catch(e => {
        console.log(e)
        reject(e)
      })
    })
  }
}

export default modal({
  mapStateToProps: [state => {
    let res = _.get(state.api, `user.response`)
    let user
    if (res) {
      let roles
      const { username, email, avatar } = res
      if (res.roles) {
        roles = res.roles.map(role => ({value: role.id, label: role.name}))
      }
      user = {roles, username, email, avatar}
      user.avatar = user.avatar || ''
    }
    return {
      result: state.result,
      initialValues: user,
      api: state.api,
      user_form: state.form.user
    }
  }],
  resource: 'user',
  formTitle: <FormattedMessage id='user.edit' />,
  method: 'patch',
  fields: [
    {name: 'username', label: <FormattedMessage id='username' />, type: 'text'},
    {name: 'email', label: <FormattedMessage id='email' />, type: 'text'},
    function (props) {
      const { api } = this.props
      const options = _.get(api, 'roles.response', []).map(role => ({value: role.id, label: role.name}))
      return <Field key='roles' component={Select} label={<FormattedMessage id='user.role' />} multi name='roles' options={options} />
    }
  ],
  validate: schema
})(EditForm)