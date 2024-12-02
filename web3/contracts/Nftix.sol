// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Nftix is ERC721URIStorage {
    // Custom Errors
    error Nftix__InvalidEventDates();
    error Nftix__InvalidTicketCount();
    error Nftix__EventAlreadyStarted();
    error Nftix__InsufficientSeats();
    error Nftix__InvalidSeatNumber();
    error Nftix__SeatAlreadyBooked();
    error Nftix__InsufficientPayment();
    error Nftix__NotTicketOwner();
    error Nftix__TicketNotResellable();
    error Nftix__ResalePriceExceeded();

    // Event Types Enum
    enum EventType {
        Concert,
        StandupShow,
        SportsEvent
    }

    address public owner; // Contract owner address
    uint256 public s_eventCounter; // Manual event counter
    uint256 public s_ticketCounter; // Manual ticket counter

    uint256 public constant ROYALTY_PERCENT = 6; // 6%
    uint256 public constant RESELLER_PERCENT = 5; // 5%
    uint256 public constant PLATFORM_PERCENT = 3; // 3%
    uint256 public constant INITIAL_SALE_CONVENIENCE_FEE_PERCENT = 3; // 3% convenience fee on first sale
    uint256 public constant MAX_RESELL_PERCENT = 115; // 115%

    struct Event {
        address owner;
        uint256 eventId;
        uint256 price;
        uint256 totalTickets;
        uint256 soldTickets;
        uint256 startDate;
        uint256 endDate;
        EventType eventType;
        string name;
        string description;
        string location;
        string image;
        bool[] seats; // Tracks booked seats
    }

    struct Ticket {
        address owner;
        uint256 ticketId;
        uint256 price;
        uint256 eventId;
        uint256 timesSold;
        uint256[] seatNumbers; // Array of seat numbers
        bool isResellable;
    }

    struct TicketWithEventDetails {
        Ticket ticket;
        Event eventDetails;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => bool) public listedForResale; // Tracks resale tickets

    event EventCreated(uint256 eventId, string name, EventType eventType);
    event TicketMinted(
        uint256 ticketId,
        uint256 eventId,
        address owner,
        uint256[] seatNumbers
    );
    event TicketListedForResale(uint256 ticketId, uint256 price);
    event TicketResold(uint256 ticketId, address newOwner, uint256 price);

    constructor() ERC721("EventTicket", "ETKT") {
        owner = msg.sender;
    }

    function createEvent(
        uint256 price,
        uint256 totalTickets,
        uint256 startDate,
        uint256 endDate,
        EventType eventType,
        string memory name,
        string memory description,
        string memory location,
        string memory image
    ) external {
        if (startDate >= endDate) revert Nftix__InvalidEventDates();
        if (totalTickets == 0) revert Nftix__InvalidTicketCount();

        s_eventCounter++; // Increment the event counter
        uint256 eventId = s_eventCounter;

        // Initialize the seats as unbooked (false)
        bool[] memory seats = new bool[](totalTickets);

        events[eventId] = Event({
            owner: msg.sender,
            eventId: eventId,
            price: price,
            totalTickets: totalTickets,
            soldTickets: 0,
            startDate: startDate,
            endDate: endDate,
            eventType: eventType,
            name: name,
            description: description,
            location: location,
            image: image,
            seats: seats
        });

        emit EventCreated(eventId, name, eventType);
    }

    function bookTicket(
        uint256 eventId,
        uint256[] memory seatNumbers
    ) external payable {
        Event storage _event = events[eventId];
        if (_event.startDate <= block.timestamp)
            revert Nftix__EventAlreadyStarted();
        if (seatNumbers.length == 0) revert Nftix__InsufficientSeats();
        if (_event.soldTickets + seatNumbers.length > _event.totalTickets)
            revert Nftix__InsufficientSeats();

        // Calculate total ticket price
        uint256 totalTicketPrice = _event.price * seatNumbers.length;

        // Calculate convenience fee for initial sale
        uint256 convenienceFee = (totalTicketPrice *
            INITIAL_SALE_CONVENIENCE_FEE_PERCENT) / 100;

        // Ensure sufficient payment including convenience fee
        if (msg.value < totalTicketPrice + convenienceFee)
            revert Nftix__InsufficientPayment();

        for (uint256 i = 0; i < seatNumbers.length; i++) {
            uint256 seatNumber = seatNumbers[i];
            if (seatNumber >= _event.totalTickets)
                revert Nftix__InvalidSeatNumber();
            if (_event.seats[seatNumber]) revert Nftix__SeatAlreadyBooked();
            _event.seats[seatNumber] = true; // Mark the seat as booked
        }

        s_ticketCounter++; // Increment the ticket counter
        uint256 ticketId = s_ticketCounter;

        tickets[ticketId] = Ticket({
            owner: msg.sender,
            ticketId: ticketId,
            price: _event.price,
            eventId: eventId,
            timesSold: 0,
            seatNumbers: seatNumbers,
            isResellable: true
        });

        _mint(msg.sender, ticketId);
        _setTokenURI(ticketId, _event.image);

        _event.soldTickets += seatNumbers.length;

        // Distribute initial sale fees
        uint256 eventOwnerShare = totalTicketPrice;
        payable(_event.owner).transfer(eventOwnerShare);
        payable(owner).transfer(convenienceFee);

        emit TicketMinted(ticketId, eventId, msg.sender, seatNumbers);
    }

    function listForResale(uint256 ticketId, uint256 resalePrice) external {
        Ticket storage ticket = tickets[ticketId];
        if (ticket.owner != msg.sender) revert Nftix__NotTicketOwner();
        if (!ticket.isResellable) revert Nftix__TicketNotResellable();
        if (resalePrice > (ticket.price * MAX_RESELL_PERCENT) / 100)
            revert Nftix__ResalePriceExceeded();

        listedForResale[ticketId] = true;

        emit TicketListedForResale(ticketId, resalePrice);
    }

    function resellTicket(uint256 ticketId) external payable {
        Ticket storage ticket = tickets[ticketId];
        if (!listedForResale[ticketId]) revert Nftix__InsufficientPayment();
        if (msg.value < ticket.price) revert Nftix__InsufficientPayment();

        uint256 resalePrice = msg.value;

        // Calculate shares
        uint256 royalty = (resalePrice * ROYALTY_PERCENT) / 100;
        uint256 resellerShare = (resalePrice * RESELLER_PERCENT) / 100;
        uint256 platformFee = (resalePrice * PLATFORM_PERCENT) / 100;

        uint256 totalShares = royalty + resellerShare + platformFee;
        require(resalePrice >= totalShares, "Invalid distribution");

        // Pay the shares
        payable(events[ticket.eventId].owner).transfer(royalty);
        payable(ticket.owner).transfer(resellerShare);
        payable(owner).transfer(platformFee);

        // Transfer ownership
        address previousOwner = ticket.owner;
        ticket.owner = msg.sender;
        ticket.timesSold += 1;

        _transfer(previousOwner, msg.sender, ticketId);
        listedForResale[ticketId] = false;

        emit TicketResold(ticketId, msg.sender, resalePrice);
    }

    /* Getter Functions */

    function getBookedSeats(
        uint256 eventId
    ) external view returns (uint256[] memory) {
        Event storage _event = events[eventId];
        uint256[] memory bookedSeats = new uint256[](_event.soldTickets);
        uint256 index = 0;

        for (uint256 i = 0; i < _event.totalTickets; i++) {
            if (_event.seats[i]) {
                bookedSeats[index] = i;
                index++;
            }
        }

        return bookedSeats;
    }

    function getEventsByType(
        EventType eventType
    ) external view returns (Event[] memory) {
        // First, count the number of events of the specified type
        uint256 count = 0;
        for (uint256 i = 1; i <= s_eventCounter; i++) {
            if (events[i].eventType == eventType) {
                count++;
            }
        }

        // Create an array to store the matching events
        Event[] memory matchingEvents = new Event[](count);

        // Populate the array with matching events
        uint256 index = 0;
        uint256 copyofEventCounter = s_eventCounter;
        for (uint256 i = 1; i <= copyofEventCounter; i++) {
            if (events[i].eventType == eventType) {
                matchingEvents[index] = events[i];
                index++;
            }
        }

        return matchingEvents;
    }

    function getAllEvents() external view returns (Event[] memory) {
        Event[] memory eventList = new Event[](s_eventCounter);
        uint256 copyOfEventCount = s_eventCounter;

        for (uint256 i = 1; i <= copyOfEventCount; i++) {
            eventList[i - 1] = events[i];
        }

        return eventList;
    }

    function getTicketsByOwner(
        address me
    ) external view returns (TicketWithEventDetails[] memory) {
        // First, count the number of tickets owned by the specified address
        uint256 count = 0;
        uint256 copyOfTicketCount = s_ticketCounter;

        for (uint256 i = 1; i <= copyOfTicketCount; i++) {
            if (tickets[i].owner == me) {
                count++;
            }
        }

        // Create an array to store the matching tickets with event details
        TicketWithEventDetails[]
            memory matchingTicketsWithEvents = new TicketWithEventDetails[](
                count
            );

        // Populate the array with matching tickets and their event details
        uint256 index = 0;
        for (uint256 i = 1; i <= copyOfTicketCount; i++) {
            if (tickets[i].owner == me) {
                matchingTicketsWithEvents[index] = TicketWithEventDetails({
                    ticket: tickets[i],
                    eventDetails: events[tickets[i].eventId]
                });
                index++;
            }
        }

        return matchingTicketsWithEvents;
    }
}
