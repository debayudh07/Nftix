"use client";
import {
  ArrowRight,
  Film,
  Ticket,
  Shield,
  Zap,
  Gift,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { FlipWords } from "@/components/ui/flip-words";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import WorldMap from "@/components/ui/world-map";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-orange-500 font-sans">
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link className="text-3xl font-bold" href="/">
            NFTix
          </Link>
          <div className="flex items-center space-x-4">
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="#features" className="hover:text-orange-400">
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-it-works"
                    className="hover:text-orange-400 text-center"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#get-started" className="hover:text-orange-400">
                    Get Started
                  </Link>
                </li>
              </ul>
            </nav>

            <ConnectButton
              chainStatus="name"
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
              label="Connect Wallet"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <BackgroundBeamsWithCollision className="justify-start flex">
          <div className="flex">
            <section className="text-left mb-12 w-[50%]">
              <h2 className="text-5xl font-extrabold mb-4">
                Revolutionizing Ticketing with Blockchain
              </h2>
              <p className="text-xl mb-8">
                Secure, transparent, and innovative ticketing experience powered
                by blockchain technology
              </p>
              {/* <WorldMap /> */}
              <Link
                href="/choose"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-black bg-orange-500 hover:bg-orange-600"
              >
                Book Your Tickets Now
                <ArrowRight className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
              </Link>
            </section>
            <section className="justify-end w-[50%] py-20">
              <WorldMap
                dots={[
                  {
                    start: {
                      lat: 64.2008,
                      lng: -149.4937,
                    }, // Alaska (Fairbanks)
                    end: {
                      lat: 34.0522,
                      lng: -118.2437,
                    }, // Los Angeles
                  },
                  {
                    start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
                    end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
                  },
                  {
                    start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
                    end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
                  },
                  {
                    start: { lat: 51.5074, lng: -0.1278 }, // London
                    end: { lat: 28.6139, lng: 77.209 }, // New Delhi
                  },
                  {
                    start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                    end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
                  },
                  {
                    start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                    end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
                  },
                ]}
              />
            </section>
          </div>
        </BackgroundBeamsWithCollision>

        <div className="h-[40rem] flex justify-center items-center px-4">
          <div className="text-4xl mx-auto font-normal text-orange dark:white">
            How It Works:
            <FlipWords words={Steps} />
          </div>
        </div>

        <section id="features" className="mb-16 pt-5">
          <h3 className="text-3xl font-bold mb-8 text-center">Key Features</h3>
          <div className="max-w-5xl mx-auto px-8">
            <HoverEffect items={features} />
          </div>
        </section>
      </main>

      <footer className="bg-orange-900 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p>&copy; 2024 On-Chain Book My Show. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-orange-400">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-orange-400">
              Terms of Service
            </a>
            <a href="#" className="hover:text-orange-400">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="border border-orange-700 rounded-lg p-6 flex flex-col items-center text-center">
      <div className="mb-4">{icon}</div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-orange-300">{description}</p>
    </div>
  );
}

export const features = [
  {
    title: "NFT Tickets",
    description: "Secure, non-transferable tickets issued as soulbound tokens",
    link: "#", // Replace with an actual link if needed.
    icon: <Ticket className="h-8 w-8" />,
  },
  {
    title: "Loyalty Rewards",
    description: "Earn and redeem tokens for exclusive benefits",
    link: "##",
    icon: <Gift className="h-8 w-8" />,
  },
  {
    title: "AI-Powered Chatbot",
    description: "Personalized assistance for bookings and queries",
    link: "###",
    icon: <MessageCircle className="h-8 w-8" />,
  },
];

const Steps = [
  "Browse movies and select your preferred showtime",
  "Choose your seats from the real-time availability chart",
  "Authenticate securely using zkLogin",
  "Complete the payment using cryptocurrency or traditional methods",
  "Receive your NFT ticket with a unique, dynamic QR code",
  "Present your QR code at the theater for entry",
  "Enjoy your movie and collect evolving NFTs as memorabilia",
];
