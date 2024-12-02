"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import EventCard from "@/components/functions/EventCard";
import MintTicketPopup from "@/components/functions/MintTicketPopup";
import {Navbar} from "@/components/functions/Navbar";
import abi, { address } from "../abi";

// Enum to match the Solidity EventType
enum EventType {
  Concert = 0,
  StandupShow = 1,
  SportsEvent = 2,
  // Add other types as needed
}

// Type to match the Event struct in the smart contract
type Event = {
  id: bigint;
  name: string;
  description: string;
  image: string;
  seats: bigint;
  price: bigint;
  location: string;
  startDate: string;
  endDate: string;
  eventType: EventType;
};

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Replace with your actual contract address and ABI
  const {
    data: events,
    isLoading,
    error,
  } = useReadContract({
    address: address, // Replace with actual contract address
    abi: abi, // Replace with your contract ABI
    functionName: "getEventsByType",
    args: [EventType.Concert], // Example: fetching conference events
  });

  console.log(events);

  // Convert BigInt values to more frontend-friendly format
  const processedEvents =
    events?.map((event) => ({
      ...event,
      id: Number(event.id),
      seats: Number(event.seats),
      price: Number(event.price) / 10 ** 18, // Assuming price is in wei, convert to ETH
    })) || [];

  console.log("processedEvents", processedEvents);

  if (isLoading)
    return (
      <main className="min-h-screen p-8 bg-black text-orange-50">
        <Navbar />
        <div className="text-center text-2xl mt-12">Loading events...</div>
      </main>
    );

  if (error)
    return (
      <main className="min-h-screen p-8 bg-black text-orange-50">
        <Navbar />
        <div className="text-center text-2xl mt-12 text-red-500">
          Error loading events: {error.message}
        </div>
      </main>
    );

  return (
    <>
      <Navbar />
      <main className="min-h-screen p-8 bg-black text-orange-50">
        <h1 className="text-4xl font-bold text-orange-500 mb-8">
          NFT Event Dashboard
        </h1>
        {processedEvents.length === 0 ? (
          <div className="text-center text-xl">No events found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedEvents.map((event: any) => (
              <EventCard
                key={event.eventId}
                event={event}
                onMint={() => setSelectedEvent(event)}
              />
            ))}
          </div>
        )}
        {selectedEvent && (
          <MintTicketPopup
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </main>
    </>
  );
}
