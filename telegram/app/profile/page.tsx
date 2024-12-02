"use client";

import React, { useState } from "react";
import { useReadContract, useAccount } from "wagmi";
import abi, { address } from "../abi";
import QRCode from "react-qr-code";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

function Profile() {
    const account = useAccount();
    const { data: tickets, isLoading, error } = useReadContract({
        address: address,
        abi: abi,
        functionName: "getTicketsByOwner",
        args: [account.address],
    });

    if (isLoading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState error={error} />;
    }

    // Ensure tickets is an array before mapping
    const ticketArray = Array.isArray(tickets) ? tickets : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center">
                <Ticket className="mr-2 h-8 w-8" />
                Your Booked Tickets
            </h1>
            {ticketArray.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ticketArray.map((ticketData: any, index: number) => (
                        <TicketCard key={index} ticketData={ticketData} />
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

function TicketCard({ ticketData }: { ticketData: any }) {
    const { ticket, eventDetails } = ticketData;
    const [isDialogOpen, setDialogOpen] = useState(false);

    // Prepare data for the QR code
    const qrData = {
        eventName: eventDetails.name,
        date: new Date(Number(eventDetails.startDate) * 1000).toISOString(),
        venue: eventDetails.location,
        seatNumbers: ticket.seatNumbers,
        price: (Number(ticket.price) / 1e18).toFixed(3), // Convert price from Wei to ETH
    };

    // Serialize `qrData` with a custom replacer to handle BigInt
    const qrValue = JSON.stringify(qrData, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Ticket className="mr-2 h-5 w-5" />
                    {eventDetails.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>
                    <strong>Date:</strong>{" "}
                    {new Date(Number(eventDetails.startDate) * 1000).toLocaleDateString()}
                </p>
                <p>
                    <strong>Venue:</strong> {eventDetails.location}
                </p>
                <p>
                    <strong>Seat:</strong> {ticket.seatNumbers.join(", ")}
                </p>
                <p>
                    <strong>Price:</strong>{" "}
                    {parseFloat((Number(ticket.price) / 1e18).toFixed(3))} ETH
                </p>
                <div className="mt-4">
                    <Button onClick={() => setDialogOpen(true)}>Generate QR</Button>
                </div>
                {isDialogOpen && (
                    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>QR Code for {eventDetails.name}</DialogTitle>
                            </DialogHeader>
                            <div className="flex justify-center mt-4">
                                <QRCode
                                    value={qrValue}
                                    size={200}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
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
