import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { UserProvider } from "./context/UserContext";
import "./index.css";
import 'katex/dist/katex.min.css';

const googleClientId =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
  "863164045495-rjdd6sp0f71vnu6sug34vtoqretbvnlb.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={googleClientId}>
        <UserProvider>
          <App />
        </UserProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
