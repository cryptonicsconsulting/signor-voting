
const DelegatedElection = artifacts.require("DelegatedElection");
const getCurrentTime = require('./utils/time').getCurrentTime;
const assertRevert = require('./utils/assertRevert').assertRevert;
const increaseTime = require('./utils/increaseTime').increaseTime;
const eutil = require('ethereumjs-util')



contract('DelegatedElection', (accounts) => {


    beforeEach(async function() {

        let start = await getCurrentTime()+3600;
        let end = start + 3600;
        
        this.election = await DelegatedElection.new(start, end, 3600, accounts);
        await this.election.addCandidate(web3.utils.fromAscii("Candidate_1"));
        await this.election.addCandidate(web3.utils.fromAscii("Candidate_2")); 
    });
  
  
    describe('delegated voting', function() {
        it('no vote submission before election ends', async function() {
            //time travel to election start
            await increaseTime(3700);
            
            //prepare signature
            let message = await web3.utils.soliditySha3(web3.eth.abi.encodeParameters(["bytes32", "address"], [web3.utils.fromAscii("Candidate_1"),this.election.address]));
            let signature = await web3.eth.sign(message, accounts[1]);
            let r = signature.slice(0, 66);
            let s = "0x" + signature.slice(66, 130);
            let v = "0x" + signature.slice(130, 132);
            v = web3.utils.toDecimal(v);
            //fix v for proper Ethereum signartures --> ganache-cli bug
            if (v==0 || v==1) v = v + 27;

            await assertRevert(this.election.submitVote(web3.utils.fromAscii("Candidate_1"), r, s, v), "Vote submission before election end");
            
        }); 

        it('voting', async function() {
            //time travel to election end
            await increaseTime(7300);

            //prepare signature
            let message = await web3.utils.soliditySha3(web3.eth.abi.encodeParameters(["bytes32", "address"], [web3.utils.fromAscii("Candidate_1"),this.election.address]));
            let signature = await web3.eth.sign(message, accounts[0]);          
            let r = signature.slice(0, 66);
            let s = "0x" + signature.slice(66, 130);
            let v = "0x" + signature.slice(130, 132);
            v = web3.utils.toDecimal(v);
            //fix v for proper Ethereum signartures --> ganache-cli bug
            if (v==0 || v==1) v = v + 27;

            await this.election.submitVote(web3.utils.fromAscii("Candidate_1"), r, s, v);
            const votes = await this.election.getVotes(web3.utils.fromAscii("Candidate_1"));
            assert.equal(votes.valueOf(), 1, "Candidate_1 should have 1 votes");        
        });


        it('invalid siganture', async function() {
            //time travel to election end
            await increaseTime(7300);

            //prepare signature but leave out contract address for invalid signature
            let message = await web3.utils.soliditySha3(web3.eth.abi.encodeParameters(["bytes32"], [web3.utils.fromAscii("Candidate_1")]));
            let signature = await web3.eth.sign(message, accounts[0]);          
            let r = signature.slice(0, 66);
            let s = "0x" + signature.slice(66, 130);
            let v = "0x" + signature.slice(130, 132);
            v = web3.utils.toDecimal(v);
            //fix v for proper Ethereum signartures --> ganache-cli bug
            if (v==0 || v==1) v = v + 27;

            await this.election.submitVote(web3.utils.fromAscii("Candidate_1"), r, s, v);
            const votes = await this.election.getVotes(web3.utils.fromAscii("Candidate_1"));
            assert.equal(votes.valueOf(), 0, "Invalid vote should not have counted");        
        });

        it('no duplicate voting', async function() {
            //time travel to election end
            await increaseTime(7300);
            
            //prepare signature
            let message = await web3.utils.soliditySha3(web3.eth.abi.encodeParameters(["bytes32", "address"], [web3.utils.fromAscii("Candidate_1"),this.election.address]));
            let signature = await web3.eth.sign(message, accounts[0]);          
            let r = signature.slice(0, 66);
            let s = "0x" + signature.slice(66, 130);
            let v = "0x" + signature.slice(130, 132);
            v = web3.utils.toDecimal(v);
            //fix v for proper Ethereum signartures --> ganache-cli bug
            if (v==0 || v==1) v = v + 27;
   
            await this.election.submitVote(web3.utils.fromAscii("Candidate_1"), r, s, v);
            await this.election.submitVote(web3.utils.fromAscii("Candidate_1"), r, s, v);
            const votes = await this.election.getVotes(web3.utils.fromAscii("Candidate_1"));
            assert.equal(votes.valueOf(), 1, "Candidate_1 should only have 1 vote");  
        });

        it('only registerted candidates', async function() {
            //time travel to election end
            await increaseTime(7300);

            //prepare signature
            let message = await web3.utils.soliditySha3(web3.eth.abi.encodeParameters(["bytes32", "address"], [web3.utils.fromAscii("Candidate_3"),this.election.address]));
            let signature = await web3.eth.sign(message, accounts[0]);          
            let r = signature.slice(0, 66);
            let s = "0x" + signature.slice(66, 130);
            let v = "0x" + signature.slice(130, 132);
            v = web3.utils.toDecimal(v);
            //fix v for proper Ethereum signartures --> ganache-cli bug
            if (v==0 || v==1) v = v + 27;
            
            //the vote will go through but should not be counted 
            await this.election.submitVote(web3.utils.fromAscii("Candidate_3"), r, s, v);
            const votes = await this.election.getVotes(web3.utils.fromAscii("Candidate_3"));
            assert.equal(votes.valueOf(), 0, "Candidate_3 should only have 0 vote");  

        });

    });

});