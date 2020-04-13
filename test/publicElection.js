
const PublicElection = artifacts.require("PublicElection");
const getCurrentTime = require('./utils/time').getCurrentTime;
const assertRevert = require('./utils/assertRevert').assertRevert;
const increaseTime = require('./utils/increaseTime').increaseTime;


contract('PublicElection', (accounts) => {


    beforeEach(async function() {
        
    
        let start = await getCurrentTime()+3600;
        let end = start + 3600;

        this.election = await PublicElection.new(start,end,accounts);
        await this.election.addCandidate(web3.utils.fromAscii("Candidate_1"));
        await this.election.addCandidate(web3.utils.fromAscii("Candidate_2"));
    });
  
  
    describe('public voting', function() {

        it('no voting before election starts', async function() {
            await assertRevert(this.election.vote(web3.utils.fromAscii("Candidate_1")), "voting should not be possible before election start");          
            
        });

        it('voting', async function() {
            //time travel to election start
            await increaseTime(3700);
            await this.election.vote(web3.utils.fromAscii("Candidate_1"));
            const votes = await this.election.getVotes(web3.utils.fromAscii("Candidate_1"));
            assert.equal(votes.valueOf(), 1, "Candidate_1 should have 1 votes");        
        });

        it('no duplicate voting', async function() {
            //time travel to election start
            await increaseTime(3700);
            await this.election.vote(web3.utils.fromAscii("Candidate_1"));
            await assertRevert(this.election.vote(web3.utils.fromAscii("Candidate_1")), "account 0 should not be able to vote twice");
        });

        it('only registerted candidates', async function() {
            //time travel to election start
            await increaseTime(3700);
            await assertRevert(this.election.vote(web3.utils.fromAscii("Candidate_3")), "Candidate_3 should not exixst");
        });

        it('no voting after election ends', async function() {
            //time travel to election end
            await increaseTime(8800);
            await assertRevert(this.election.vote(web3.utils.fromAscii("Candidate_1")), "voting should not be possible after election ends");          
            
        });

    });

});