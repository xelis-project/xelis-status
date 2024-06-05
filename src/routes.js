import App from './app'

import Layout from './layout/layout'
import Home from './pages/home/index'

const routes = [
  {
    element: <App />,
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
