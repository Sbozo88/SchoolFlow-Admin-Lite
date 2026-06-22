"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export function Modal({
  title,
  children,
  isOpen,
  onClose,
}: {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
          <Button aria-label="Close modal" className="size-9 p-0" onClick={onClose} type="button" variant="ghost">
            <X size={18} />
          </Button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
