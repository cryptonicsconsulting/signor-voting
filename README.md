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

**Note: the unit tests rely on the `evm_increaseTime()` JSON RPC to be implemented by the local provider, in order to simulate *time travel*. This will not work not most node implementation but does on ganache-cli and Ganache.**

## Protocol 

### Overview

The following scenarios are contemplated: 

- Public votes that are completely transparent
- Commit-Reveal votes that allow users to reveal there secret vote after the election has ended
- Delegated votes that allows cryptographically signed off-chain votes to be bulk submitted by an election authority

All contracts have an election start time and an election end time (unix timestamp). This can be supplied in the constructor. Whitelisted voters and candidates can be registered before the election start time has been reached. Contracts are "owned" by the election organiser and only the contract owner can register voters and candidates. 

**Note, that if a large number of voters has to be registered, this should be done in reasonably batches, in order to avoid the transaction to revert due to hitting the block gas limit.**

Voters are represented through Ethereum addresses and votes are signed using the voters  private keys, either through signing and invoking in an Ethereum transaction or by signing an off-chain vote for later submission. Votes by unregistered voters (not whitelisted) are be rejected.

Candidates are represented by a 32-bytes identifier, usually supplied as UTF-8 character string. 

Note, that referendums can be implemented by simply registering "yes" and "no" candidates. 

Votes are self-tallying and the number of votes per candidate can be queried publicly by calling:

```javascript
function getVotes(bytes32 _candidate) public view returns(uint);
```



The base behaviour is implemented in the [Election contract](https://github.com/cryptonicsconsulting/signor-voting/blob/master/contracts/Election.sol). In what follows we describe the behaviour of the contracts that inherit from this base contract.

### Public Election  

The [Public Election contract](https://github.com/cryptonicsconsulting/signor-voting/blob/master/contracts/PublicElection.sol) implements a standard Ethereum voting protocol. Voters can vote between start and end time by invoking a vote transaction and supply their candidate choice. 

```javascript
function vote(bytes32 _candidate) public onlyVoter votingOpen;
```

The downside of this type of election is that the partial result of ongoing votes can be seen, meaning the vote is public during the actual election process.

### Commit-Reveal Election

The [Commit-Reveal Election contract](https://github.com/cryptonicsconsulting/signor-voting/blob/master/contracts/CommitRevealElection.sol) addresses the disadvantage of the votes being visible during the election process by implementing a commit reveal scheme. Votes are first submitted secretly during the election and then have to be revealed during a reveal interval (specified by the election organiser during contract deployment).

Votes are submitted by submitting a keccak256 hash of the vote salted with a secret parameter. They are revealed by submitting the plaintext vote and the secret salt parameter.

```javascript
function vote(bytes32 _hash) public onlyVoter votingOpen;

function revealVote(bytes32 _candidate, bytes32 _salt) public onlyVoter; 
```

The following JavaScript web3.js example illustrates how to calculate the hash on the client side (assumes a contract object called `election`):

```javascript
const data = web3.eth.abi.encodeParameters(["bytes32", "bytes32"],[web3.utils.fromAscii("Candidate_1"),web3.utils.fromAscii("mySalt")]);
const candidate1Hash = await web3.utils.soliditySha3(data);

//submit vote
await election.vote(this.candidate1Hash);

//reveal vote 
await election.revealVote(web3.utils.fromAscii("Candidate_1"), web3.utils.fromAscii("mySalt"));
```

### Delegated Election

The above schemes assumes that voters connect directly to the blockchain and submit their transactions. However, there are realistic scenarios, in which voters submit their vote to a backend (e.g. polling station) and the backend forwards the vote to the smart contracts during a submission interval after voting has ended. This is implemented in the [Delegated Election contract](https://github.com/cryptonicsconsulting/signor-voting/blob/master/contracts/DelegatedElection.sol).

Votes are submitted by the election organiser have to include a valid signature by a registered voter. This ensures that the election organiser cannot modify the vote. However, this protocol does suffer from disadvantage that the election organiser may choose to omit votes.

Votes are submitted individually or in bulk by the election organiser through the following interface:

```javascript
function submitVote(bytes32 _candidate, bytes32 r, bytes32 s, uint8 v) public onlyOwner;

function bulkSubmitVote(bytes32[] memory _candidates, bytes32[] memory r, bytes32[] memory s, uint8[] memory v) public onlyOwner votingOpen;
```

The signed message needs to include the standard Ethereum prefix:

```javascript
"\x19Ethereum Signed Message:\n" + len(message)
```

The message must also include the address of the election contract, in order to prevent replay attacks using votes from other elections. 

Unfortunately, signing behaviour of Ethereum libraries and node implementations is not uniform. The following example works using Ganache CLI v6.9.1 (ganache-core: 2.10.2) and Web3.js v1.2.:

```javascript
let message = await web3.utils.soliditySha3(web3.eth.abi.encodeParameters(["bytes32", "address"], [web3.utils.fromAscii("Candidate_1"),election.address]));

let signature = await web3.eth.sign(message, accounts[0]);
let r = signature.slice(0, 66);
let s = "0x" + signature.slice(66, 130);
let v = "0x" + signature.slice(130, 132);
v = web3.utils.toDecimal(v);
//fix v for proper Ethereum signartures --> ganache-cli bug
if (v==0 || v==1) v = v + 27;

```



