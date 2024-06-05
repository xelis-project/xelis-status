# XELIS Status

A simple page to display official seed nodes API endpoint status.
This includes a latency marker and node information like height, topo, version...

Mainnet: <https://status.xelis.io>
Testnet: <https://testnet-status.xelis.io>

## Development

For development this app uses the `g45-react` package to bundle and serve app.
Simply run `npm start` to build, start the dev server and watch modified files automatically.
For environment variables, it will create a `bundler-define.json` file and check in the `env` folder.  

## Production

The app is served by cloudflare and uses `cf_build.sh` to build from a specific branch.
Pushing branch `testnet-pages` or `mainnet-pages` will automatically build and deploy to cloudflare.

To build for nodejs run `npm run build-prod:node`.
