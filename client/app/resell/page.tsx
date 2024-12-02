'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/functions/Navbar'
import { Search } from '@/components/functions/search'
import { TicketCard } from '@/components/functions/ticket-card'
import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import abi, {address} from '../abi'

// Mock data for tickets (will be replaced by contract data)
const tickets = [
    { id: '1', artist: 'Taylor Swift', venue: 'Madison Square Garden', date: '2023-08-15', price: 150 },
    { id: '2', artist: 'Ed Sheeran', venue: 'Wembley Stadium', date: '2023-09-01', price: 120 },
    { id: '3', artist: 'Beyoncé', venue: 'Staples Center', date: '2023-07-30', price: 200 },
    { id: '4', artist: 'Coldplay', venue: 'O2 Arena', date: '2023-10-05', price: 110 },
    { id: '5', artist: 'Adele', venue: 'Radio City Music Hall', date: '2023-11-20', price: 180 },
]

export default function MarketPlace() {
    const [filteredTickets, setFilteredTickets] = useState(tickets)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [resalePrice, setResalePrice] = useState('')
    const [userTickets, setUserTickets] = useState([])
    const account = useAccount();

    // Fetch user tickets using useReadContract
    const { data: contractUserTickets } = useReadContract({
        address: address,
        abi: abi,
        functionName: 'getTicketsByOwner',
        args: [account?.address],
        query: {
            enabled: !!address
        }
    })

    console.log(contractUserTickets)

    // Transform contract data to match the UI requirements
    useEffect(() => {
        if (contractUserTickets) {
            console.log(contractUserTickets)
            const transformedTickets = contractUserTickets.map(ticketDetail => ({
                id: ticketDetail.ticket.ticketId.toString(),
                artist: ticketDetail.eventDetails.name,
                venue: ticketDetail.eventDetails.location,
                date: new Date(Number(ticketDetail.eventDetails.startDate) * 1000).toISOString().split('T')[0],
                price: Number(ticketDetail.ticket.price)
            }))
            setUserTickets(transformedTickets)
        }
    }, [contractUserTickets])

    const handleSearch = (query: string) => {
        const lowercaseQuery = query.toLowerCase()
        const filtered = tickets.filter(
            ticket =>
                ticket.artist.toLowerCase().includes(lowercaseQuery) ||
                ticket.venue.toLowerCase().includes(lowercaseQuery)
        )
        setFilteredTickets(filtered)
    }

    const openDialog = () => setIsDialogOpen(true)
    const closeDialog = () => {
        setIsDialogOpen(false)
        setSelectedTicket(null)
        setResalePrice('')
    }

    const handleSelectTicket = (ticket: any) => setSelectedTicket(ticket)
    const handleResalePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => setResalePrice(e.target.value)

    const handleResell = () => {
        if (selectedTicket && resalePrice) {
            const maxResalePrice = selectedTicket.price * 1.5
            if (parseFloat(resalePrice) > maxResalePrice) {
                alert(`You cannot list for more than $${maxResalePrice.toFixed(2)}ETH`)
                return
            }
            // TODO: Implement actual resell logic using smart contract
            alert(`Ticket listed for resale at $${resalePrice}`)
            closeDialog()
        }
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-6 flex justify-between items-center">
                        <Search onSearch={handleSearch} />
                        <button
                            onClick={openDialog}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredTickets.map(ticket => (
                            <TicketCard key={ticket.id} {...ticket} />
                        ))}
                    </div>
                </div>
            </main>

            {isDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg w-96 p-6">
                        <h2 className="text-xl font-semibold mb-4">Select a Ticket to Resell</h2>
                        <div className="max-h-64 overflow-y-auto">
                            {userTickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    onClick={() => handleSelectTicket(ticket)}
                                    className={`p-4 mb-2 border rounded cursor-pointer {
                                        selectedTicket?.id === ticket.id
                                            ? 'bg-blue-100 border-blue-400'
                                            : 'hover:bg-gray-100'
                                    }ETH`}
                                >
                                    <p className="font-bold">{ticket.artist}</p>
                                    <p>{ticket.venue}</p>
                                    <p>{ticket.date}</p>
                                </div>
                            ))}
                        </div>
                        {selectedTicket && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold">Resell Details</h3>
                                <p>Original Price: {selectedTicket.price / 10 ** 18} ETH</p>
                                <p>Max Price: {selectedTicket.price * 1.5 / 10 ** 18} ETH</p>
                                <input
                                    type="number"
                                    placeholder="Enter resale price"
                                    value={resalePrice}
                                    onChange={handleResalePriceChange}
                                    className="mt-2 border p-2 w-full rounded"
                                />
                            </div>
                        )}
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={closeDialog}
                                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResell}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Resell
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}