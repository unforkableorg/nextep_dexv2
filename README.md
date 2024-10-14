# NXCHAIN DEX Frontend

A fork of the opensource interface for uniswapv2.

## Development

### Install Dependencies

```bash
npm ci
```

### Configure Environment (optional)

Copy `.env` to `.env.local` and change the appropriate variables.

### Run

```bash
npm run start
```

To have the frontend default to a different network, make a copy of `.env` named `.env.local`, 
change `REACT_APP_NETWORK_ID` to `"{yourNetworkId}"`, and change `REACT_APP_NETWORK_URL` to e.g. 
`"https://{yourNetwork}.infura.io/v3/{yourKey}"`. 
