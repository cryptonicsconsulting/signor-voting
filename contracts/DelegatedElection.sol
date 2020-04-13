pragma solidity ^0.5.16;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./Election.sol";

contract DelegatedElection is Election {

    uint submitTime;


    constructor (uint _startTime, uint _endTime, uint _submitInterval, address[] memory _initialVoters) Election(_startTime, _endTime) public {
        addVoters(_initialVoters);
        submitTime = _endTime + _submitInterval;
    }

    function submitVote(bytes32 _candidate, bytes32 r, bytes32 s, uint8 v) public onlyOwner votingOpen returns(bool) {
        //check candidate exists,voting closed and vote submission still open
        if (isCandidate(_candidate) && now >= endTime && now < submitTime) {

            bytes32 hash = keccak256(abi.encode(_candidate, address(this)));

            address voter = verifySig(hash, r, s, v);
            //check signature valid, voter registered and not voted already
            if (voter != address(0) && voters[voter] && !voted[voter]) {
                voted[voter] = true;
                voteCount[_candidate]++;
                votesReceived++;
                return true;
            } else return false;
        } else return false;
    }

    function bulkSubmitVote(bytes32[] memory _candidates, bytes32[] memory r, bytes32[] memory s, uint8[] memory v) public onlyOwner votingOpen {
        require(_candidates.length == r.length && r.length == s.length && s.length == v.length, "argument arrays need to be of equal length");
        for (uint i = 0; i < _candidates.length; i++) {
            submitVote(_candidates[i], s[i], r[i], v[i]);
        }
    }


    function verifySig(bytes32 hash, bytes32 r, bytes32 s, uint8 v) internal pure returns (address) {

        //deal with malleable sigantures
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
            return address(0);
        }

        if (v != 27 && v != 28) {
            return address(0);
        }

        return ecrecover(hash, v, r, s);

    }




}