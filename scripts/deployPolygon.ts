import dotenv from 'dotenv'
import { ethers } from 'hardhat'
import MockERC20 from '../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json'
import { getWallet } from '../utils/getWallet'

async function main() {
    dotenv.config()

    const polygonRpc = `https://polygon-mumbai.g.alchemy.com/v2/${process.env.POLYGON_ALCHEMY_KEY}`
    const connectedWallet = getWallet(polygonRpc)


    const polygonGateway = '0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B'
    const polygonGasService = '0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6'
    const polygonAUSDC = '0x2c852e740B62308c46DD29B982FBb650D063Bd07'


    // const gmpDistribution = await ethers.deployContract('GMPDistribution', [
    //     polygonGateway,
    //     polygonGasService,
    // ])

    const mockERC20 = new ethers.Contract(
        polygonAUSDC,
        MockERC20.abi,
        connectedWallet
    )
    // await gmpDistribution.waitForDeployment()
    const gmpDistribution = '0xf867B95cd5c027d6AaC433Fbca348465aE087938'
    console.log(mockERC20, 'mock')
    await mockERC20.approve(gmpDistribution, '1234567895')
    // await mockERC20.approve(gmpDistribution.target, '1234567895')

    console.log(`Polygon mumbai contract address: ${gmpDistribution}`)
    // console.log(`Polygon mumbai contract address: ${gmpDistribution.target}`)
}




main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
