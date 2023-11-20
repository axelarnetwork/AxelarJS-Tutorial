import dotenv from 'dotenv'
import { task, HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import DistributionExecutable from './artifacts/contracts/DistributionExecutable.sol/DistributionExecutable.json'

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
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.POLYGON_KEY}`,
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
