import { ParentSubmissionsPage } from "@/views/admin/ParentSubmissionsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parent Submissions | SchoolFlow Admin",
};

export default function Page() {
  return <ParentSubmissionsPage />;
}
