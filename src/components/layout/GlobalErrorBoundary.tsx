import { Component, type ReactNode } from "react";
import { CircleAlert, RefreshCw } from "lucide-react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-slate-900 dark:bg-[#0f0f11] dark:text-white">
          <div className="w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/[0.08] dark:bg-[#1c1c1f]">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
              <CircleAlert size={32} />
            </div>
            <h1 className="mt-6 text-2xl font-black tracking-tight">Something went wrong</h1>
            <p className="mt-3 text-sm text-slate-500 dark:text-white/40">
              An unexpected error occurred in the application. We have logged the issue.
            </p>
            {this.state.error && (
              <div className="mt-4 max-h-32 overflow-y-auto rounded-xl bg-slate-50 p-3 text-left text-[10px] font-mono text-slate-500 dark:bg-black/20 dark:text-white/30">
                {this.state.error.message}
              </div>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <RefreshCw size={16} /> Reload application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
