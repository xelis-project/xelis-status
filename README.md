# XELIS Status

A simple page to display official seed nodes API endpoint status.

Mainnet: <https://status.xelis.io>
Testnet: <https://testnet-status.xelis.io>

## Development

Open two terminal and run package scripts.

`npm run build` and `npm start` (defaults to wrangler, check other ways below)

This will start a http server, watch and build files automatically.  
For environment variables, it will create a `env.json` file and default to XELIS daemon on localhost. Modify it to point to your specific endpoints.  

Using cloudflare wrangler:  
`npm run build-dev:cf` and `npm run start-cf:node`

Using node server:  
`npm run build-dev:node` and `npm run start-dev:node`

Using index (no ssr, no server, use browser to load html):  
`npm run build-dev:index`

## Production

Pushing branch `testnet-pages` or `mainnet-pages`
will automatically build and deploy to cloudflare.

Build for your own node server:  
`npm run build-prod:node` and run `node ./dist/node_server/node_server.js`.

Build the single page app (no ssr and no server):  
`npm run build-prod:index` and check the `./dist/index` folder to open `index.html` with the browser.
