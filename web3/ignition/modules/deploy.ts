import { ethers } from "hardhat";

async function main() {
  // Get the ContractFactory for the contract
  const Nftix = await ethers.deployContract("Nftix");

  console.log("Deploying Nftix...");

  // Wait for the deployment to complete
  await Nftix.waitForDeployment();

  // Get the deployed contract's address
  const contractAddress = await Nftix.getAddress();
  console.log("Nftix deployed to:", contractAddress);
}

// Proper error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });