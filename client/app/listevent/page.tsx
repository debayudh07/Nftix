'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWriteContract, useAccount } from 'wagmi'
import abi, { address } from '../abi'

export default function EventListingForm() {
    const { writeContractAsync } = useWriteContract()
    const account = useAccount()

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        type: '',
        startDate: '',
        endDate: '',
        totalTickets: '',
        price: '',
        location: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string) => (value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
    
        try {
            // Check if wallet is connected
            if (!account.address) {
                console.error('Wallet not connected')
                alert('Please connect your wallet')
                return
            }
    
            console.log('Creating event:', formData)
    
            // Convert price to smallest unit (assuming ETH, so multiply by 10^18)
            const priceInWei = BigInt(parseFloat(formData.price) * 10 ** 18)
            const unixStartDate = Math.floor(new Date(formData.startDate).getTime() / 1000)
            const unixEndDate = Math.floor(new Date(formData.endDate).getTime() / 1000)
    
            // Map string type to enum value
            const eventTypeMap: { [key: string]: number } = {
                'concert': 0,
                'standupshow': 1,
                'sportsevent': 2
            }
    
            const eventType = eventTypeMap[formData.type.toLowerCase().replace(/\s/g, '')]
    
            if (eventType === undefined) {
                throw new Error(`Invalid event type: ${formData.type}`)
            }
    
            const tx = await writeContractAsync({
                address: address,
                abi: abi,
                functionName: "createEvent",
                args: [
                    priceInWei, // price in wei
                    BigInt(formData.totalTickets), // total tickets
                    unixStartDate, // start date
                    unixEndDate, // end date
                    eventType, // event type (as numeric enum value)
                    formData.name, // event name
                    formData.description, // description
                    formData.location, // location
                    formData.image, // image URL
                ],
            })
    
            console.log('Transaction successful:', tx)
            alert('Event created successfully!')
        } catch (error: any) {
            console.error('Transaction failed:', error)
            alert(`Transaction failed: ${error.message}`)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4" style={{ color: 'white' }}>
            <Card className="w-full max-w-2xl border-none" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 0 15px rgba(255, 165, 0, 0.5)'
            }}>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-white">Event Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="bg-white/10 border-orange-500/50 text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="description" className="text-white">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="bg-white/10 border-orange-500/50 text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="image" className="text-white">Image URL</Label>
                            <Input
                                id="image"
                                name="image"
                                type="url"
                                value={formData.image}
                                onChange={handleChange}
                                className="bg-white/10 border-orange-500/50 text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="type" className="text-white">Event Type</Label>
                            <Select
                                name="type"
                                value={formData.type}
                                onValueChange={handleSelectChange('type')}
                            >
                                <SelectTrigger className="bg-white/10 border-orange-500/50 text-white">
                                    <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="concert">Concert</SelectItem>
                                    <SelectItem value="sports">Sports</SelectItem>
                                    <SelectItem value="standup">Stand-up Comedy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="startDate" className="text-white">Start Date</Label>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="bg-white/10 border-orange-500/50 text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="endDate" className="text-white">End Date</Label>
                            <Input
                                id="endDate"
                                name="endDate"
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="bg-white/10 border-orange-500/50 text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="totalTickets" className="text-white">Total Tickets</Label>
                            <Input
                                id="totalTickets"
                                name="totalTickets"
                                type="number"
                                value={formData.totalTickets}
                                onChange={handleChange}
                                className="bg-white/10 border-orange-500/50 text-white"
                                required
                                min="1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="price" className="text-white">Ticket Price (ETH)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.001"
                                value={formData.price}
                                onChange={handleChange}
                                className="bg-white/10 border-orange-500/50 text-white"
                                required
                                min="0"
                            />
                        </div>
                        <div>
                            <Label htmlFor="location" className="text-white">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="bg-white/10 border-orange-500/50 text-white"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Submit Event
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}