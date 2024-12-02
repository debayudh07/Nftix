"use client";

import React from "react";
import { useReadContract, useAccount } from "wagmi";
import abi, { address } from "../abi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Ticket } from "lucide-react";

interface Ticket {
    id: number;
    eventName: string;
    date: number;
    venue: string;
    seat: string;
}

function Profile() {
    const account = useAccount();
    const [ticketsArray, setTicketsArray] = React.useState([]);
    const { data: tickets, isLoading, error } = useReadContract({
        address: address,
        abi: abi,
        functionName: "getTicketsByOwner",
        args: [account.address],
    });

    // console.log(tickets[0]);
    console.log(`tickets: ${tickets}`);
    console.log(`${tickets?.map((ticket: any) => ticket.owner)}`);
    // console.log("tickets", tickets);
    // console.log(`tickets.isArray: ${Array.isArray(tickets)}`);
    // setTicketsArray(Array.isArray(tickets));

    if (isLoading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState error={error} />;
    }

    // Safely handle tickets data
    // const ticketArray =
    //     Array.isArray(tickets) ||
    //     (tickets && typeof tickets === "object" && "length" in tickets && typeof tickets.length === "number")
    //         ? Array.from(tickets)
    //         : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center">
                <Ticket className="mr-2 h-8 w-8" />
                Your Booked Tickets
            </h1>
            {tickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map((ticket: any, index: number) => (
                        <TicketCard key={index} ticket={ticket} />
                    ))}
                </div>
            ) : (
                <Alert>
                    <Ticket className="h-4 w-4" />
                    <AlertTitle>No tickets found</AlertTitle>
                    <AlertDescription>
                        You haven't booked any tickets yet. Why not explore some events?
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}

function TicketCard({ ticket }: { ticket: any }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Ticket className="mr-2 h-5 w-5" />
                    {ticket.eventName}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>
                    <strong>Date:</strong>{" "}
                    {new Date(ticket.date * 1000).toLocaleDateString()}
                </p>
                <p>
                    <strong>Venue:</strong> {ticket.venue}
                </p>
                <p>
                    <strong>Seat:</strong> {ticket.seat}
                </p>
            </CardContent>
        </Card>
    );
}

function LoadingState() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center">
                <Ticket className="mr-2 h-8 w-8" />
                Your Booked Tickets
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <Skeleton className="h-4 w-[250px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-[200px] mb-2" />
                            <Skeleton className="h-4 w-[150px] mb-2" />
                            <Skeleton className="h-4 w-[100px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function ErrorState({ error }: { error: any }) {
    return (
        <div className="container mx-auto px-4 py-8">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error.message ||
                        "An error occurred while fetching your tickets. Please try again later."}
                </AlertDescription>
            </Alert>
        </div>
    );
}

export default Profile;
