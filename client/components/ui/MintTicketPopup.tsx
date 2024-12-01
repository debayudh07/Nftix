'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

interface Event {
  id: number
  name: string
  price: number
}

interface MintTicketPopupProps {
  event: Event
  onClose: () => void
}

export default function MintTicketPopup({ event, onClose }: MintTicketPopupProps) {
  const [quantity, setQuantity] = useState(1)
  const [isMinting, setIsMinting] = useState(false)

  const handleMint = () => {
    setIsMinting(true)
    // Simulate minting process
    setTimeout(() => {
      setIsMinting(false)
      alert(`Successfully minted ${quantity} ticket(s) for ${event.name}!`)
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-orange-900 rounded-lg p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-orange-300 hover:text-orange-100"
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-2xl font-bold text-orange-300 mb-4">Mint Tickets for {event.name}</h3>
        <div className="flex gap-4 mb-4">
          <Input 
            type="number" 
            min="1" 
            value={quantity} 
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="bg-orange-800 text-orange-100 border-orange-700"
          />
          <Button 
            onClick={handleMint} 
            disabled={isMinting}
            className="bg-orange-500 text-black hover:bg-orange-600"
          >
            {isMinting ? 'Minting...' : 'Mint Tickets'}
          </Button>
        </div>
        <p className="text-orange-200">Total Price: {(quantity * event.price).toFixed(2)} ETH</p>
      </div>
    </div>
  )
}

