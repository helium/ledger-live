// @flow

import React, { PureComponent } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import bcrypt from 'bcryptjs'

import get from 'lodash/get'
import set from 'lodash/set'

import { setEncryptionKey } from 'helpers/db'

import type { SettingsProfile } from 'types/common'

import { unlock } from 'reducers/application'

import Box, { Card } from 'components/base/Box'
import Input from 'components/base/Input'
import Button from 'components/base/Button'

const Label = styled.label`
  display: block;
  text-transform: uppercase;
`

type InputValue = SettingsProfile

type Props = {
  settings: SettingsProfile,
  onSaveSettings: Function,
  unlock: Function,
}
type State = {
  inputValue: InputValue,
}

const mapDispatchToProps = {
  unlock,
}

class TabProfile extends PureComponent<Props, State> {
  state = {
    inputValue: {
      password: {
        ...this.props.settings.password,
        value: undefined,
      },
    },
  }

  handleChangeInput = (key: string) => (value: $Values<InputValue>) =>
    this.setState(prev => ({
      inputValue: {
        ...set(prev.inputValue, key, value),
      },
    }))

  handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { onSaveSettings, unlock } = this.props
    const { inputValue } = this.state

    const settings = {
      ...inputValue,
      password: {
        ...inputValue.password,
        value: '',
      },
    }

    const password = get(inputValue, 'password', {})

    if (password.state === true && password.value.trim() !== '') {
      settings.password.value = bcrypt.hashSync(password.value, 8)
      setEncryptionKey('accounts', password.value)
    } else {
      setEncryptionKey('accounts', undefined)
    }

    unlock()

    onSaveSettings(settings)
  }

  render() {
    const { inputValue } = this.state
    return (
      <form onSubmit={this.handleSubmit}>
        <Card>
          <Box horizontal>
            <input
              type="checkbox"
              checked={get(inputValue, 'password.state', false)}
              onChange={e => this.handleChangeInput('password.state')(e.target.checked)}
            />{' '}
            with password
          </Box>
          {get(inputValue, 'password.state') === true && (
            <Box>
              <Label>Password</Label>
              <Input
                value={get(inputValue, 'password.value', '')}
                onChange={this.handleChangeInput('password.value')}
                type="password"
              />
            </Box>
          )}
          <Box>
            <Button type="submit">Save</Button>
          </Box>
        </Card>
      </form>
    )
  }
}

export default connect(null, mapDispatchToProps)(TabProfile)
