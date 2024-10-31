// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Mentorship {
    address public owner;

    enum MentorChoice {
        MentorOne,
        MentorTwo,
        MentorThree,
        MentorFour
    }

    struct Booking {
        address user;
        MentorChoice mentorChoice;
        uint256 amount;
        uint256 timestamp; // Timestamp added for each booking
    }

    // Mapping from user address to their bookings
    mapping(address => Booking[]) private userBookings;

    // Array to store all bookings in the contract
    Booking[] private allBookings;

    // Mapping to store session prices
    mapping(MentorChoice => uint256) public sessionPrices;

    // Events
    event BookingMade(
        address indexed user,
        MentorChoice mentorChoice,
        uint256 amount,
        uint256 timestamp // Emit timestamp with event
    );
    event InvalidPaymentAmount(address indexed user, uint256 amount);
    event MentorChoiceOutOfRange(uint256 mentorChoiceIndex);

    constructor() {
        owner = msg.sender;

        // Set session prices in wei
        sessionPrices[MentorChoice.MentorOne] = 7 wei;
        sessionPrices[MentorChoice.MentorTwo] = 7 wei;
        sessionPrices[MentorChoice.MentorThree] = 7 wei;
        sessionPrices[MentorChoice.MentorFour] = 7 wei;
    }

    // Receive function to accept Ether with empty data
    receive() external payable {
        require(msg.sender != owner, "Owner cannot send Ether to the contract");

        bool validAmount = false;
        MentorChoice mentorChoice;
        uint256 amount = msg.value;

        // Check for valid session price
        for (uint i = 0; i < 4; i++) {
            if (amount == sessionPrices[MentorChoice(i)]) {
                mentorChoice = MentorChoice(i);
                validAmount = true;
                break;
            }
        }

        require(validAmount, "Invalid payment amount");

        // Record the booking with timestamp
        Booking memory newBooking = Booking(
            msg.sender,
            mentorChoice,
            amount,
            block.timestamp
        );
        userBookings[msg.sender].push(newBooking);
        allBookings.push(newBooking);

        // Emit event with timestamp
        emit BookingMade(msg.sender, mentorChoice, amount, block.timestamp);
    }

    // Fallback function to accept Ether with non-empty data
    fallback() external payable {
        require(msg.sender != owner, "Owner cannot send Ether to the contract");

        bool validAmount = false;
        MentorChoice mentorChoice;
        uint256 amount = msg.value;

        // Check for valid session price
        for (uint i = 0; i < 4; i++) {
            if (amount == sessionPrices[MentorChoice(i)]) {
                mentorChoice = MentorChoice(i);
                validAmount = true;
                break;
            }
        }

        require(validAmount, "Invalid payment amount");

        // Record the booking with timestamp
        Booking memory newBooking = Booking(
            msg.sender,
            mentorChoice,
            amount,
            block.timestamp
        );
        userBookings[msg.sender].push(newBooking);
        allBookings.push(newBooking);

        // Emit event with timestamp
        emit BookingMade(msg.sender, mentorChoice, amount, block.timestamp);
    }

    // Function to withdraw all Ether from the contract to the owner
    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        require(address(this).balance > 0, "Contract balance is zero");
        payable(owner).transfer(address(this).balance);
    }

    // Get the balance of the contract
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Get all bookings for a specific address, including timestamp
    function getUserBookings(
        address user
    ) external view returns (Booking[] memory) {
        return userBookings[user];
    }

    // Get all bookings in the contract, including timestamp
    function getAllBookings() external view returns (Booking[] memory) {
        return allBookings;
    }
}
