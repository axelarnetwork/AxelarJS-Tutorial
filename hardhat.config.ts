import dotenv from 'dotenv'
import { task, HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import chains from './chains.json'

dotenv.config()


task("sendToMany", "Send tokens across chain using axelarjs")
  .addParam("sourcechainaddr", "The source chain address")
  .addParam("destchainaddr", "The destination chain address")
  .setAction(async (taskArgs, hre) => {
    console.log("Let's do this!");

  });

if (!process.env.MNEMONIC) throw ('mnemonic undefined')

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks: {
    polygon: {
      url: chains[0].rpc,
      accounts: { mnemonic: process.env.MNEMONIC },
      chainId: chains[0].chainId,
    },
    fantom: {
      url: chains[1].rpc,
      accounts: { mnemonic: process.env.MNEMONIC },
      chainId: chains[1].chainId,
    },
  },
}

export default config
