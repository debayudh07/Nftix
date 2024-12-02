"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { type State, WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
  connectorsForWallets,
  midnightTheme,
} from "@rainbow-me/rainbowkit";
import {
  rainbowWallet,
  walletConnectWallet,
  coreWallet,
  ledgerWallet,
  metaMaskWallet,
  argentWallet,
  omniWallet,
  imTokenWallet,
  coinbaseWallet,
} from "@rainbow-me/rainbowkit/wallets";



import { GoogleOAuthProvider } from "@react-oauth/google";
import { OktoProvider, BuildType } from "okto-sdk-react";
import { useTheme } from "next-themes";

import { getConfig } from "./wagmi";

coinbaseWallet.preference = "smartWalletOnly";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        rainbowWallet,
        walletConnectWallet,
        coreWallet,
        metaMaskWallet,
        coinbaseWallet,
      ],
    },
    {
      groupName: "Other",
      wallets: [ledgerWallet, argentWallet, omniWallet, imTokenWallet],
    },
  ],
  {
    appName: "My RainbowKit App",
    projectId: "YOUR_PROJECT_ID",
  }
);

export default function Providers(props: {
  children: ReactNode;
  initialState?: State;
}) {
  const { theme } = useTheme();
  const [config] = useState(() => getConfig(connectors));
  const [queryClient] = useState(() => new QueryClient());

  const selectedTheme = lightTheme({
    accentColor: "rgb(23 37 84)",
    accentColorForeground: "white",
    borderRadius: "small",
    fontStack: "system",
    overlayBlur: "small",
  });

  return (
    <WagmiProvider config={config} initialState={props.initialState}>
      <QueryClientProvider client={queryClient}>
        {/* <RainbowKitProvider
          initialChain={1320}
          theme={selectedTheme}
          coolMode
          modalSize="wide"
        >
          {props.children}
        </RainbowKitProvider> */}
        <GoogleOAuthProvider clientId="57770701043-v5tilj9h8eej88m22ijhnohp6vmffbb9.apps.googleusercontent.com">
          <OktoProvider
            apiKey="ec9d3f81-6659-479f-ba2c-070dc66bf334"
            buildType={BuildType.SANDBOX}
          >
            {props.children}
          </OktoProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
