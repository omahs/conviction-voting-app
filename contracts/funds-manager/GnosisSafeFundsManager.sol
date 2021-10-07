pragma solidity ^0.4.24;

import "./FundsManager.sol";
import "./GnosisSafe.sol";
import "@aragon/os/contracts/lib/token/ERC20.sol";

contract GnosisSafeFundsManager is FundsManager {

    bytes4 public constant TRANSFER_SELECTOR = 0xa9059cbb; // Equivalent of bytes4(keccak256("transfer(address,uint256)"))

    address public owner;
    GnosisSafe public gnosisSafe;

    modifier onlyOwner {
        require(msg.sender == owner, "ERR:NOT_OWNER");
        _;
    }

    constructor(address _owner, GnosisSafe _gnosisSafe) public {
        owner = _owner;
        gnosisSafe = _gnosisSafe;
    }

    function setOwner(address _owner) public onlyOwner {
        owner = _owner;
    }

    function balance(address _token) returns (uint256) {
        ERC20 token = ERC20(_token);
        return token.balanceOf(address(gnosisSafe));
    }

    function transfer(address _token, address _beneficiary, uint256 _amount) onlyOwner {
        bytes memory transferBytes = abi.encodeWithSelector(TRANSFER_SELECTOR, _beneficiary, _amount);
        require(gnosisSafe.execTransactionFromModule(_token, 0, transferBytes, GnosisSafe.Operation.Call),
            "ERR:TRANSFER_REVERTED");
    }
}
