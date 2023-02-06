# NXCHAIN DEX Frontend

A fork of the opensource interface for uniswapv2.

## Development

### Install Dependencies

```bash
yarn
```

### Configure Environment (optional)

Copy `.env` to `.env.local` and change the appropriate variables.

### Run

```bash
yarn start
```

To have the frontend default to a different network, make a copy of `.env` named `.env.local`, 
change `REACT_APP_NETWORK_ID` to `"{yourNetworkId}"`, and change `REACT_APP_NETWORK_URL` to e.g. 
`"https://{yourNetwork}.infura.io/v3/{yourKey}"`. 

Note that the front end only works properly on testnets where both 
[Uniswap V2](https://uniswap.org/docs/v2/smart-contracts/factory/) and 
[eth-scan](https://github.com/MyCryptoHQ/eth-scan) are deployed.
The frontend will not work on other networks.
