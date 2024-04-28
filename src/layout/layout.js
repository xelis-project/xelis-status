import { Outlet } from 'react-router'
import Background from 'xelis-explorer/src/layout/background'
import { css } from 'goober'

import { style as layoutStyle } from 'xelis-explorer/src/style/layout'

const style = {
  container: css`
    padding-bottom: 5em;
  `
}

function Layout() {
  return <div className={layoutStyle.container}>
    <Background />
    <div className={layoutStyle.layoutFlex}>
      <div className="layout-max-width">
        <div className={style.container}>
          <Outlet />
        </div>
      </div>
    </div>
  </div>
}

export default Layout
