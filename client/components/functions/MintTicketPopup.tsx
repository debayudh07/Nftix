"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useWriteContract, useAccount } from "wagmi";
import abi, { address } from "@/app/abi";

// Utility function for safe BigInt conversion
function safeBigInt(input: any): bigint {
  try {
    // Log the input for debugging
    console.log('Input for BigInt conversion:', input, typeof input);

    // Handle different input types
    if (typeof input === 'bigint') return input;
    if (typeof input === 'number') {
      // Ensure it's a safe integer
      if (!Number.isFinite(input)) {
        console.error('Invalid number for BigInt conversion:', input);
        return BigInt(0);
      }
      return BigInt(Math.floor(input));
    }
    if (typeof input === 'string') {
      // Try parsing the string
      const parsed = parseFloat(input);
      if (!Number.isFinite(parsed)) {
        console.error('Invalid string for BigInt conversion:', input);
        return BigInt(0);
      }
      return BigInt(Math.floor(parsed));
    }

    // Fallback for unexpected types
    console.error('Unsupported type for BigInt conversion:', typeof input);
    return BigInt(0);
  } catch (error) {
    console.error('BigInt conversion error:', error);
    return BigInt(0);
  }
}

interface Event {
  eventId: number | bigint | string;
  id: number | bigint | string;
  name: string;
  price: number | string;
  totalTickets: number | bigint;
}

interface MintTicketPopupProps {
  event: Event;
  onClose: () => void;
}

export default function MintTicketPopup({
  event,
  onClose,
}: MintTicketPopupProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address: userAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userAddress) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);

      // Extensive logging of event details
      console.log('Event details:', {
        id: event.id,
        iid: event.eventId,
        name: event.name,
        price: event.price,
        totalTickets: event.totalTickets
      });

      // Safe price calculation
      const priceNum = typeof event.price === 'string'
        ? parseFloat(event.price)
        : event.price;

      if (!Number.isFinite(priceNum)) {
        throw new Error(`Invalid price: ${event.price}`);
      }

      const totalPrice = priceNum * quantity;
      const convenienceFee = (totalPrice * 0.03);
      const totalPriceWithFee = totalPrice + convenienceFee;

      // Safe BigInt conversion for price in wei
      const priceInWei = (() => {
        try {
          // Multiply by 10^18 and use BigInt
          return BigInt(Math.floor(totalPriceWithFee * 10 ** 18));
        } catch (conversionError) {
          console.error('Price to Wei conversion error:', conversionError);
          throw new Error('Failed to convert price to Wei');
        }
      })();

      // Safe event ID conversion
      const eventId = safeBigInt(event.eventId);

      // Generate seat numbers as BigInt array
      const seatNumbers = Array.from(
        { length: quantity },
        (_, i) => BigInt(i)
      );

      // Detailed logging before contract call
      console.log('Contract call parameters:', {
        eventId,
        seatNumbers,
        priceInWei: priceInWei.toString()
      });

      // Call contract function
      const result = await writeContractAsync({
        address: address,
        abi: abi,
        functionName: 'bookTicket',
        args: [eventId, seatNumbers],
        value: priceInWei,
      });

      console.log(`Successfully minted ${quantity} ticket(s) for ${event.name}`, result);

      onClose();
    } catch (error) {
      // Comprehensive error logging
      console.error('Full error details:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      });

      // User-friendly error message
      if (error instanceof Error) {
        setError(`Ticket minting failed: ${error.message}`);
      } else {
        setError("An unexpected error occurred during ticket minting");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Safe total price calculation
  const calculateTotalPrice = () => {
    // Ensure event price is a number
    const priceNum = typeof event.price === 'string' 
      ? parseFloat(event.price) 
      : event.price;
    
    // Calculate total ticket price
    const totalTicketPrice = priceNum * quantity;
    
    // Calculate convenience fee (3%)
    const convenienceFee = totalTicketPrice * 0.03;
    
    // Total price including fee
    const totalPrice = totalTicketPrice + convenienceFee;
    
    return Number.isFinite(totalPrice) 
      ? totalPrice.toFixed(2) 
      : "0.00";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-orange-900 rounded-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-orange-300 hover:text-orange-100">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-2xl font-bold text-orange-300 mb-4">
          Mint Tickets for {event.name}
        </h3>
        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="number"
            min="1"
            max={10} // Simplified for debugging
            value={quantity}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              setQuantity(Number.isNaN(parsed) ? 1 : Math.max(1, Math.min(parsed, 10)));
            }}
            className="bg-orange-800 text-orange-100 border-orange-700"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-orange-500 text-black hover:bg-orange-600 disabled:opacity-50"
          >
            {isLoading ? 'Minting...' : 'Mint Tickets'}
          </Button>
        </form>
        <p className="text-orange-200 mt-4">
          Total Price: {calculateTotalPrice()} ETH
        </p>
      </div>
    </div>
  );
}