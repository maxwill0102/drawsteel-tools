import "dotenv/config";

function optional(name: string): string {
  return process.env[name] ?? "";
}

// On the Kimi platform these are injected automatically.
// On Vercel/self-hosted, set DATABASE_URL yourself; the Kimi OAuth
// variables stay empty and sign-in is disabled in the UI.
export const env = {
  appId: optional("APP_ID"),
  appSecret: optional("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: optional("DATABASE_URL"),
  kimiAuthUrl: optional("KIMI_AUTH_URL"),
  kimiOpenUrl: optional("KIMI_OPEN_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
};
