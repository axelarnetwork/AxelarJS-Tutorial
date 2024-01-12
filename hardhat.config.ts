import dotenv from 'dotenv'
import { task, HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import chains from './chains.json'
import { getWallet } from './utils/getWallet'
import GMPDistribution from './artifacts/contracts/DistributionExecutable.sol/DistributionExecutable.json'
import { AxelarQueryAPI, Environment, EvmChain, AddGasOptions, GasToken, AxelarGMPRecoveryAPI, GasPaidStatus, GMPStatus }
  from '@axelar-network/axelarjs-sdk'
dotenv.config()

const sdkQuery = new AxelarQueryAPI({ environment: Environment.TESTNET })

const sdkGmpRecovery = new AxelarGMPRecoveryAPI({
  environment: Environment.TESTNET
})

task("sendToMany", "Send tokens across chain using axelarjs")
  .addParam("sourcechainaddr", "The source chain address")
  .addParam("destchainaddr", "The destination chain address")
  .setAction(async (taskArgs, hre) => {
    console.log("Let's do this!");
    const connectedWallet = getWallet(chains[0].rpc, hre.ethers)

    const contract = new hre.ethers.Contract(
      taskArgs.sourcechainaddr,
      GMPDistribution.abi,
      connectedWallet
    )

    const estimatedGasAmount = await sdkQuery.estimateGasFee(
      EvmChain.POLYGON,
      EvmChain.FANTOM,
      GasToken.MATIC,
      700000,
      1.1,
      '500000'
    )

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

    const tx2 = await contract.sendToMany(
      EvmChain.FANTOM,
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

    let tx2Status
    tx2Status = await sdkGmpRecovery.queryTransactionStatus(tx2.hash)
    console.log('tx2.hash', tx2.hash)

    const gasOptions: AddGasOptions = {
      evmWalletDetails: {
        privateKey: connectedWallet.privateKey,
      }
    }

    while (tx2Status.status == GMPStatus.CANNOT_FETCH_STATUS || GasPaidStatus.GAS_UNPAID) {
      tx2Status = await sdkGmpRecovery.queryTransactionStatus(tx2.hash)
      console.log(tx2Status.gasPaidInfo?.status, 'status')
      if (tx2Status.gasPaidInfo?.status == GasPaidStatus.GAS_PAID_NOT_ENOUGH_GAS) {
        console.log("inside if statement")
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
  });

if (!process.env.MNEMONIC) throw ('mnemonic undefined')

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks: {
    polygon: {
      url: 'https://polygon-mumbai.g.alchemy.com/v2/Ksd4J1QVWaOJAJJNbr_nzTcJBJU-6uP3',
      accounts: { mnemonic: process.env.MNEMONIC },
      chainId: 80001,
    },
    fantom: {
      url: chains[1].rpc,
      accounts: { mnemonic: process.env.MNEMONIC },
      chainId: chains[1].chainId,
    },
  },
}

export default config
