import { createElement } from 'react'
import { Helmet } from 'react-helmet-async'
import { extractCss, setup } from 'goober'
import useTheme, { ThemeProvider } from 'xelis-explorer/src/hooks/useTheme'
import { Outlet } from 'react-router-dom'
import { favicon } from 'xelis-explorer/src/components/favicon'

import "reset-css/reset.css"

import 'xelis-explorer/src/style/theme'
import 'xelis-explorer/src/style/page'
import 'xelis-explorer/src/style/scrollbar'

setup(createElement) // this is for goober styled() func

let css = ``

function SubApp() {
  if (!css) {
    css = extractCss()
  }

  return <>
    <Helmet titleTemplate='%s · XELIS Status'>
      {favicon()}
      <style>{css}</style> {/* Don't use id="_goober" or css will flicker. Probably an issue with goober reseting css.*/}
    </Helmet>
    <Outlet />
  </>
}

function App() {
  return <ThemeProvider>
    <SubApp />
  </ThemeProvider>
}

export default App