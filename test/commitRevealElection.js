
const CommitRevealElection = artifacts.require("CommitRevealElection");
const getCurrentTime = require('./utils/time').getCurrentTime;
const assertRevert = require('./utils/assertRevert').assertRevert;
const increaseTime = require('./utils/increaseTime').increaseTime;
//const { soliditySha3 } = require("web3-utils");


contract('CommitRevealElection', (accounts) => {


    beforeEach(async function() {
        
    
        let start = await getCurrentTime()+3600;
        let end = start + 3600;

        this.election = await CommitRevealElection.new(start,end,3600, accounts);
        await this.election.addCandidate(web3.utils.fromAscii("Candidate_1"));
        await this.election.addCandidate(web3.utils.fromAscii("Candidate_2"));

        const data = web3.eth.abi.encodeParameters(["bytes32", "bytes32"], [web3.utils.fromAscii("Candidate_1"),web3.utils.fromAscii("mySalt")]);
        this.candidate1Hash = await web3.utils.soliditySha3(data);
      
        const data2 = web3.eth.abi.encodeParameters(["bytes32", "bytes32"], [web3.utils.fromAscii("Candidate_3"),web3.utils.fromAscii("mySalt")]);
        this.candidate3Hash = await web3.utils.soliditySha3(data2);
    });
  
  
    describe('public voting', function() {

        it('no voting before election starts', async function() {
            await assertRevert(this.election.vote(this.candidate1Hash), "voting should not be possible before election start");          
            
        });

        it('voting', async function() {
            //time travel to election start
            await increaseTime(3700);
            const beforeVotes = await this.election.votesReceived();
            assert.equal(beforeVotes.valueOf(), 0, "We should have received no votes yet");        
            await this.election.vote(this.candidate1Hash);
            const votes = await this.election.votesReceived();
            assert.equal(votes.valueOf(), 1, "We should have received 1 vote");        
        });

        it('no duplicate voting', async function() {
            //time travel to election start
            await increaseTime(3700);
            await this.election.vote(this.candidate1Hash);
            await assertRevert(this.election.vote(this.candidate1Hash), "account 0 should not be able to vote twice");
        });

        

        it('revelaing voting', async function() {
            //time travel to election start
            await increaseTime(3700);  
            await this.election.vote(this.candidate1Hash);
            //time travel to reveal interval
            await increaseTime(3700); 
            await this.election.revealVote(web3.utils.fromAscii("Candidate_1"), web3.utils.fromAscii("mySalt"));
            const reveals = await this.election.votesRevealed();
            assert.equal(reveals.valueOf(), 1, "We should have revealed 1 vote"); 
            const votes = await this.election.getVotes(web3.utils.fromAscii("Candidate_1"));
            assert.equal(votes.valueOf(), 1, "Candidate_1 should have 1 votes");    

               
        });


        it('only registerted candidates', async function() {
             //time travel to election start
             await increaseTime(3700);  
             await this.election.vote(this.candidate3Hash);
             //time travel to reveal interval
             await increaseTime(3700); 
             await assertRevert(this.election.revealVote(web3.utils.fromAscii("Candidate_3"), web3.utils.fromAscii("mySalt")),"Candidate_3 should not exist");
             
        });


        it('no voting after election ends', async function() {
             //time travel to election end
             await increaseTime(8800);
             await assertRevert(this.election.vote(this.candidate1Hash), "voting should not be possible after election ends");          
            
        });

    });

});