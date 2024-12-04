"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import EventCard from "@/components/functions/EventCard";
import MintTicketPopup from "@/components/functions/MintTicketPopup";
import { Navbar } from "@/components/functions/Navbar";
import abi, { address } from "../abi";

// Enum to match the Solidity EventType
enum EventType {
  Concert = 0,
  StandupShow = 1,
  SportsEvent = 2,
  // Add other types as needed
}

// Type to match the Event struct in the smart contract
interface Event {
  id: bigint;
  eventId: bigint;
  name: string;
  description: string;
  image: string;
  seats: bigint;
  price: bigint;
  location: string;
  startDate: string;
  endDate: string;
  eventType: EventType;
  soldTickets: bigint;
  totalTickets: bigint;
}

// Processed Event type for frontend
interface ProcessedEvent extends Omit<Event, 'id' | 'seats' | 'price' | 'soldTickets' | 'totalTickets' | 'eventId'> {
  id: number;
  eventId: number;
  seats: number;
  price: number;
  soldTickets: number;
  totalTickets: number;
}

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<ProcessedEvent | null>(null);

  // Event processing function
  const processEvent = (event: Event): ProcessedEvent => ({
    ...event,
    id: Number(event.id),
    eventId: Number(event.eventId),
    seats: Number(event.seats),
    price: Number(event.price) / 10 ** 18, // Convert from wei to ETH
    soldTickets: Number(event.soldTickets),
    totalTickets: Number(event.totalTickets),
  });

  // Improved type definitions for useReadContract
  const {
    data: rawEvents,
    isLoading,
    error,
  } = useReadContract({
    address: address,
    abi: abi,
    functionName: "getEventsByType",
    args: [EventType.Concert],
  });

  // Process events using useMemo to memoize the result
  const processedEvents = useMemo(() => {
    if (!rawEvents || !Array.isArray(rawEvents)) return [];
    return (rawEvents as Event[]).map(processEvent);
  }, [rawEvents]);

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
          Error loading events: {error instanceof Error ? error.message : String(error)}
        </div>
      </main>
    );

  return (
    <>
      <Navbar />
      <main className="min-h-screen p-8 bg-black text-orange-50">
        {processedEvents.length === 0 ? (
          <div className="text-center text-xl">No events found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedEvents.map((event) => (
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