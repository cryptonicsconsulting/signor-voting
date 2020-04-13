pragma solidity ^0.5.16;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "./Election.sol";

contract DelegatedElection is Election {

    uint submitTime;


    constructor (uint _endTime, uint _submitInterval, address[] memory _initialVoters) Election(0, _endTime) public {
        addVoters(_initialVoters);
        submitTime = _endTime + _submitInterval;
    }

    function vote(bytes32 _candidate, bytes memory _signature) public onlyOwner votingOpen returns(bool) {
        //check candidate exists,voting closed and vote submission still open
        if (isCandidate(_candidate) && now >= endTime && now < submitTime) {

            bytes32 hash = keccak256(abi.encode(_candidate, address(this)));

            address voter = ECDSA.recover(hash, _signature);
            //check signature valid, voter registered and not voted already
            if (voter != address(0) && voters[voter] && !voted[voter]) {
                voted[voter] = true;
                voteCount[_candidate]++;
                votesReceived++;
                return true;
            } else return false;
        } else return false;
    }


}