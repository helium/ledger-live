// @flow

import React from 'react'
import { ThemeProvider } from 'styled-components'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'

import theme from 'styles/theme'

import i18n from 'renderer/i18n'

import Wrapper from 'components/Wrapper'

export default ({
  store,
  history,
  language,
}: {
  store: Object,
  history: Object,
  language: string,
}) => (
  <Provider store={store}>
    <I18nextProvider i18n={i18n} initialLanguage={language}>
      <ThemeProvider theme={theme}>
        <ConnectedRouter history={history}>
          <Wrapper />
        </ConnectedRouter>
      </ThemeProvider>
    </I18nextProvider>
  </Provider>
)
