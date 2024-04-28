import Icon from 'g45-react/components/fontawesome_icon'
import { useLang } from 'g45-react/hooks/useLang'
import { css } from 'goober'
import { useCallback, useEffect, useMemo, useState } from 'react'
import theme from 'xelis-explorer/src/style/theme'
import FlagIcon from 'xelis-explorer/src/components/flagIcon'

const style = {
  container: css`

  `,
  title: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 2em 0 3em 0;
    gap: 1em;

    > :nth-child(1) {
      width: 3em;
      height: 3em;
      display: block;
      background-size: contain;
      background-repeat: no-repeat;
      background-image: ${theme.apply({ xelis: `url('public/img/white_background_black_logo.svg')`, light: `url('public/img/black_background_white_logo.svg')`, dark: `url('public/img/white_background_black_logo.svg')`, })};
    }

    > :nth-child(2) {
      font-size: 2.5em;
      font-weight: bold;
    }

    > :nth-child(3) {
      max-width: 27em;
      text-align: center;
      opacity: .9;
    }
  `,
  statusList: css`
    > :nth-child(1) {
      font-size: 2em;
      font-weight: bold;
      margin-top: 1em;
      margin-bottom: .25em;
    }

    > :nth-child(2) {
      margin-bottom: 1em;
      color: var(--muted-color);
    }

    > :nth-child(3) {
      display: flex;
      gap: 1em;
      flex-direction: column;
    }
  `,
  statusItem: css`
    display: flex;
    gap: 1em;
    justify-content: space-between;
    align-items: center;

    background-color: ${theme.apply({ xelis: `rgb(0 0 0 / 50%)`, dark: `rgb(0 0 0 / 50%)`, light: `rgb(255 255 255 / 50%)` })};
    padding: 1em;
    border-radius: .5em;

    > :nth-child(1) > :nth-child(1) {
      font-size: 1.2em;
      margin-bottom: .5em;
      display: flex;
      gap: .5em;
    }

    > :nth-child(2) {
      display: flex;
      gap: 1em;
      flex-direction: row;
      align-items: center;
    }
  `,
  statusDot: css`
    min-width: 1.1em;
    min-height: 1.1em;
    max-width: 1.1em;
    max-height: 1.1em;
    border-radius: 50%;

    &.dead {
      background-color: red;
    }

    &.slow {
      background-color: yellow;
    }

    &.alive {
      background-color: green;
    }

    &.init {
      background-color: gray;
    }
  `
}

function Home() {
  const { t } = useLang()
  const description = useMemo(() => {
    return `Quickly verify the status of official nodes by checking the colored dots for activity. If a node has been inactive for some time, reach out on Discord for assistance.`
  }, [])

  const [loadBalancers, setLoadBalancers] = useState([
    { location: "Node Balancer #1", endpoint: "https://node.xelis.io", icon: <Icon name="server" /> },
  ])

  const [seedNodes, setSeedNodes] = useState([
    { location: "US #1", endpoint: "https://us-node.xelis.io", icon: <FlagIcon code="us" /> },
    { location: "France #1", endpoint: "https://fr-node.xelis.io", icon: <FlagIcon code="fr" /> },
    { location: "Poland #1", endpoint: "https://pl-node.xelis.io", icon: <FlagIcon code="pl" /> },
    { location: "Germany #1", endpoint: "https://de-node.xelis.io", icon: <FlagIcon code="de" /> },
    { location: "Singapore #1", endpoint: "https://sg-node.xelis.io", icon: <FlagIcon code="sg" /> },
  ])

  const [indexers, setIndexers] = useState([
    { location: "US #1", endpoint: "https://index.xelis.io", icon: <FlagIcon code="us" /> },
  ])

  const checkEndpoint = useCallback(async (endpoint) => {
    const start = Date.now()
    let success = false
    let err = null
    try {
      await fetch(endpoint)
      success = true
    } catch (e) {
      // failed
      err = e
    }

    const end = Date.now()
    const elapsed = end - start

    return { endpoint, success, elapsed, err }
  }, [])

  const updateStatus = useCallback((items, setItemsState) => {
    items.forEach((item) => {
      const { endpoint } = item
      checkEndpoint(endpoint).then((res) => {
        setItemsState((items) => {
          return items.map((item) => {
            if (item.endpoint == res.endpoint) {
              return { ...item, status: res }
            }

            return item
          })
        })
      })
    })
  }, [])

  useEffect(() => {
    const updateRate = 30000 // 30s

    const update = () => {
      updateStatus(loadBalancers, setLoadBalancers)
      updateStatus(seedNodes, setSeedNodes)
      updateStatus(indexers, setIndexers)
    }

    update()
    setInterval(update, updateRate)
  }, [])

  return <div className={style.container}>
    <div className={style.title}>
      <div /> {/* This is the logo */}
      <h1>XELIS Status</h1>
      <div>{description}</div>
    </div >
    <div className={style.statusList}>
      <div>Load Balancers</div>
      <div>You can point your wallet / miner to this server. It redirects the request by offloading to other nodes.</div>
      <div>{loadBalancers.map((item) => <StatusItem key={item.endpoint} {...item} />)}</div>
    </div>
    <div className={style.statusList}>
      <div>Seed Nodes</div>
      <div>
        These are the official Seed nodes. The network doesn't requires them to be alive at all time, it's a decentralized network. 
        We provide them for others who can't run one for whatever reasons.
        Choose one with the best latency.
      </div>
      <div>{seedNodes.map((item) => <StatusItem key={item.endpoint} {...item} />)}</div>
    </div>
    <div className={style.statusList}>
      <div>Indexers</div>
      <div>This is a special server that index the entire blockchain and serves statistics for anyone to analyze.</div>
      <div>{indexers.map((item) => <StatusItem key={item.endpoint} {...item} />)}</div>
    </div>
  </div>
}

function StatusItem(props) {
  const { location, endpoint, icon, status } = props

  const statusType = useMemo(() => {
    if (!status) return `init`

    const { success, elapsed } = status

    if (success) {
      if (elapsed > 500) {
        return `slow`
      }

      return `alive`
    }

    return `dead`
  }, [status])

  return <div className={style.statusItem}>
    <div>
      <div>
        {icon}
        {location}
      </div>
      <div><a href={endpoint} target="_blank">{endpoint}</a></div>
    </div>
    <div>
      {status && <>{status.elapsed} MS</>}
      <div className={`${style.statusDot} ${statusType}`} />
    </div>
  </div>
}

export default Home