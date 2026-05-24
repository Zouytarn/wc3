import type { Metadata } from "next";
import BuilderEditor from "@/components/builder/BuilderEditor";

export const metadata: Metadata = {
  title: "Build Order Builder — WC3 Strategy",
  description: "Create, save and share your own Warcraft III build orders.",
};

export default function BuilderPage() {
  return <BuilderEditor />;
}
