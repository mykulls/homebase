import * as dotenv from "dotenv";
dotenv.config();

import { google } from "googleapis";
import { shell } from "electron";
import Store from "electron-store";
import * as http from "http";
import * as url from "url";

const store = new Store();

const oauth2Client = new google.auth.OAuth2({
  clientId: import.meta.env.MAIN_VITE_GOOGLE_CLIENT_ID,
  clientSecret: import.meta.env.MAIN_VITE_GOOGLE_CLIENT_SECRET,
  redirectUri: "http://localhost:3000/oauth2callback",
});

export async function authenticateWithGoogle(): Promise<string> {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.readonly"],
  });

  // Open browser window to login
  shell.openExternal(authUrl);

  // Listen for redirect callback on localhost
  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (!req.url) return;

      const qs = new url.URL(req.url, "http://localhost:3000").searchParams;
      const code = qs.get("code");
      if (code) resolve(code);
      else {
        server.close();
        reject(new Error("No code found"));
      }

      res.end("You may now close this window");
      server.close();
    });

    server.listen(3000);
  });

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  store.set("googleTokens", tokens);
  return tokens.access_token!;
}

export async function getCalendarEvents(): Promise<any[]> {
  const savedTokens = store.get("googleTokens") as any;
  if (!savedTokens) throw new Error("Not authenticated");

  oauth2Client.setCredentials(savedTokens);
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  console.log(calendar);
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    timeMax: new Date(new Date().setHours(23, 59, 59)).toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  return res.data.items ?? [];
}
