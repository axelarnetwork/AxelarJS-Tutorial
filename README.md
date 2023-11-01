# AxelarJS

This project demonstrates basic AxelarJS usecases in the form of a Hardhat task.

The task will interact with the contract called GMPDistribution which has already been written into the `./contracts/GMPDistribution.sol` folder.

First install all the dependencies
`npm i`

The scripts to deploy the function are also written up though you will need to configure your own .env file, which will include your mnemonic used to deploy the GMPDistribution contract.

For those

If you do not want to go through the deployment process simply use the following addresses of the already deployed GMPDistribution contract to use with the Hardhat Task

Polygon Address: `0x3F4D4fDA591244F8F38058cbd30868405A606A42`
Avalanche Address: `0xBEEfaAD92d9e46672629D5425A60F79e4f078181`

To run the task simply run

```
npx hardhat sendToMany --sourcechainaddr 0x3F4D4fDA591244F8F38058cbd30868405A606A42 --destchainaddr 0xBEEfaAD92d9e46672629D5425A60F79e4f078181
```
