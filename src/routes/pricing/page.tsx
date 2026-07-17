import { Link } from "react-router-dom";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl mb-6">
          Simple, predictable pricing.
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300">
          No hidden fees, no per-student limits. Just one clear setup fee and a small monthly subscription to keep everything running smoothly.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Starter Setup */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Starter Setup</h3>
            <p className="text-slate-500 dark:text-slate-400">Once-off setup fee</p>
          </div>
          <div className="mb-8">
            <span className="text-5xl font-extrabold text-slate-900 dark:text-white">R2,500</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
              <Check className="text-teal-500 shrink-0 mt-0.5" size={20} />
              <span>Full system configuration</span>
            </li>
            <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
              <Check className="text-teal-500 shrink-0 mt-0.5" size={20} />
              <span>Bulk import of your existing learners</span>
            </li>
            <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
              <Check className="text-teal-500 shrink-0 mt-0.5" size={20} />
              <span>1-on-1 staff training session</span>
            </li>
            <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
              <Check className="text-teal-500 shrink-0 mt-0.5" size={20} />
              <span>Custom school branding setup</span>
            </li>
          </ul>
        </div>

        {/* Monthly Support */}
        <div className="bg-gradient-to-b from-[#6c5ce7]/10 to-transparent dark:from-[#6c5ce7]/20 rounded-3xl p-8 shadow-sm border border-[#6c5ce7]/30 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe]"></div>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Monthly Support</h3>
            <p className="text-[#6c5ce7] font-medium">Billed monthly</p>
          </div>
          <div className="mb-8 flex items-baseline gap-2">
            <span className="text-slate-500 text-2xl font-medium">from</span>
            <span className="text-5xl font-extrabold text-slate-900 dark:text-white">R750</span>
            <span className="text-slate-500">/mo</span>
          </div>
          <ul className="space-y-4 mb-10 flex-1">
            <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
              <Check className="text-[#6c5ce7] shrink-0 mt-0.5" size={20} />
              <span>Unlimited active learners</span>
            </li>
            <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
              <Check className="text-[#6c5ce7] shrink-0 mt-0.5" size={20} />
              <span>Unlimited staff accounts</span>
            </li>
            <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
              <Check className="text-[#6c5ce7] shrink-0 mt-0.5" size={20} />
              <span>Secure cloud data backups</span>
            </li>
            <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
              <Check className="text-[#6c5ce7] shrink-0 mt-0.5" size={20} />
              <span>Priority WhatsApp & Email support</span>
            </li>
          </ul>
          <Link 
            to="/enroll"
            className="block w-full text-center rounded-full bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] px-6 py-4 font-bold text-white shadow-lg shadow-[#6c5ce7]/30 transition-transform hover:scale-105"
          >
            Request Your Setup
          </Link>
        </div>
      </div>
    </div>
  );
}
