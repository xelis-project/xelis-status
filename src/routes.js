import App from 'xelis-explorer/src/app'

import Layout from './layout/layout'
import Home from './pages/home'

const routes = [
  {
    element: <App title="XELIS Status" />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: '/',
            element: <Home />,
          },
        ]
      }
    ]
  }
]

export default routes
