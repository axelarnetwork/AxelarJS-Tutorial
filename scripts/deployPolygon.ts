// import { Wallet, getDefaultProvider, ethers } from 'ethers'
import { ethers } from 'hardhat'

import GMPDistributionAbi from '../artifacts/contracts/GMPDistribution.sol/GMPDistribution.json'
import MockERC20 from '../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json'

import { getWallet } from '../utils/getWallet'

const aUSDC = '0x2c852e740B62308c46DD29B982FBb650D063Bd07'
const gateway = '0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B'
const gasService = '0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6'

// hh run scripts/deploy.ts --network polygon
// not running for multiple chains i need to run manually for each chain still
async function main() {

  const connectedWallet = getWallet()
  const gmpDistribution = await ethers.deployContract('GMPDistribution', [
    gateway,
    gasService,
  ])

  const mockERC20 = new ethers.Contract(
    aUSDC,
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
