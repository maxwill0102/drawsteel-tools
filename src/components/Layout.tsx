import { Link, NavLink, useLocation } from "react-router";
import { useState } from "react";
import { Menu, X, Swords } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Encounter Builder" },
  { to: "/encounter-calculator", label: "Calculator" },
  { to: "/foundry", label: "Foundry VTT" },
  { to: "/vtt", label: "Battle Table" },
  { to: "/dice", label: "Dice" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--ink)]">
      <header className="sticky top-0 z-50 border-b border-[var(--line-soft)] bg-[rgba(11,18,32,0.92)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 min-h-[44px]">
            <Swords className="h-5 w-5 text-[var(--gold)]" />
            <span className="font-display text-sm font-bold tracking-[0.18em] text-[var(--paper)] sm:text-base">
              DRAW STEEL <span className="text-[var(--crimson-soft)]">TOOLS</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded px-3 py-2 text-sm font-medium transition-colors min-h-[44px] flex items-center",
                    isActive
                      ? "text-[var(--gold)]"
                      : "text-[var(--slate)] hover:text-[var(--paper)]",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <Link
                  to="/encounters"
                  className="rounded border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--gold)] hover:bg-[rgba(240,192,64,0.08)] min-h-[44px] flex items-center"
                >
                  My Encounters
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-[var(--slate)] hover:text-[var(--paper)] min-h-[44px] px-2"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded bg-[var(--crimson)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--crimson-soft)] min-h-[44px] flex items-center"
              >
                Sign in
              </Link>
            )}
          </div>

          <button
            className="flex h-11 w-11 items-center justify-center rounded text-[var(--paper)] md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <nav className="border-t border-[var(--line-soft)] bg-[var(--ink-2)] px-4 py-3 md:hidden">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded px-3 py-3 text-base font-medium min-h-[44px]",
                  location.pathname === item.to
                    ? "text-[var(--gold)]"
                    : "text-[var(--slate)]",
                )}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-2 border-t border-[var(--line-soft)] pt-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/encounters"
                    onClick={() => setOpen(false)}
                    className="block rounded px-3 py-3 text-base font-medium text-[var(--gold)] min-h-[44px]"
                  >
                    My Encounters
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="block w-full rounded px-3 py-3 text-left text-base text-[var(--slate)] min-h-[44px]"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded px-3 py-3 text-base font-semibold text-[var(--crimson-soft)] min-h-[44px]"
                >
                  Sign in with Kimi
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--line-soft)] bg-[var(--ink-2)]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="font-display text-sm font-bold tracking-[0.18em]">
                DRAW STEEL <span className="text-[var(--crimson-soft)]">TOOLS</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--slate)]">
                Free tools for Directors running DRAW STEEL — encounter building,
                budgets, dice and battle maps.
              </p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
                Tools
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link className="text-[var(--slate)] hover:text-[var(--paper)]" to="/">Draw Steel encounter builder</Link></li>
                <li><Link className="text-[var(--slate)] hover:text-[var(--paper)]" to="/encounter-calculator">Draw Steel encounter calculator</Link></li>
                <li><Link className="text-[var(--slate)] hover:text-[var(--paper)]" to="/foundry">Draw Steel Foundry module</Link></li>
                <li><Link className="text-[var(--slate)] hover:text-[var(--paper)]" to="/vtt">Draw Steel VTT battle table</Link></li>
                <li><Link className="text-[var(--slate)] hover:text-[var(--paper)]" to="/dice">Draw Steel dice roller</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
                License
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--slate)]">
                Draw Steel Tools is an independent product published under the
                DRAW STEEL Creator License and is not affiliated with MCDM
                Productions, LLC. DRAW STEEL © 2025 MCDM Productions, LLC.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
