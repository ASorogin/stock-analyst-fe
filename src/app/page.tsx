import { redirect } from "next/navigation";

export default function RootPage() {
  // TODO: once auth exists, send signed-out users to /login and signed-in
  // users to /dashboard. For now, always go to the dashboard.
  redirect("/dashboard");
}