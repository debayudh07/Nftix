import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { OktoConnect } from "@/components/functions/OktoConnect";

export function Navbar() {
  return (
    <header className="py-2 px-4 sm:px-6 lg:px-8 bg-black text-orange-500">
      <div className="flex justify-between items-center">
        <Link className="text-3xl font-bold" href="/">
          NFTix
        </Link>
        <div className="flex items-center space-x-8">
          <nav>
            <ul className="flex space-x-8 text-lg">
              <li>
                <Link href="/listevent" className="hover:text-orange-400">
                  Listing
                </Link>
              </li>
              <li>
                <Link href="/resell" className="hover:text-orange-400">
                  Resell
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-orange-400">
                  Profile
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
          <OktoConnect />
        </div>
      </div>
    </header>
  );
}
