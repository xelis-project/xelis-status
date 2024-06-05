import Icon from 'g45-react/components/fontawesome_icon'
import { useLang } from 'g45-react/hooks/useLang'
import { useCallback, useEffect, useMemo, useState } from 'react'
import FlagIcon from 'xelis-explorer/src/components/flagIcon'
import { RPC as DaemonRPC } from '@xelis/sdk/daemon/rpc'

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
    { location: 'US #1', endpoint: 'https://us-node.xelis.io', icon: <FlagIcon code="us" />, apiEndpoint: 'https://us-node.xelis.io/json_rpc' },
    { location: 'France #1', endpoint: 'https://fr-node.xelis.io', icon: <FlagIcon code="fr" />, apiEndpoint: 'https://fr-node.xelis.io/json_rpc' },
    { location: 'Poland #1', endpoint: 'https://pl-node.xelis.io', icon: <FlagIcon code="pl" />, apiEndpoint: 'https://pl-node.xelis.io/json_rpc' },
    { location: 'Germany #1', endpoint: 'https://de-node.xelis.io', icon: <FlagIcon code="de" />, apiEndpoint: 'https://de-node.xelis.io/json_rpc' },
    { location: 'Singapore #1', endpoint: 'https://sg-node.xelis.io', icon: <FlagIcon code="sg" />, apiEndpoint: 'https://sg-node.xelis.io/json_rpc' },
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
        const daemon = new DaemonRPC(apiEndpoint)
        const res = await daemon.getInfo()
        nodeInfo = res.result
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

              return { ...item, status: res, extraInfo }
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

  return <div>
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
  const { location, endpoint, icon, status, extraInfo } = props

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
          {status && <>{status.elapsed} MS</>}
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
      <div className={style.nodeInfo.item.value}>{height}</div>
    </div>
    <div className={style.nodeInfo.item.container}>
      <div className={style.nodeInfo.item.title}>Topo Height</div>
      <div className={style.nodeInfo.item.value}>{topoheight}</div>
    </div>
    <div className={style.nodeInfo.item.container}>
      <div className={style.nodeInfo.item.title}>Version</div>
      <div className={style.nodeInfo.item.value}>{version}</div>
    </div>
  </div>
}

export default Home