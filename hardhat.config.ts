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
} from '@axelar-network/axelarjs-sdk'
import GMPDistribution from './artifacts/contracts/GMPDistribution.sol/GMPDistribution.json'

dotenv.config()

const sdkGmpRecovery = new AxelarGMPRecoveryAPI({
  environment: Environment.TESTNET,
})

const sdkQuery = new AxelarQueryAPI({ environment: Environment.TESTNET })

// npx hardhat sendToMany --sourceChainAddr <sourceChainAddr> --destChainAddr <destChainAddr>
// npx hardhat sendToMany --sourcechainaddr 0x3F4D4fDA591244F8F38058cbd30868405A606A42 (polygon) --destchainaddr 0xBEEfaAD92d9e46672629D5425A60F79e4f078181 (avalanche)
task('sendToMany', 'Sends tokens to multiple addresses')
  .addParam('sourcechainaddr', 'Source chain address')
  .addParam('destchainaddr', 'Destination chain address')
  .setAction(async (taskArgs, hre) => {
    const phrase = process.env.MNEMONIC

    if (!phrase) throw new Error('invalid mnemonic. Make sure the mnemonic environment variable is set.')

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
    console.log('tx1 sent:', tx1Status.status)

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
    console.log('(intentionally failing) tx2 sent')

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

    if (error) console.log('error:', error)

    console.log('extra gas added', success)
    console.log('extra gas added tx:', transaction)
  })

if (!process.env.MNEMONIC) throw ('mnemonic undefined')


const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks: {
    polygon: {
      // url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.POLYGON_KEY}`,
      url: 'https://polygon-mumbai.infura.io/v3/225f23db43804b1dbe4978dcb299fd52',
      accounts: { mnemonic: process.env.MNEMONIC },
      network_id: 80001,
    },
    avalanche: {
      url: `https://api.avax-test.network/ext/bc/C/rpc`,
      accounts: { mnemonic: process.env.MNEMONIC },
      network_id: 4002,
    },
  },
}

export default config
