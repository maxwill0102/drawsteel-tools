import { Link } from "react-router";
import { Package, Download, Terminal, BookOpen } from "lucide-react";
import Layout from "@/components/Layout";

const STEPS = [
  {
    icon: Package,
    title: "Install a Draw Steel system or module",
    body: "In Foundry VTT, open Add-on Modules → Install Module and search for a Draw Steel community module, or paste a manifest URL from the community. The Draw Steel community maintains data packs covering monsters and rules released under the Creator License.",
  },
  {
    icon: Download,
    title: "Import your encounter JSON",
    body: "Build your encounter in the Draw Steel encounter builder, hit Export JSON, and hand it to your module's importer (or keep it open as a reference card during play). Names, counts, levels and EV totals transfer directly.",
  },
  {
    icon: Terminal,
    title: "Place tokens and set the scene",
    body: "Drop your monsters on a scene with cover and elevation — Draw Steel battles shine with vertical maps, ledges and dynamic terrain objects. Budget one or two terrain objects into standard fights, two or three into hard ones.",
  },
  {
    icon: BookOpen,
    title: "Track Malice at the table",
    body: "At the start of each round you gain Malice equal to the number of heroes plus the round number. Use the battle table on this site alongside Foundry if you want a fast shared reference for Malice and initiative groups.",
  },
];

export default function Foundry() {
  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--crimson-soft)]">
          Setup guide
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-5xl">
          Draw Steel for Foundry VTT
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--slate)]">
          Run your Draw Steel encounters on a full virtual tabletop. This guide
          walks through getting Draw Steel content into Foundry VTT and pairing
          it with encounters you build here.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="rounded-lg border border-[var(--line-soft)] bg-[var(--ink-2)] p-6"
            >
              <div className="flex items-center gap-3">
                <span className="font-num text-4xl text-[var(--crimson-soft)]">{i + 1}</span>
                <s.icon className="h-5 w-5 text-[var(--gold)]" />
              </div>
              <h2 className="mt-3 font-display text-lg font-bold">{s.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--slate)]">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-[var(--line)] bg-[var(--ink-3)] p-6">
          <h2 className="font-display text-xl font-bold">Build first, then import</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--slate)]">
            The fastest workflow: assemble your encounter in the{" "}
            <Link to="/" className="text-[var(--gold)] underline">Draw Steel encounter builder</Link>,
            verify the budget in the{" "}
            <Link to="/encounter-calculator" className="text-[var(--gold)] underline">encounter calculator</Link>,
            export the JSON, and only then open Foundry. Your math is done
            before the session starts — the VTT is just the stage.
          </p>
        </div>

        <h2 className="mt-12 font-display text-2xl font-bold">Foundry VTT FAQ</h2>
        <div className="mt-6 space-y-3">
          {[
            {
              q: "Is there an official Draw Steel Foundry module?",
              a: "MCDM and the community publish Draw Steel support for virtual tabletops under the Creator License. Check Foundry's module browser and the official Draw Steel Discord for the current community modules — the ecosystem moves fast.",
            },
            {
              q: "Can I use the monster data from this site in Foundry?",
              a: "Yes. Every encounter you build here exports as clean JSON with names, levels, organizations, roles, EV and Stamina — the fields a Foundry importer or journal reference needs.",
            },
            {
              q: "Do I need Foundry to play Draw Steel online?",
              a: "No. For lightweight sessions you can run the whole fight in your browser with the battle table on this site — tokens, grid, Malice and round tracking included.",
            },
          ].map((f) => (
            <details
              key={f.q}
              className="group rounded-lg border border-[var(--line-soft)] bg-[var(--ink-2)] px-5 py-4 open:border-[var(--line)]"
            >
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between text-sm font-semibold leading-6">
                {f.q}
                <span className="ml-4 text-[var(--gold)] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-2 pt-1 text-sm leading-6 text-[var(--slate)]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </Layout>
  );
}
