import { ConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

export const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexAppProvider({ children }: { children: React.ReactNode }) {
  if (!convexClient) return <>{children}</>;
  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
}
