import { ethers } from 'hardhat'
import chains from '../chains.json'
import MockERC20 from '../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json'

import { getWallet } from '../utils/getWallet'
async function main() {
    const approvalAmount = ethers.parseUnits('123', 'ether');
    const connectedWallet = getWallet(chains[0].rpc, ethers)
    const distributionExecutable = await ethers.deployContract('DistributionExecutable', [
        chains[0].gateway,
        chains[0].gasService,
    ])
    const mockERC20 = new ethers.Contract(
        chains[0].aUSDC,
        MockERC20.abi,
        connectedWallet
    )
    await distributionExecutable.waitForDeployment()
    await mockERC20.approve(distributionExecutable.target, approvalAmount)
    console.log(`polygon contract address: ${distributionExecutable.target}`)
}
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})