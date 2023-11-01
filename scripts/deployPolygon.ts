import { ethers } from 'hardhat'
import chains from '../chains.json'
import MockERC20 from '../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json'

import { getWallet } from '../utils/getWallet'


// hh run scripts/deploy.ts --network polygon
// not running for multiple chains i need to run manually for each chain still
async function main() {

  const connectedWallet = getWallet(chains[0].rpc, ethers)

  const gmpDistribution = await ethers.deployContract('GMPDistribution', [
    chains[0].gateway,
    chains[0].gasService,
  ])

  const mockERC20 = new ethers.Contract(
    chains[0].aUSDC,
    MockERC20.abi,
    connectedWallet
  )

  await gmpDistribution.waitForDeployment()

  await mockERC20.approve(gmpDistribution.target, '1234567895')

  console.log(`polygon contract address: ${gmpDistribution.target}`)
}



main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
