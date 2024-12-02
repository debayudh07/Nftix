"use client";
import React, { useState, useEffect } from "react";
import { useOkto } from "okto-sdk-react";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";

export function OktoConnect() {
    const { authenticate, createWallet, getWallets, showWidgetModal, closeModal } = useOkto();
    const [authToken, setAuthToken] = useState(null);
    const [wallets, setWallets] = useState([]);

    const handleGoogleLogin = async (credentialResponse) => {
        const idToken = credentialResponse.credential;
        console.log("Received Google ID token:", idToken);
        authenticate(idToken, (authResponse, error) => {
            if (authResponse) {
                setAuthToken(authResponse.auth_token);
                console.log(
                    "Authenticated successfully, auth token:",
                    authResponse.auth_token
                );
            } else if (error) {
                console.error("Authentication error:", error);
            }
        });
    };
    // Fetch wallets on component mount
    function makeWallet() {
        createWallet()
            .then((result) => {
                setWallets(result);
            })
            .catch((error) => {
                console.error("Create wallet error:", error);
            });
    };

    return (
        <div>
            {!authToken ? (
                <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={(error) => console.error("Login Failed", error)}
                />
            ) : (
                <Button onClick={() => {
                    showWidgetModal();
                    makeWallet();
                    getWallets().then((result) => {
                           console.log("Wallets:", result.wallets);
                           setWallets(result);
                        })
                        .catch((error) => {
                            console.error("Get wallets error:", error);
                        });                   
                }}>
                    OKTO WALLET
                    <p onClick={()=>closeModal()}>X</p>
                </Button>
            )}

            {/* <button
                onClick={() => {
                    getWallets()
                           console.log("Wallets:", result.wallets);
                          .then((result) => {
                           setWallets(result);
                        })
                        .catch((error) => {
                            console.error("Get wallets error:", error);
                        });
                }}
            >
                Get Wallets
            </button> */}
        </div>
    );
}
