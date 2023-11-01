// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";
import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

contract GMPDistribution is AxelarExecutable {
    IAxelarGasService public immutable gasService;

    constructor(
        address _gateway,
        address _gasService
    ) AxelarExecutable(_gateway) {
        gasService = IAxelarGasService(_gasService);
    }

    /**
     * @notice send token from source to many accounts from src chain
     * @param _destChain dest blockchain name
     * @param _destContractAddr contract address on dest chain
     * @param _destinationAddrs recipient addreses on dest chain
     * @param _symbol token symbol
     * @param _amount token amount
     */
    function sendToMany(
        string memory _destChain,
        string memory _destContractAddr,
        address[] calldata _destinationAddrs,
        string memory _symbol,
        uint256 _amount
    ) external payable {
        require(msg.value > 0, "Gas payment required");

        //get token address from symbol
        address tokenAddress = gateway.tokenAddresses(_symbol);

        //send funds to this contract
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), _amount);

        //approve gateway to spend funds
        IERC20(tokenAddress).approve(address(gateway), _amount);

        //encode recipient addressess tx on destiantion chain
        bytes memory recipientAddressesEncoded = abi.encode(_destinationAddrs);

        //pay gas from source chain
        gasService.payNativeGasForContractCallWithToken{value: msg.value}(
            address(this), //sender
            _destChain,
            _destContractAddr,
            recipientAddressesEncoded, //payload
            _symbol,
            _amount,
            msg.sender
        );

        //send token & execute call
        gateway.callContractWithToken(
            _destChain,
            _destContractAddr,
            recipientAddressesEncoded,
            _symbol,
            _amount
        );
    }

    /**
     * @notice execute message on destination chain
     * @param _payload encoded recipient addresses
     * @param _tokenSymbol symbol of the token to be sent
     * @param _amount amount of tokens to be sent
     */
    function _executeWithToken(
        string calldata,
        string calldata,
        bytes calldata _payload,
        string calldata _tokenSymbol,
        uint256 _amount
    ) internal override {
        // decode recipients
        address[] memory recipients = abi.decode(_payload, (address[]));

        // get token addr
        address tokenAddress = gateway.tokenAddresses(_tokenSymbol);

        // get amount per recipient
        uint256 sentAmount = _amount / recipients.length;

        for (uint256 i = 0; i < recipients.length; i++) {
            //transfer to each recipient
            IERC20(tokenAddress).transfer(recipients[i], sentAmount);
        }
    }
}
