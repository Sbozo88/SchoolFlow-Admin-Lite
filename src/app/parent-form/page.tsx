import { ParentFormView } from "@/views/ParentFormView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parent Registration Form | SchoolFlow",
};

export default function Page() {
  return <ParentFormView />;
}
