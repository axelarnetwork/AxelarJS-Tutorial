import dotenv from 'dotenv'
import { task, HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import chains from './chains.json'
// import { ethers } from 'hardhat'
import {
  AxelarGMPRecoveryAPI,
  AxelarQueryAPI,
  Environment,
  EvmChain,
  AddGasOptions,
} from '@axelar-network/axelarjs-sdk'
import GMPDistribution from './artifacts/contracts/GMPDistribution.sol/GMPDistribution.json'

dotenv.config()

const sdkGmpRecovery = new AxelarGMPRecoveryAPI({
  environment: Environment.TESTNET,
})

const sdkQuery = new AxelarQueryAPI({ environment: Environment.TESTNET })

// async function main(sourceChainAddr: string, destChainAddr: string) {

// npx hardhat sendToMany --sourceChainAddr <sourceChainAddr> --destChainAddr <destChainAddr>
task('sendToMany', 'Sends tokens to multiple addresses')
  .addParam('sourcechainaddr', 'Source chain address')
  .addParam('destchainaddr', 'Destination chain address')
  .setAction(async (taskArgs, hre) => {
    // const connectedWallet = getWallet()
    const phrase = process.env.MNEMONIC

    if (!phrase) {
      throw new Error(
        'invalid mnemonic. Make sure the mnemonic environment variable is set.'
      )
    }
    const newMnemonic = hre.ethers.Mnemonic.fromPhrase(phrase)
    const path = `m/44'/60'/0'/0/1`
    const wallet = hre.ethers.HDNodeWallet.fromMnemonic(newMnemonic, path)
    const provider = hre.ethers.getDefaultProvider(chains[0].rpc)
    const connectedWallet = wallet.connect(provider)

    // grab an instance of the contract
    const contract = new hre.ethers.Contract(
      taskArgs.sourcechainaddr,
      GMPDistribution.abi,
      connectedWallet
    )

    // estimate gas
    const estimatedGasAmount = await sdkQuery.estimateGasFee(
      EvmChain.POLYGON,
      EvmChain.AVALANCHE,
      'MATIC',
      700000, //gasLimit
      1.1, //gasMultiplier
      '500000' //minGasPrice
    )

    // call sendToMany with gas passed in for it to work
    const tx1 = await contract.sendToMany(
      EvmChain.AVALANCHE,
      taskArgs.destchainaddr,
      [
        '0x03555aA97c7Ece30Afe93DAb67224f3adA79A60f',
        '0xC165CbEc276C26c57F1b1Cbc499109AbeCbA4474',
        '0x23f5536D2C7a8ffE66C385F9f7e53a5C86F53bD1',
      ],
      'aUSDC',
      3000000,
      { value: estimatedGasAmount.toString() }
    )

    const tx1Hash: string = tx1.hash

    const tx1Status = await sdkGmpRecovery.queryTransactionStatus(tx1Hash) //takes some time for this to be available
    console.log('tx1 stats:', tx1Status.status)

    // call sendToMany again with less gas then recommended and then retry on fail
    const tx2 = await contract.sendToMany(
      EvmChain.AVALANCHE,
      taskArgs.destchainaddr,
      [
        '0x03555aA97c7Ece30Afe93DAb67224f3adA79A60f',
        '0xC165CbEc276C26c57F1b1Cbc499109AbeCbA4474',
        '0x23f5536D2C7a8ffE66C385F9f7e53a5C86F53bD1',
      ],
      'aUSDC',
      3000000,
      { value: '1000' }
    )

    const tx2Hash: string = tx2.hash

    const gasOptions: AddGasOptions = {
      evmWalletDetails: {
        useWindowEthereum: false,
        privateKey: connectedWallet.privateKey,
      },
    }

    const { success, transaction, error } = await sdkGmpRecovery.addNativeGas(
      EvmChain.POLYGON,
      tx2Hash,
      gasOptions
    )

    console.log(success, 'is success')
  })

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks: {
    polygon: {
      // url: chains[0].rpc,
      url: 'https://polygon-mumbai.g.alchemy.com/v2/Ksd4J1QVWaOJAJJNbr_nzTcJBJU-6uP3',
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      network_id: 80001,
    },
    fantom: {
      url: chains[1].rpc,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      network_id: 4002,
    },
  },
}

export default config
