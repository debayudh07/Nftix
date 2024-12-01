'use client'

import { useState } from 'react'
import EventCard from '@/components/ui/EventCard'
import MintTicketPopup from '@/components/ui/MintTicketPopup'
type Event = {
  id: number;
  name: string;
  description: string;
  image: string;
  seats: number;
  price: number;
  location: string;
  date: string;
};

const events: Event[] = [
  {
    id: 1,
    name: "Crypto Conference 2023",
    description: "Join us for the biggest blockchain event of the year!",
    image: "/placeholder.svg?height=200&width=300",
    seats: 1000,
    price: 0.1,
    location: "Crypto Arena, Los Angeles, CA",
    date: "2023-12-15"
  },
  {
    id: 2,
    name: "NFT Art Exhibition",
    description: "Explore the future of digital art with top NFT artists.",
    image: "/placeholder.svg?height=200&width=300",
    seats: 500,
    price: 0.05,
    location: "Digital Gallery, New York, NY",
    date: "2023-11-20"
  },
  {
    id: 3,
    name: "DeFi Summit 2024",
    description: "Learn about the latest trends in decentralized finance.",
    image: "/placeholder.svg?height=200&width=300",
    seats: 750,
    price: 0.08,
    location: "Finance Center, Miami, FL",
    date: "2024-01-10"
  }
]

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  return (
    <main className="min-h-screen p-8 bg-black text-orange-50">
      <h1 className="text-4xl font-bold text-orange-500 mb-8">NFT Event Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            onMint={() => setSelectedEvent(event)}
          />
        ))}
      </div>
      {selectedEvent && (
        <MintTicketPopup 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </main>
  )
}

