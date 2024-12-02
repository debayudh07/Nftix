import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TicketCardProps {
    id: string
    artist: string
    venue: string
    date: string
    price: number
}

export function TicketCard({ id, artist, venue, date, price }: TicketCardProps) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{artist}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-600">{venue}</p>
                <p className="text-sm text-gray-600">{date}</p>
                <p className="text-lg font-bold mt-2">${price.toFixed(2)}</p>
            </CardContent>
            <CardFooter>
                <Button className="w-full">Buy Ticket</Button>
            </CardFooter>
        </Card>
    )
}