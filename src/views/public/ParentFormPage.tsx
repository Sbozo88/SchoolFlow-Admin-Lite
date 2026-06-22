import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function ParentFormPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Card className="p-6">
          <h1 className="text-2xl font-black text-slate-950">Parent enquiry</h1>
          <form className="mt-6 grid gap-4">
            <Input id="parentName" label="Parent name" name="parentName" />
            <Input id="learnerName" label="Learner name" name="learnerName" />
            <Input id="parentEmail" label="Email" name="parentEmail" type="email" />
            <Input id="parentPhone" label="Phone" name="parentPhone" />
            <Button disabled type="submit">
              Submit enquiry
            </Button>
          </form>
        </Card>
      </section>
    </PublicLayout>
  );
}

export default ParentFormPage;
