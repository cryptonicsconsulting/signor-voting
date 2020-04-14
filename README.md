# Signor Smart Contract Voting Protocol
**A set of smart contracts that can be used to holds elections on an Ethereum blockchain**. Implements three different election smart contracts for different scenarios.

## Installation

The smart contracts are distributed in form of a [Truffle](https://www.trufflesuite.com/truffle) project and the included unit tests require a local test network with several unlocked accounts on port 8545, preferable [ganache-cli](https://github.com/trufflesuite/ganache-cli).  

Install Truffle and ganache-cli:

```shell
npm install -g ganache-cli

npm install truffle -g
```

After cloning the repository install dependencies with:

```shell
npm install
```

Now the usual Truffle commands apply. In order to test run ganache-cli in separate terminal and execute the unit tests with:

```shell
truffle test
```

## Protocol 

### Overview

The following scenarios are contemplated: 

- Public votes that are completely transparent
- Commit-Reveal votes that allow users to reveal there secret vote after the election has ended
- Delegated votes that allows cryptographically signed off-chain votes to be bulk submitted by an election authority

All contracts have an election start time and an election end time (unix timestamp). This can be supplied in the constructor. Whitelisted voters and candidates can be registered before the election start time has been reached. 

Voters are represented through Ethereum addresses and votes are signed using the voters  private keys, either through signing and invoking in an Ethereum transaction or by signing an off-chain vote for later submission. Votes by unregistered voters (not whitelisted) are be rejected.

Candidates are represented by a 32-bytes identifier, usually supplied as UTF-8 character string. 

The base behaviour is implemented in the [Election contract](https://github.com/cryptonicsconsulting/signor-voting/blob/master/contracts/Election.sol). In what follows we describe the behaviour of the contracts that inherit from this base contract.

### Public Election  

TBD

### Commit-Reveal Election

TBD

### Delegated Election

TBD

