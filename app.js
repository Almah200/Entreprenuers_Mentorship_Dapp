const contractAddress = "0x98d3384ebf3d5ac904852196898bae31a0ae9a05";
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
        internalType: "enum MentoringAndCoaching.CoachChoice",
        name: "coachChoice",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
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
        indexed: false,
        internalType: "uint256",
        name: "CoachChoiceIndex",
        type: "uint256",
      },
    ],
    name: "CoachChoiceOutOfRange",
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
            internalType: "enum MentoringAndCoaching.CoachChoice",
            name: "coachChoice",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        internalType: "struct MentoringAndCoaching.Booking[]",
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
            internalType: "enum MentoringAndCoaching.CoachChoice",
            name: "coachChoice",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        internalType: "struct MentoringAndCoaching.Booking[]",
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
        internalType: "enum MentoringAndCoaching.CoachChoice",
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

// Helper function to display bookings
function displayBookings(title, bookings) {
  const bookingContainer = document.getElementById("bookingContainer");
  let html = `<h3>${title}</h3><ul>`;
  bookings.forEach((booking) => {
    html += `<li>User: ${booking.user}, Session Type: ${
      booking.sessionType
    }, Amount: ${ethers.utils.formatEther(booking.amount)} ETH</li>`;
  });
  html += "</ul>";
  bookingContainer.innerHTML = html;
}

// Helper function to clear messages and bookings
function clearDisplay() {
  document.getElementById("messageContainer").innerHTML = "";
  document.getElementById("bookingContainer").innerHTML = "";
}
