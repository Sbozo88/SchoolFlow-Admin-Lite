import { BioCard } from "./teachers/BioCard";
import { GroupsWidget } from "./teachers/GroupsWidget";
import { CalendarWidget } from "./teachers/CalendarWidget";
import { DataTable } from "./teachers/DataTable";
import { TimelineWidget } from "./teachers/TimelineWidget";

export function TeachersView() {
  return (
    <div className="space-y-6">
      {/* Row 1 */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <BioCard />
        </div>
        <div className="lg:col-span-4">
          <GroupsWidget />
        </div>
        <div className="lg:col-span-4">
          <CalendarWidget />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <DataTable />
        </div>
        <div className="lg:col-span-4">
          <TimelineWidget />
        </div>
      </div>
    </div>
  );
}
