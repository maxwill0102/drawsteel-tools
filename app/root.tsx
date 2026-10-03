import type { LinksFunction, MetaFunction } from "react-router";
import {
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Toaster } from "sonner";
import { TRPCProvider } from "@/providers/trpc";
import "../src/index.css";

// Normalize trailing slashes: /foo/ 301-redirects to /foo, so only one
// URL form of every page is ever indexable (duplicate-content guard).
export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    throw redirect(url.pathname.slice(0, -1) + url.search, 301);
  }
  return null;
}

export const links: LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap",
  },
];

export const meta: MetaFunction = () => [
  {
    name: "description",
    content:
      "Free Draw Steel tools: encounter builder, EV calculator, battle table and dice roller. Official rules math, no signup.",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <TRPCProvider>
      <Outlet />
      <Toaster theme="dark" position="bottom-right" />
    </TRPCProvider>
  );
}
