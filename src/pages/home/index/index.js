import Icon from 'g45-react/components/fontawesome_icon'
import { useLang } from 'g45-react/hooks/useLang'
import { useCallback, useEffect, useMemo, useState } from 'react'
import FlagIcon from 'xelis-explorer/src/components/flagIcon'
import { WS as DaemonWS } from '@xelis/sdk/daemon/websocket'
import { Helmet } from 'react-helmet-async'

import style from './style'

function Home() {
  const { t } = useLang()
  const description = useMemo(() => {
    return `Quickly verify the status of official nodes by checking the colored dots for activity. If a node has been inactive for some time, reach out on Discord for assistance.`
  }, [])

  const loadBalancers = useMemo(() => [
    { location: 'Node Balancer #1', endpoint: 'https://node.xelis.io', icon: <Icon name="server" /> },
  ])

  const seedNodes = useMemo(() => [
    { location: 'US #1', endpoint: 'https://us-node.xelis.io', icon: <FlagIcon code="us" />, ws: 'wss://us-node.xelis.io/json_rpc' },
    { location: 'France #1', endpoint: 'https://fr-node.xelis.io', icon: <FlagIcon code="fr" />, ws: 'wss://fr-node.xelis.io/json_rpc' },
    { location: 'Poland #1', endpoint: 'https://pl-node.xelis.io', icon: <FlagIcon code="pl" />, ws: 'wss://pl-node.xelis.io/json_rpc' },
    { location: 'Germany #1', endpoint: 'https://de-node.xelis.io', icon: <FlagIcon code="de" />, ws: 'wss://de-node.xelis.io/json_rpc' },
    { location: 'Singapore #1', endpoint: 'http://sg-node.xelis.io', icon: <FlagIcon code="sg" />, ws: 'wss://sg-node.xelis.io/json_rpc' },
    { location: 'United Kingdom #1', endpoint: 'http://uk-node.xelis.io', icon: <FlagIcon code="gb" />, ws: 'wss://uk-node.xelis.io/json_rpc' },
    { location: 'Canada #1', endpoint: 'http://ca-node.xelis.io', icon: <FlagIcon code="ca" />, ws: 'wss://ca-node.xelis.io/json_rpc' },
  ])

  const indexers = useMemo(() => [
    { location: 'US #1', endpoint: 'https://index.xelis.io', icon: <FlagIcon code='us' /> },
  ])

  return <div>
    <Helmet>
      <title>Home</title>
      <meta name="description" content={description} />
    </Helmet>
    <div className={style.header.container}>
      <div className={style.header.logo}></div>
      <h1 className={style.header.title}>XELIS Status</h1>
      <div className={style.header.description}>{description}</div>
    </div>
    {/*<div>
      <div className={style.statusList.title}>Load Balancers</div>
      <div className={style.statusList.description}>You can point your wallet / miner to this server. It redirects the request by offloading to other nodes.</div>
      <div className={style.statusList.items}>
        {loadBalancers.map((item) => <StatusItem key={item.endpoint} {...item} />)}
      </div>
    </div>*/}
    <div>
      <div className={style.statusList.title}>Seed Nodes</div>
      <div className={style.statusList.description}>
        These are the official Seed nodes. The network doesn't requires them to be alive at all time, it's a decentralized network.
        We provide them for others who can't run one for whatever reasons.
        Choose one with the best latency.
      </div>
      <div className={style.statusList.items}>
        {seedNodes.map((item) => <StatusItem key={item.endpoint} {...item} />)}
      </div>
    </div>
    <div>
      <div className={style.statusList.title}>Indexers</div>
      <div className={style.statusList.description}>This is a special server that index the entire blockchain and serves statistics for anyone to analyze.</div>
      <div className={style.statusList.items}>
        {indexers.map((item) => <StatusItem key={item.endpoint} {...item} />)}
      </div>
    </div>
  </div>
}

function StatusItem(props) {
  const { location, endpoint, icon, ws } = props

  const [elapsed, _setElapsed] = useState()
  const [status, setStatus] = useState(`init`)
  const [err, setErr] = useState()
  const [nodeInfo, setNodeInfo] = useState()

  const setElapsed = useCallback((elapsed) => {
    _setElapsed(elapsed)
    if (elapsed > 500) {
      setStatus(`slow`)
    } else {
      setStatus(`alive`)
    }
  })

  const checkEndpoint = useCallback(async () => {
    try {
      setErr(null)
      const start = new Date()
      await fetch(endpoint)
      const end = new Date()
      const elapsed = end - start
      setElapsed(elapsed)
    } catch (err) {
      setErr(err)
      setStatus(`dead`)
    }
  }, [endpoint])

  // load websocket and refresh on new block
  useEffect(() => {
    if (!ws) return

    const load = async () => {
      try {
        let lastRequest = new Date()
        const daemon = new DaemonWS()
        daemon.maxConnectionTries = 0
        daemon.timeout = 1000 // max timeout to avoid ui lag if node is not responding

        await daemon.connect(ws)

        const loadInfo = async (overwrite) => {
          try {
            const start = new Date()
            // if node is syncing this function can be called a lot
            // so we wait for at least 1s before doing another request
            if (!overwrite && start - lastRequest < 1000) return
            lastRequest = start
            const info = await daemon.methods.getInfo()
            setNodeInfo(info)
            const end = new Date()
            const elapsed = end - start
            setElapsed(elapsed)
          } catch (err) {
            setErr(err)
            setStatus(`dead`)
          }
        }

        loadInfo(true)
        daemon.methods.onNewBlock(async (event, data) => {
          loadInfo(false)
        })
      } catch (err) {
        setErr(err)
      }
    }

    load()
  }, [])

  // fallback to loading api endpoind and reload every 60s
  useEffect(() => {
    if (ws) return

    const reload = () => {
      checkEndpoint()
      setTimeout(reload, 60000)
    }

    reload()
  }, [checkEndpoint])

  let containerStyle = style.statusItem.container
  if (nodeInfo) containerStyle += ` ${style.statusItem.containerWithNodeInfo}`

  return <div>
    <div className={containerStyle}>
      <div>
        <div className={style.statusItem.title}>
          {icon}
          {location}
        </div>
        <a href={endpoint} target="_blank">{endpoint}</a>
      </div>
      <div>
        <div className={style.statusItem.latency}>
          {(!err && elapsed) && <>{elapsed} MS</>}
          {(err) && <>{err.message}</>}
          <div className={`${style.statusItem.dot.container} ${style.statusItem.dot[status]}`} />
        </div>
      </div>
    </div>
    {nodeInfo && <div className={style.statusItem.nodeInfo}>
      <NodeInfo {...nodeInfo} />
    </div>}
  </div>
}

function NodeInfo(props) {
  const { top_block_hash, height, topoheight, version } = props

  return <div className={style.nodeInfo.container}>
    <div className={style.nodeInfo.item.container}>
      <div className={style.nodeInfo.item.title}>Top Block</div>
      <div className={style.nodeInfo.item.value}>{top_block_hash}</div>
    </div>
    <div className={style.nodeInfo.item.container}>
      <div className={style.nodeInfo.item.title}>Height</div>
      <div className={style.nodeInfo.item.value}>{height.toLocaleString()}</div>
    </div>
    <div className={style.nodeInfo.item.container}>
      <div className={style.nodeInfo.item.title}>Topo Height</div>
      <div className={style.nodeInfo.item.value}>{topoheight.toLocaleString()}</div>
    </div>
    <div className={style.nodeInfo.item.container}>
      <div className={style.nodeInfo.item.title}>Version</div>
      <div className={style.nodeInfo.item.value}>{version}</div>
    </div>
  </div>
}

export default Home