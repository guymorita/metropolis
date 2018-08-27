# ConsenSys Academy Final Project - *Guy Morita*

**Metropolis** is a complete store smart contract built using [Solidity](https://solidity.readthedocs.io/en/v0.4.24/).

## Stories

The following **required** features are implemented:

- [x] An administrator opens the web app
- [x] The web app reads the address and identifies that the user is an admin, showing them admin only functions, such as managing store owners
- [x] An admin adds an address to the list of approved store owners, so if the owner of that address logs into the app, they have access to the store owner functions.

- [x] An approved store owner logs into the app
- [x] The web app recognizes their address and identifies them as a store owner
- [x] They are shown the store owner functions
- [x] They can create a new storefront that will be displayed on the marketplace
- [x] They can also see the storefronts that they have already created
- [x] They can click on a storefront to manage it
- [x] They can add products to the storefront or change any of the products’ prices
- [x] They can also withdraw any funds that the store has collected from sales.

- [x] A shopper logs into the app
- [x] The web app does not recognize their address so they are shown the generic shopper application
- [x] From the main page they can browse all of the storefronts that have been created in the marketplace
- [x] Clicking on a storefront will take them to a product page
- [x] They can see a list of products offered by the store, including their price and quantity
- [x] Shoppers can purchase a product, which will debit their account and send it to the store

- [x] Add a circuit breaker
- [x] Explain design patterns
- [x] Explain protection against top attacks
- [x] Add external library
- [x] Comment to standard: https://solidity.readthedocs.io/en/v0.4.21/layout-of-source-files.html#comments

The following **optional** features are implemented:

- [ ] Project uses IPFS
- [ ] Project uses uPort
- [ ] Project uses ENS
- [ ] Project uses an oracle
- [ ] Project uses an upgradable design pattern
- [ ] Project uses LLL / Vyper
- [ ] Testnet deployment

## Installation Instructions

#### Clone repo
``` bash
git clone https://github.com/guymorita/metropolis
```

#### Download and run truffle, ganache, and metamask
- [https://github.com/trufflesuite/truffle](https://github.com/trufflesuite/truffle)
- [https://truffleframework.com/ganache](https://truffleframework.com/ganache)
- [https://metamask.io/](https://metamask.io/)

#### Compile and migrate repo
``` bash
truffle compile
truffle migrate
```

#### Startup lite-server
``` bash
npm run dev
```

#### Open browser
http://localhost:3000

#### Run tests
``` bash
truffle test
```

## Video Walkthrough

Here's a walkthrough of implemented user stories:

![OSX Walkthrough](zelda.gif)
