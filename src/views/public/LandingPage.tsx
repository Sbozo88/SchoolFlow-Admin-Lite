import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";

export function LandingPage() {
  return (
    <PublicLayout>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_380px] lg:items-center">
        <div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">SchoolFlow Admin LITE</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            A focused operations shell for learner administration, attendance, payments, follow-ups, and reporting.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/login">
              <Button type="button">Admin login</Button>
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Foundation status</p>
          <p className="mt-2 text-3xl font-black text-slate-950">Protected by default</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">Firebase auth, admin RBAC, and Firestore rules are wired before feature modules are expanded.</p>
        </div>
      </section>
    </PublicLayout>
  );
}

export default LandingPage;
