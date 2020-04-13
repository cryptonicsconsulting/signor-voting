
const Election = artifacts.require("Election");
const getCurrentTime = require('./utils/time').getCurrentTime;
const assertRevert = require('./utils/assertRevert').assertRevert;
const increaseTime = require('./utils/increaseTime').increaseTime;


contract('Election', (accounts) => {


    beforeEach(async function() {
        this.owner = accounts[0];
    
        let start = await getCurrentTime()+3600;
        let end = start + 3600;

        this.election = await Election.new(start,end);
    });
  
  
    describe('intitalization', function() {
        it('deploy election with no voters and candidates', async function() {

            const noVoters = await this.election.noVoters();
            const noCandidates = await this.election.noVoters();

            
            assert.equal(noVoters.valueOf(), 0, "incorrect initial number of voters");
            assert.equal(noCandidates.valueOf(), 0, "incorrect initial number of candidates");    
        });

        it('register 10 voteres', async function() {
        
            await this.election.addVoters(accounts);
            const noVoters = await this.election.noVoters();
            assert.equal(noVoters.valueOf(), 10, "should have 10 voters");
            assert.isTrue(await this.election.isVoter(accounts[3]), "Account 3 three is not a registered voter");
    

        });

        it('register candidates', async function() {
        
            await this.election.addCandidate(web3.utils.fromAscii("Candidate_1"));
            await this.election.addCandidate(web3.utils.fromAscii("Candidate_2"));
            const noCandidates = await this.election.noCandidates();
            assert.equal(noCandidates.valueOf(), 2, "should have 2 candidates");

        });

        it('election started', async function() {
        
            //advance time to after election start --> ganache only
            await increaseTime(3700);
            await assertRevert(this.election.addCandidate(web3.utils.fromAscii("Candidate_3")), "adding candidate should fail");
            await assertRevert(this.election.addVoters(accounts), "adding voters should fail");
        });
    });

});