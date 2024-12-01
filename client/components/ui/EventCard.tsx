import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { CalendarIcon, MapPinIcon } from 'lucide-react'

interface Event {
  id: number
  name: string
  description: string
  image: string
  seats: number
  price: number
  location: string
  date: string
}

interface EventCardProps {
  event: Event
  onMint: () => void
}

export default function EventCard({ event, onMint }: EventCardProps) {
  return (
    <div className="bg-orange-900 rounded-lg overflow-hidden">
      <Image 
        src={event.image} 
        alt={event.name} 
        width={300} 
        height={200} 
        className="w-full object-cover h-48"
      />
      <div className="p-6">
        <h2 className="text-2xl font-bold text-orange-300 mb-2">{event.name}</h2>
        <p className="text-orange-100 mb-4">{event.description}</p>
        <div className="flex items-center text-orange-200 mb-2">
          <MapPinIcon className="w-4 h-4 mr-2" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center text-orange-200 mb-4">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span>{event.date}</span>
        </div>
        <div className="flex justify-between items-center text-orange-200 mb-4">
          <span>Available Seats: {event.seats}</span>
          <span>Price: {event.price} ETH</span>
        </div>
        <Button 
          onClick={onMint}
          className="w-full bg-orange-500 text-black hover:bg-orange-600"
        >
          Mint Ticket
        </Button>
      </div>
    </div>
  )
}

