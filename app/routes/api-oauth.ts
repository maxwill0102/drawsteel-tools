import { serialize } from "cookie";
import type { Route } from "./+types/api-oauth";
import { Session } from "../../contracts/constants";
import { env } from "../../server/lib/env";
import { exchangeAuthCode, verifyAccessToken } from "../../server/kimi/auth";
import { users as kimiUsers } from "../../server/kimi/platform";
import { signSessionToken } from "../../server/kimi/session";
import { getSessionCookieOptions } from "../../server/lib/cookies";
import { upsertUser } from "../../server/queries/users";

const redirect = (location: string, headers?: Headers) =>
  new Response(null, { status: 302, headers: headers ?? { location } });

export async function loader({ request }: Route.LoaderArgs) {
  // OAuth credentials only exist on the Kimi platform deployment.
  if (!env.kimiAuthUrl) {
    return Response.json({ error: "OAuth not configured" }, { status: 404 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    if (error === "access_denied") return redirect("/");
    return Response.json(
      {
        error,
        error_description: url.searchParams.get("error_description"),
      },
      { status: 400 },
    );
  }
  if (!code || !state) {
    return Response.json({ error: "code and state are required" }, { status: 400 });
  }

  try {
    const redirectUri = atob(state);
    const tokenResp = await exchangeAuthCode(code, redirectUri);
    const { userId } = await verifyAccessToken(tokenResp.access_token);
    const userProfile = await kimiUsers.getProfile(tokenResp.access_token);
    if (!userProfile) {
      throw new Error("Failed to fetch user profile from Kimi Open");
    }

    await upsertUser({
      unionId: userId,
      name: userProfile.name,
      avatar: userProfile.avatar_url,
      lastSignInAt: new Date(),
    });

    const token = await signSessionToken({
      unionId: userId,
      clientId: env.appId,
    });

    const opts = getSessionCookieOptions(request.headers);
    const headers = new Headers({ location: "/" });
    headers.append(
      "set-cookie",
      serialize(Session.cookieName, token, {
        httpOnly: true,
        path: "/",
        sameSite: (opts.sameSite ?? "Lax").toLowerCase() as "lax" | "none",
        secure: opts.secure ?? true,
        maxAge: Session.maxAgeMs / 1000,
      }),
    );
    return redirect("/", headers);
  } catch (e) {
    console.error("[OAuth] Callback failed", e);
    return Response.json({ error: "OAuth callback failed" }, { status: 500 });
  }
}
