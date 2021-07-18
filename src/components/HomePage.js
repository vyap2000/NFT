import React, { useState, useEffect } from "react";
import { Contract, getDefaultProvider, providers, utils } from "ethers";
import { config } from "../config";
import abi from "../fixtures/abi.json";
import axios from "axios";
// import { isAddress } from "ethers/lib/utils";

const provider = getDefaultProvider("rinkeby", { alchemy: config.alchemyKey });
const contract = new Contract(
  "0xCC866A2F77258eb32E4eA4F88c650AE4177Add9a",
  abi,
  provider
);

const refreshPage = () => {
  window.alert("MetaMask Tx Signature: User Denied!");
  window.location.reload();
}

const formatIpfsUrl = (url) => {
  return url.replace(/ipfs:\/\//g, "https://cloudflare-ipfs.com/");
};

export const HomePage = () => {
  const [mintedNftState, setMintedNftState] = useState({
    state: "UNINITIALIZED",
  });
  const [purchaseState, setPurchaseState] = useState({
    state: "UNINITIALIZED",
  });
  const modalVisible =
    purchaseState.state === "PENDING_METAMASK" ||
    purchaseState.state === "PENDING_SIGNER" ||
    purchaseState.state === "PENDING_CONFIRMAION";

  const loadRobotsData = async () => {
    setMintedNftState({
      state: "PENDING",
    });
    const totalSupply = await contract.totalSupply();
    const ids = [...Array(totalSupply.toNumber()).keys()];
    const deferredData = ids.map(async (id) => {
      const ipfsUri = await contract.tokenURI(id);
      const owner = await contract.ownerOf(id);
      const formattedUri = formatIpfsUrl(ipfsUri);
      const metadata = (await axios.get(formattedUri)).data;
      const formattedImage = formatIpfsUrl(metadata.image);
      return {
        id,
        name: metadata.name,
        image: formattedImage,
        description: metadata.description,
        owner,
      };
    });
    const data = await Promise.all(deferredData);
    setMintedNftState({
      state: "SUCCESS",
      data,
    });
  };

  useEffect(() => {
    loadRobotsData();
  }, []);

  const handlePurchase = async () => {
    const { ethereum } = window;
    if (typeof ethereum == "undefined") alert("Metamask is not detected");

    // Prompts Metamask to connect
    setPurchaseState({ state: "PENDING_METAMASK" });
    await ethereum.enable();

    // Create new provider from Metamask
    const provider = new providers.Web3Provider(window.ethereum);

    // Get the signer from Metamask
    const signer = provider.getSigner();
    
    // Create the contract instance
    const contract = new Contract(
    "0xCC866A2F77258eb32E4eA4F88c650AE4177Add9a",
      abi,
      signer
    );

    // Set "Pending" and call purchase function
    setPurchaseState({ state: "PENDING_SIGNER" });
        const receipt = await contract.purchase({ value: utils.parseEther("0.1") });

    setPurchaseState({ state: "PENDING_CONFIRMAION" });
        const transaction = await receipt.wait();
        console.log(transaction)

    setPurchaseState({ state: "SUCCESS", transaction });

    // Reload the Robots
    await loadRobotsData();
  };

  return (  
   <div className="min-h-screen bg-blue-900">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 ">
        <img src="https://cdn.dribbble.com/users/1320376/screenshots/5995453/apes_logo_1_1x.jpg" width={190} alt="logo"/>

        <div className="text-red-100 text-6xl pt-0 pb-1">BORED APE NFT</div>
        <div  style={{border: '4px solid navy'}}>
    </div>
        <div className="text-pink-500 text-l pt-2 pb-10">Pre-Launch Promotion Price @ 0.1 ETH
        </div>
        {mintedNftState.state === "PENDING" && (
          <div className="text-xl text-white">PRESENTING...</div>          
        )}
        <div id="x"></div> 
 
        {mintedNftState.state === "SUCCESS" && (
          <div className="grid grid-cols-4 gap-2">
            {mintedNftState.data.map(
              ({ id, image, name, description, owner }) => {
                return (
                  <div key={id} className="bg-white rounded p-2">
                    <img src={image} className="mx-auto p-1" alt={name} />
                    <div className="text-xl">{name}</div>
                    <div className="text-xs">{description}</div>
                    <hr className="my-3" />
                    <div className="text-center text-sm">Owner Address:</div>
                    <div className="text-center text-xs">{owner}</div>
                  </div>
                );
              }
            )}
          </div>
        )}
        <div className="mt-12">   
          <button
            onClick={handlePurchase}            
            type="button"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-white-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Buy Bored Ape  
              <img src="https://robohash.org/vincentyap" width={60} alt="" />
          </button>
          <img src="https://robohash.org/OTB.png?set=set1" width={120} alt="" />

        </div>
      </div>
      {modalVisible && (
        <div
          className="fixed z-10 inset-0 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-80 transition-opacity"
              aria-hidden="true"
            />
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h2
                    className="text-lg leading-10 font-medium text-black-900"
                    id="modal-title"
                  >
                    {purchaseState.state === "PENDING_METAMASK" &&
                      "Connecting Metamask..."}
                    {purchaseState.state === "PENDING_SIGNER" &&
                      "Waiting for Signed Transaction"}

                    {purchaseState.state === "PENDING_CONFIRMAION" &&
                      "Waiting for Block Confirmation"}
                  </h2>
                  <div className="mt-2">

                    <p className="text-sm text-gray-500">
                      {purchaseState.state === "PENDING_METAMASK" &&
                        "Please allow Metamask to connect to this application!"}
                      {purchaseState.state === "PENDING_SIGNER" &&
                        "Please approve transaction in Metamask"}
                  <div className="m-3">
                  <div style={{ borderTop: "12px solid #fff ", marginLeft: 20, marginRight: 20 }}></div>
                      <button
                        onClick={refreshPage}
                        type="button"
                        className="items-center px-12 py-2 border border-transparent text-l font-medium rounded-md shadow-sm text-white bg-indigo-300 hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                        Back
                      </button>
                    </div>
                      {purchaseState.state === "PENDING_CONFIRMAION" &&
                        "Your transaction had been submitted. Waiting for 1 block confirmation...(0/1 confirmation)"}
                      <img src="https://robohash.org/293.png?set=set5" width={60} hieght={10}alt="" pt-10 pb-21 /> 
                      <div style={{ borderTop: "15px solid #fff ", marginLeft: 20, marginRight: 20 }}></div>
                      <div className="text-center text-xs text-gray-500">Gas Genie's Gas-timation is 1-3 gwei. </div>                    
                      <div style={{ borderTop: "9px solid #fff ", marginLeft: 20, marginRight: 20 }}></div>
                      <div className="text-center text-xs text-pink-500">Click "Back" button</div>                    
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};