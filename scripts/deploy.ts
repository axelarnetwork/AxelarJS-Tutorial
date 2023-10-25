// import { Wallet, getDefaultProvider, ethers } from 'ethers'
import { ethers } from 'hardhat'

import GMPDistributionAbi from '../artifacts/contracts/GMPDistribution.sol/GMPDistribution.json'
import MockERC20 from '../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json'
import chains from '../chains.json'

import { getWallet } from '../utils/getWallet'

// hh run scripts/deploy.ts --network polygon
// not running for multiple chains i need to run manually for each chain still
async function main() {
  const evmChains = getEvmChains()

  const connectedWallet = getWallet()
  for (const chain of evmChains) {
    const gmpDistribution = await ethers.deployContract('GMPDistribution', [
      chain.gateway,
      chain.gasService,
    ])

    const mockERC20 = new ethers.Contract(
      chain.aUSDC,
      MockERC20.abi,
      connectedWallet
    )

    await gmpDistribution.waitForDeployment()

    await mockERC20.approve(gmpDistribution.target, '1234567895')

    console.log(`${chain.name} contract address: ${gmpDistribution.target}`)
  }
}

function getEvmChains() {
  return chains.map((chain) => ({ ...chain }))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
