import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  return (
    <header className="py-2 px-4 sm:px-6 lg:px-8 bg-black text-orange-500">
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
                <Link href="#how-it-works" className="hover:text-orange-400">
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
  );
}
