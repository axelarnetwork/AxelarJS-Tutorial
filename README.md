# AxelarJS

This project demonstrates basic AxelarJS usecases in the form of a Hardhat task.

The task will interact with the contract called DistributionExecutable which has already been written into the `./contracts/DistributionExecutable.sol` folder.

First install all the dependencies
`npm i`

The scripts to deploy the function are also written up though you will need to configure your own .env file, which will include your mnemonic used to deploy the DistributionExecutable contract.

If you do not want to go through the deployment process simply use the following addresses of the already deployed DistributionExecutable contract to use with the Hardhat Task

Polygon Address: `0x68474f4c8124ec22940ca3a682c862c8447da6b6`
Fantom Address: `0x69aBe660cB7b4C5Bfb7c47Ff6B02d5294DA7Ce19`

To run the task simply run

```
npx hardhat sendToMany --sourcechainaddr 0x68474f4c8124ec22940ca3a682c862c8447da6b6 --destchainaddr 0x69aBe660cB7b4C5Bfb7c47Ff6B02d5294DA7Ce19
```
