"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface Event {
  id: number;
  name: string;
  price: number;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted");
    console.log(`Minting ${quantity} ticket(s) for ${event.name}`);

    // Add your ticket minting logic here in the future

    // Close the popup after submission
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-orange-900 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-orange-300 hover:text-orange-100"
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-2xl font-bold text-orange-300 mb-4">
          Mint Tickets for {event.name}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="bg-orange-800 text-orange-100 border-orange-700"
          />
          <Button
            type="submit"
            className="bg-orange-500 text-black hover:bg-orange-600"
          >
            Mint Tickets
          </Button>
        </form>
        <p className="text-orange-200 mt-4">
          Total Price: {(quantity * event.price).toFixed(2)} ETH
        </p>
      </div>
    </div>
  );
}
