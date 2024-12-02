import { Metadata } from "next";
import BookingCards from "@/components/ui/BookingCards";
import { Navbar } from "@/components/functions/Navbar";

export const metadata: Metadata = {
  title: "Interactive Ticket Booking",
  description: "Book tickets for Concerts, Sports, and Stand-Up Comedy events",
};

export default function Choose() {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
            Choose Your Event
          </h1>
          <BookingCards />
        </div>
      </main>
    </>
  );
}
