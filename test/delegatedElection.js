
const DelegatedElection = artifacts.require("DelegatedElection");
const getCurrentTime = require('./utils/time').getCurrentTime;
const assertRevert = require('./utils/assertRevert').assertRevert;
const increaseTime = require('./utils/increaseTime').increaseTime;


contract('DelegatedElection', (accounts) => {


    beforeEach(async function() {
        
    
        let start = await getCurrentTime()+3600;
        let end = start + 3600;
        

        this.election = await DelegatedElection.new(start, end,3600, accounts);
        await this.election.addCandidate(web3.utils.fromAscii("Candidate_1"));
        await this.election.addCandidate(web3.utils.fromAscii("Candidate_2"));
    });
  
  
    describe('delegated voting', function() {

        it('no voting before election starts', async function() {
            
        }); 

        it('voting', async function() {
            //time travel to election end
            await increaseTime(7300);
            //await this.election.vote(web3.utils.fromAscii("Candidate_1"));
            const votes = await this.election.getVotes(web3.utils.fromAscii("Candidate_1"));
            //assert.equal(votes.valueOf(), 1, "Candidate_1 should have 1 votes");        
        });

        it('no duplicate voting', async function() {
            //time travel to election end
            await increaseTime(7300);
            //await this.election.vote(web3.utils.fromAscii("Candidate_1"));
            //await assertRevert(this.election.vote(web3.utils.fromAscii("Candidate_1")), "account 0 should not be able to vote twice");
        });

        it('only registerted candidates', async function() {
            //time travel to election end
            await increaseTime(7300);
           // await assertRevert(this.election.vote(web3.utils.fromAscii("Candidate_3")), "Candidate_3 should not exixst");
        });

        it('no voting after submission period ends', async function() {
            //time travel to submission end
            await increaseTime(88000);
            //await assertRevert(this.election.vote(web3.utils.fromAscii("Candidate_1")), "voting should not be possible after election ends");          
            
        });

    });

});