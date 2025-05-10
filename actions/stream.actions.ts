"use server";

import { StreamClient } from "@stream-io/node-sdk";

const apiKey = "hjqx8fuvvdw5";
const apiSecret = "pkcppqadkb8h4rw7am742ehdjf6hdkvt65382g6v73rsu86xz3xn9tgupzkmk9m5";

if (!apiKey || !apiSecret) {
  throw new Error("Stream API key or secret is missing. Please set STREAM_API_KEY and STREAM_API_SECRET in .env.local");
}

export const tokenProvider = async (userId: string = "ali") => {
  const client = new StreamClient(apiKey, apiSecret);

  // Upsert user (create or update)
  await client.upsertUsers([
    {
      id: userId,
      name: userId, // Use userId as name for simplicity, or customize
      role: "user",
    },
  ]);

  // Generate token with 1-hour expiration
  const exp = Math.round(new Date().getTime() / 1000) + 60 * 60; // 1 hour from now
  const issued = Math.floor(Date.now() / 1000) - 60; // 1 minute ago
  const token = client.createToken(userId, exp, issued);

  return token;
};