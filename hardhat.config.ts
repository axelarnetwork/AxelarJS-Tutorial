import dotenv from 'dotenv'
import { task, HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import chains from './chains.json'
import {
  AxelarGMPRecoveryAPI,
  AxelarQueryAPI,
  Environment,
  EvmChain,
  AddGasOptions,
  GMPStatus,
  GasToken,
  GasPaidStatus,
} from '@axelar-network/axelarjs-sdk'
import GMPDistribution from './artifacts/contracts/DistributionExecutable.sol/DistributionExecutable.json'
import { getWallet } from './utils/getWallet'

dotenv.config()

const sdkGmpRecovery = new AxelarGMPRecoveryAPI({
  environment: Environment.TESTNET,
})

const sdkQuery = new AxelarQueryAPI({ environment: Environment.TESTNET })

// npx hardhat sendToMany --sourcechainaddr 0x261AD0f73B0062Fb5340e95861dF3EB9c1Fc6aD4 --destchainaddr 0x6bCA5a0B528333E824f0651d13e71A4343C1a5Bb
task('sendToMany', 'Sends tokens to multiple addresses')
  .addParam('sourcechainaddr', 'Source chain address')
  .addParam('destchainaddr', 'Destination chain address')
  .setAction(async (taskArgs, hre) => {
    const connectedWallet = getWallet(chains[0].rpc, hre.ethers)

    // grab an instance of the contract
    const contract = new hre.ethers.Contract(
      taskArgs.sourcechainaddr,
      GMPDistribution.abi,
      connectedWallet
    )

    // estimate gas
    const estimatedGasAmount = await sdkQuery.estimateGasFee(
      EvmChain.POLYGON,
      EvmChain.FANTOM,
      GasToken.MATIC,
      700000, //gasLimit
      1.1, //gasMultiplier
      '500000', //minGasPrice
    )


    // call sendToMany with gas passed in for it to work
    const tx1 = await contract.sendToMany(
      EvmChain.FANTOM,
      taskArgs.destchainaddr,
      [
        '0x03555aA97c7Ece30Afe93DAb67224f3adA79A60f',
        '0xC165CbEc276C26c57F1b1Cbc499109AbeCbA4474',
        '0x23f5536D2C7a8ffE66C385F9f7e53a5C86F53bD1',
      ],
      GasToken.aUSDC,
      3000000,
      { value: estimatedGasAmount }
    )

    console.log('tx1.hash', tx1.hash)



    // call sendToMany again with less gas then recommended and then retry on fail
    const tx2 = await contract.sendToMany(
      EvmChain.POLYGON,
      taskArgs.destchainaddr,
      [
        '0x03555aA97c7Ece30Afe93DAb67224f3adA79A60f',
        '0xC165CbEc276C26c57F1b1Cbc499109AbeCbA4474',
        '0x23f5536D2C7a8ffE66C385F9f7e53a5C86F53bD1',
      ],
      GasToken.aUSDC,
      3000000,
      { value: '1000' }
    )

    console.log('tx2 sent:', tx2.hash)


    const gasOptions: AddGasOptions = {
      evmWalletDetails: {
        privateKey: connectedWallet.privateKey,
      }
    }

    let tx2Status
    tx2Status = await sdkGmpRecovery.queryTransactionStatus(tx2.hash) //takes some time for this to be available

    while (tx2Status.status == GMPStatus.CANNOT_FETCH_STATUS) {
      tx2Status = await sdkGmpRecovery.queryTransactionStatus(tx2.hash);
      if (tx2Status.gasPaidInfo?.status == GasPaidStatus.GAS_UNPAID) {

        const { success, transaction } = await sdkGmpRecovery.addNativeGas(
          EvmChain.POLYGON,
          tx2.hash,
          gasOptions
        )
        console.log('gas status:', tx2Status.gasPaidInfo?.status)

        console.log('adding gas transaction:', transaction?.blockHash)
        console.log(success, 'is success')
      }
    }



  })

if (!process.env.MNEMONIC) throw ('undefined mnemonic')

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks: {
    polygon: {
      url: 'https://polygon-mumbai.g.alchemy.com/v2/Ksd4J1QVWaOJAJJNbr_nzTcJBJU-6uP3',
      accounts: { mnemonic: process.env.MNEMONIC },
      network_id: 80001,
    },
    fantom: {
      url: chains[1].rpc,
      accounts: { mnemonic: process.env.MNEMONIC },
      network_id: 4002,
    },
  },
}

export default config
