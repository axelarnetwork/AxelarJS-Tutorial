import { ethers } from 'hardhat'
import MockERC20 from '../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json'
import { getWallet } from '../utils/getWallet'

async function main() {

    const connectedWallet = getWallet()

    const polygonGateway = '0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B'
    const polygonGasService = '0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6'
    const polygonAUSDC = '0x2c852e740B62308c46DD29B982FBb650D063Bd07'


    const distributionExecutable = await ethers.deployContract('DistributionExecutable', [
        polygonGateway,
        polygonGasService,
    ])

    const mockERC20 = new ethers.Contract(
        polygonAUSDC,
        MockERC20.abi,
        connectedWallet
    )

    await distributionExecutable.waitForDeployment()

    await mockERC20.approve(distributionExecutable.target, '1234567895')

    console.log(`Polygon mumbai contract address: ${distributionExecutable.target}`)
}




main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
