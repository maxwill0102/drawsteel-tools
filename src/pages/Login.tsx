import { Swords } from "lucide-react";
import Layout from "@/components/Layout";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <Layout>
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-lg border border-[var(--line-soft)] bg-[var(--ink-2)] p-8 text-center">
          <Swords className="mx-auto h-8 w-8 text-[var(--gold)]" />
          <h1 className="mt-4 font-display text-2xl font-bold">Director's Account</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--slate)]">
            Sign in to keep a library of saved encounters across devices. The
            tools themselves never require an account.
          </p>
          <button
            className="mt-6 h-12 w-full rounded bg-[var(--crimson)] text-sm font-semibold text-white hover:bg-[var(--crimson-soft)]"
            onClick={() => {
              window.location.href = getOAuthUrl();
            }}
          >
            Sign in with Kimi
          </button>
        </div>
      </div>
    </Layout>
  );
}
