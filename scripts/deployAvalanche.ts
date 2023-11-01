import { ethers } from 'hardhat'
import MockERC20 from '../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json'
import { getWallet } from '../utils/getWallet'

async function main() {

    const connectedWallet = getWallet()

    const avalancheGateway = '0x97837985Ec0494E7b9C71f5D3f9250188477ae14'
    const avalancheGasService = '0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6'
    const avalancheAUSDC = '0x75Cc4fDf1ee3E781C1A3Ee9151D5c6Ce34Cf5C61'


    const gmpDistribution = await ethers.deployContract('GMPDistribution', [
        avalancheGateway,
        avalancheGasService,
    ])

    const mockERC20 = new ethers.Contract(
        avalancheAUSDC,
        MockERC20.abi,
        connectedWallet
    )

    await gmpDistribution.waitForDeployment()

    await mockERC20.approve(gmpDistribution.target, '1234567895')

    console.log(`Avalanche contract address: ${gmpDistribution.target}`)
}




main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
