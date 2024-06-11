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

  const [loadBalancers, setLoadBalancers] = useState([
    { location: 'Node Balancer #1', endpoint: 'https://node.xelis.io', icon: <Icon name="server" /> },
  ])

  const [seedNodes, setSeedNodes] = useState([
    { location: 'US #1', endpoint: 'https://us-node.xelis.io', icon: <FlagIcon code="us" />, apiEndpoint: 'wss://us-node.xelis.io/json_rpc' },
    { location: 'France #1', endpoint: 'https://fr-node.xelis.io', icon: <FlagIcon code="fr" />, apiEndpoint: 'wss://fr-node.xelis.io/json_rpc' },
    { location: 'Poland #1', endpoint: 'http://51.68.142.141:8080', icon: <FlagIcon code="pl" />, apiEndpoint: 'ws://51.68.142.141:8080/json_rpc' },
    { location: 'Germany #1', endpoint: 'http://162.19.249.100:8080', icon: <FlagIcon code="de" />, apiEndpoint: 'ws://162.19.249.100:8080/json_rpc' },
    { location: 'Singapore #1', endpoint: 'http://139.99.89.27:8080', icon: <FlagIcon code="sg" />, apiEndpoint: 'ws://139.99.89.27:8080/json_rpc' },
    { location: 'United Kingdom #1', endpoint: 'http://51.195.220.137:8080', icon: <FlagIcon code="gb" />, apiEndpoint: 'ws://51.195.220.137:8080/json_rpc' },
    { location: 'Canada #1', endpoint: 'http://66.70.179.137:8080', icon: <FlagIcon code="ca" />, apiEndpoint: 'ws://66.70.179.137:8080/json_rpc' },
  ])

  const [indexers, setIndexers] = useState([
    { location: 'US #1', endpoint: 'https://index.xelis.io', icon: <FlagIcon code='us' /> },
  ])

  const checkEndpoint = useCallback(async (item) => {
    const { endpoint, apiEndpoint } = item

    const start = Date.now()
    let success = false
    let err = null
    let nodeInfo = null

    try {
      if (apiEndpoint) {
        const daemon = new DaemonWS()
        daemon.maxConnectionTries = 0
        await daemon.connect(apiEndpoint)
        const res = await daemon.methods.getInfo()
        nodeInfo = res
        daemon.close()
      } else {
        await fetch(endpoint)
      }

      success = true
    } catch (e) {
      // failed
      err = e
    }

    const end = Date.now()
    const elapsed = end - start

    return { endpoint, success, elapsed, err, nodeInfo }
  }, [])

  const updateStatus = useCallback((items, setItemsState) => {
    items.forEach((item) => {
      checkEndpoint(item).then((res) => {
        setItemsState((items) => {
          return items.map((item) => {
            if (item.endpoint == res.endpoint) {
              let extraInfo = null
              if (res.nodeInfo) {
                extraInfo = <NodeInfo {...res.nodeInfo} />
              }

              return { ...item, res, extraInfo }
            }

            return item
          })
        })
      })
    })
  }, [])

  useEffect(() => {
    const updateRate = 60000 // 1min

    const update = () => {
      updateStatus(loadBalancers, setLoadBalancers)
      updateStatus(seedNodes, setSeedNodes)
      updateStatus(indexers, setIndexers)
    }

    update()
    setInterval(update, updateRate)
  }, [])

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
    <div>
      <div className={style.statusList.title}>Load Balancers</div>
      <div className={style.statusList.description}>You can point your wallet / miner to this server. It redirects the request by offloading to other nodes.</div>
      <div className={style.statusList.items}>
        {loadBalancers.map((item) => <StatusItem key={item.endpoint} {...item} />)}
      </div>
    </div>
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
  const { location, endpoint, icon, res, extraInfo } = props

  const statusType = useMemo(() => {
    if (!res) return `init`

    const { success, elapsed } = res

    if (success) {
      if (elapsed > 500) {
        return `slow`
      }

      return `alive`
    }

    return `dead`
  }, [res])

  let containerStyle = style.statusItem.container
  if (extraInfo) containerStyle += ` ${style.statusItem.containerWithExtra}`

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
          {(res && res.success) && <>{res.elapsed} MS</>}
          {(res && !res.success) && <>Failed</>}
          <div className={`${style.statusItem.dot.container} ${style.statusItem.dot[statusType]}`} />
        </div>
      </div>
    </div>
    {extraInfo && <div className={style.statusItem.extraInfo}>
      {extraInfo}
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