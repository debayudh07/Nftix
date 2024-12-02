"use client";
import React, { useState, useEffect } from "react";
import { useOkto } from "okto-sdk-react";
import { GoogleLogin } from "@react-oauth/google";

function LoginPage() {
    const { authenticate, createWallet, getWallets } = useOkto();
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
    useEffect(() => {
        createWallet()
            .then((result) => {
                setWallets(result);
            })
            .catch((error) => {
                console.error("Create wallet error:", error);
            });
    }, [createWallet]);

    // Function to handle new wallet creation
    const handleCreateWallet = async () => {
        try {
            const newWallet = await createWallet();
            setWallets((prevWallets) => ({
                wallets: [...prevWallets.wallets, ...newWallet.wallets],
            }));
            console.log("New Wallet Created:", newWallet);
        } catch (error) {
            console.error("Error creating new wallet:", error);
        }
    };

    return (
        <div>
            <h1>Login</h1>
            {!authToken ? (
                <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={(error) => console.error("Login Failed", error)}
                />
            ) : (
                <p>Authenticated</p>
            )}

            <button
                onClick={() => {
                    getWallets()
                        .then((result) => {
                            console.log("Wallets:", result.wallets);
                            setWallets(result);
                        })
                        .catch((error) => {
                            console.error("Get wallets error:", error);
                        });
                }}
            >
                Get Wallets
            </button>

            <button onClick={handleCreateWallet}>
                Create New Wallet
            </button>

            {wallets.length > 0 && (
                <div>
                    <h2>Wallets</h2>
                    <p>{wallets}</p>
                </div>
            )}
        </div>
    );
}

export default LoginPage;
