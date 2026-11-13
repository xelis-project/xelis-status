# XELIS Status

A small, dependency-free status page for the official Xelis seed nodes.

It polls each node's JSON-RPC endpoint (`get_info`) every few seconds, shows the
round-trip latency with a colored marker, and displays live chain information
(height, stable height, topo height, version and network).

## Nodes

- US #1 — `https://us-node.xelis.io` (`wss://us-node.xelis.io/json_rpc`)
- France #1 — `https://fr-node.xelis.io` (`wss://fr-node.xelis.io/json_rpc`)

## Development

The site is static HTML, CSS and vanilla JavaScript under `public/`. No runtime
libraries are used.

```sh
npm install
npm run dev      # wrangler dev
```

## Production

Deployed as a Cloudflare Worker serving static assets:

```sh
npm run deploy   # wrangler deploy
```
