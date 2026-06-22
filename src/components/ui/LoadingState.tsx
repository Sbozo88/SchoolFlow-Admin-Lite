import { BrandedLoading } from "@/components/ui/BrandedLoading";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return <BrandedLoading detail="Fetching the latest school records." title={label} />;
}
