import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="grid min-h-64 place-items-center p-8 text-center">
      <div>
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Inbox size={24} />
        </div>
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </Card>
  );
}
