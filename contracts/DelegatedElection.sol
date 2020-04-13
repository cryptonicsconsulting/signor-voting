pragma solidity ^0.5.16;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "./Election.sol";

contract DelegatedElection is Election {

    uint submitTime;




    constructor (uint _startTime, uint _endTime, uint _submitInterval, address[] memory _initialVoters) Election(_startTime, _endTime) public {
        addVoters(_initialVoters);
        submitTime = _endTime + _submitInterval;
    }
    

    function vote(bytes32 _candidate, bytes memory _signature) public onlyOwner votingOpen returns(bool) {
       
        if (isCandidate(_candidate) && now >= endTime && now < submitTime) {
            /*check signature */

            bytes32 hash = keccak256(abi.encode(_candidate, address(this)));

            address voter = ECDSA.recover(hash, _signature);
            if (voter != address(0) && !voted[voter]) {
                 voted[voter] = true;
                voteCount[_candidate]++;
                votesReceived++;
                return true;
            } else return false;
        } else return false;
    }


}