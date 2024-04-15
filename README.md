# AxelarJS

This project demonstrates basic AxelarJS usecases in the form of a Hardhat task.

The task will interact with the contract called DistributionExecutable which has already been written into the `./contracts/DistributionExecutable.sol` folder.

First install all the dependencies
`npm i`

The scripts to deploy the function are also written up though you will need to configure your own .env file, which will include your mnemonic used to deploy the DistributionExecutable contract.

To deploy on Celo run: `hh run scripts/deployCelo.ts --network celo`
To deploy on Fantom run: `hh run scripts/deployFantom.ts --network fantom`


If you do not want to go through the deployment process simply use the following addresses of the already deployed DistributionExecutable contract to use with the Hardhat Task

Celo Address: `0x953bE597934f1419E20cfFDa8D13B4EcF264057c`
Fantom Address: `0xe41Abe529cf0491FAf854abc564314A511bF0CD2`

To run the task simply run

```
npx hardhat sendToMany --sourcechainaddr 0x953bE597934f1419E20cfFDa8D13B4EcF264057c --destchainaddr 0xe41Abe529cf0491FAf854abc564314A511bF0CD2
```
