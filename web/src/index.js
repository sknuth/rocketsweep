import CssBaseline from "@mui/material/CssBaseline";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { WagmiConfig, configureChains, createClient } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import { mainnet } from "wagmi/chains";
import { InjectedConnector } from "wagmi/connectors/injected";
import { SafeConnector } from "wagmi/connectors/safe";

import App from "./App";
import { ThemeModeProvider } from "./theme";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const walletConnectProjectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID;

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet],
  [
    alchemyKey &&
      jsonRpcProvider({
        rpc: () => ({
          http: `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`,
          webSocket: `wss://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`,
        }),
      }),
    jsonRpcProvider({
      rpc: () => ({
        http: "https://cloudflare-eth.com",
      }),
    }),
    publicProvider(),
  ].filter(Boolean)
);
const queryClient = new QueryClient();
const wagmiClient = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
  connectors: [
    new SafeConnector({
      chains,
      options: {
        allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
        debug: false,
      },
    }),
    new InjectedConnector({
      chains,
    }),
    walletConnectProjectId &&
      new WalletConnectConnector({
        chains,
        options: {
          projectId: walletConnectProjectId,
        },
      }),
  ].filter(Boolean),
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiConfig client={wagmiClient}>
        <ThemeModeProvider>
          <CssBaseline />
          <App />
        </ThemeModeProvider>
      </WagmiConfig>
      <ReactQueryDevtools position="bottom-right" />
    </QueryClientProvider>
  </React.StrictMode>
);
