const contractAddress = "0x51b4a241b5b44a1fe27bbbe13642641dd46b818a";
const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum Mentorship.MentorChoice",
        name: "mentorChoice",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "BookingMade",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "InvalidPaymentAmount",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "mentorChoiceIndex",
        type: "uint256",
      },
    ],
    name: "MentorChoiceOutOfRange",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
  {
    inputs: [],
    name: "getAllBookings",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "enum Mentorship.MentorChoice",
            name: "mentorChoice",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct Mentorship.Booking[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserBookings",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "enum Mentorship.MentorChoice",
            name: "mentorChoice",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct Mentorship.Booking[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum Mentorship.MentorChoice",
        name: "",
        type: "uint8",
      },
    ],
    name: "sessionPrices",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

let provider;
let signer;
let contract;

// Connect to the provider
async function connectWallet() {
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log("Wallet connected");
  } catch (error) {
    console.error("Failed to connect wallet:", error);
  }
}

document
  .getElementById("connectButton")
  .addEventListener("click", connectWallet);

/* Added wallet status */

// Connect to the provider and update UI
async function connectWallet() {
  try {
    // Request account access
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Initialize provider, signer, and contract
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Update the button text to reflect the connection state
    document.getElementById("connectButton").innerText = "Wallet Connected";
    console.log("Wallet connected");
  } catch (error) {
    console.error("Failed to connect wallet:", error);
  }
}

// Check if wallet is already connected when page loads
async function checkWalletConnection() {
  if (typeof window.ethereum !== "undefined") {
    provider = new ethers.providers.Web3Provider(window.ethereum);

    // Fetch accounts from the provider
    const accounts = await provider.send("eth_accounts", []);

    if (accounts.length > 0) {
      // If there are accounts, wallet is connected
      signer = provider.getSigner();
      contract = new ethers.Contract(contractAddress, contractABI, signer);
      document.getElementById("connectButton").innerText = "Wallet Connected";
    } else {
      // No accounts, wallet is not connected
      document.getElementById("connectButton").innerText = "Connect Wallet";
    }
  } else {
    // MetaMask or another wallet extension is not installed
    document.getElementById("connectButton").innerText = "Install MetaMask";
  }
}

// Listen for account changes and update UI accordingly
if (window.ethereum) {
  window.ethereum.on("accountsChanged", function (accounts) {
    if (accounts.length > 0) {
      document.getElementById("connectButton").innerText = "Wallet Connected";
    } else {
      document.getElementById("connectButton").innerText = "Connect Wallet";
    }
  });
}

// Attach event listener to the connect button
document
  .getElementById("connectButton")
  .addEventListener("click", connectWallet);

// Check wallet connection when the page loads
window.addEventListener("load", checkWalletConnection);
/* */

async function bookSession() {
  clearDisplay(); // Clear previous messages and bookings

  const sessionTypeElement = document.getElementById("sessionType");
  const sessionType = parseInt(sessionTypeElement.value, 10);

  // Validate session type
  if (isNaN(sessionType) || sessionType < 0 || sessionType > 3) {
    displayMessage(
      "Invalid session type. Please enter a number between 0 and 3.",
      "error"
    );
    return;
  }

  try {
    // Retrieve the price for the selected session type
    const price = await contract.sessionPrices(sessionType);

    // Send the transaction to book a session
    const tx = await signer.sendTransaction({
      to: contractAddress,
      value: price,
    });
    await tx.wait();

    console.log("Session booked successfully:", tx);
    displayMessage("Session booked successfully!", "success");
  } catch (error) {
    console.error("Error booking session:", error);
    displayMessage("Failed to book session: " + error.message, "error");
  }
}

document.getElementById("bookSession").addEventListener("click", bookSession);

async function checkBalance() {
  clearDisplay(); // Clear previous messages and bookings

  try {
    const userAddress = await signer.getAddress();
    const isOwner = userAddress === (await contract.owner());
    if (!isOwner) {
      displayMessage("Only the contract owner can check the balance.", "error");
      return;
    }

    const balance = await contract.getBalance();
    console.log("Contract balance:", balance.toString());
    displayMessage(
      "Contract balance: " + ethers.utils.formatEther(balance) + " ETH",
      "info"
    );
  } catch (error) {
    console.error("Error checking balance:", error);
    displayMessage("Failed to check balance: " + error.message, "error");
  }
}

document.getElementById("checkBalance").addEventListener("click", checkBalance);

async function withdrawFunds() {
  clearDisplay(); // Clear previous messages and bookings

  try {
    const tx = await contract.withdraw();
    await tx.wait();
    console.log("Funds withdrawn successfully:", tx);
    displayMessage("Funds withdrawn successfully!", "success");
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    displayMessage("Failed to withdraw funds: " + error.message, "error");
  }
}

document
  .getElementById("withdrawFunds")
  .addEventListener("click", withdrawFunds);

async function getUserBookings() {
  clearDisplay(); // Clear previous messages and bookings

  try {
    const userAddress = await signer.getAddress();
    const bookings = await contract.getUserBookings(userAddress);
    console.log("User bookings:", bookings);
    displayBookings("Your Bookings", bookings);
  } catch (error) {
    console.error("Error retrieving user bookings:", error);
    displayMessage(
      "Failed to retrieve user bookings: " + error.message,
      "error"
    );
  }
}

document
  .getElementById("getUserBookings")
  .addEventListener("click", getUserBookings);

async function getAllBookings() {
  clearDisplay(); // Clear previous messages and bookings

  try {
    const userAddress = await signer.getAddress();
    const isOwner = userAddress === (await contract.owner());
    if (!isOwner) {
      displayMessage(
        "Only the contract owner can access all bookings.",
        "error"
      );
      return;
    }

    const allBookings = await contract.getAllBookings();
    console.log("All bookings:", allBookings);
    displayBookings("All Bookings", allBookings);
  } catch (error) {
    console.error("Error retrieving all bookings:", error);
    displayMessage(
      "Failed to retrieve all bookings: " + error.message,
      "error"
    );
  }
}

document
  .getElementById("getAllBookings")
  .addEventListener("click", getAllBookings);

// Helper function to display messages
function displayMessage(message, type) {
  const messageContainer = document.getElementById("messageContainer");
  messageContainer.innerHTML = `<p class="${type}">${message}</p>`;
}

function displayBookings(title, bookings) {
  const bookingContainer = document.getElementById("bookingContainer");
  let html = `<h3>${title}</h3><ul>`;
  bookings.forEach((booking) => {
    const timestamp = new Date(booking.timestamp * 1000).toLocaleString(); // Convert timestamp to readable date
    html += `<li>User: ${booking.user}, Amount: ${ethers.utils.formatEther(
      booking.amount
    )} ETH, Time: ${timestamp}</li>`;
  });
  html += "</ul>";
  bookingContainer.innerHTML = html;
}

// Helper function to clear messages and bookings
function clearDisplay() {
  document.getElementById("messageContainer").innerHTML = "";
  document.getElementById("bookingContainer").innerHTML = "";
}

// /* javascript added code to better display*/
