import { Printer, Download, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

export function DataTable() {
  const exams = [
    { id: "#mat21", name: "Jason Black", subject: "Maths", class: "5th", status: "Active", date: "21 Jul 2022", checked: true },
    { id: "#mat21", name: "Gerald Ferrell", subject: "English", class: "7th", status: "Opened", date: "14 Jun 2022", checked: false },
    { id: "#mat21", name: "Delbert Barna", subject: "Physics", class: "6th", status: "Completed", date: "10 Mar 2022", checked: false },
    { id: "#mat21", name: "Mary Byrd", subject: "Chemistry", class: "4th", status: "Active", date: "06 Jan 2022", checked: false },
  ];

  return (
    <div className="rounded-[32px] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-[#1E293B]">Exam helds</h3>
        <div className="flex items-center gap-4 text-[#94A3B8]">
          <Printer size={18} className="cursor-pointer hover:text-[#1E293B]" />
          <Download size={18} className="cursor-pointer hover:text-[#1E293B]" />
        </div>
      </div>

      <div className="flex-1 w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[13px] font-medium text-[#94A3B8] border-b border-slate-100">
              <th className="pb-4 pl-2 w-12"></th>
              <th className="pb-4 font-medium">Exam Id</th>
              <th className="pb-4 font-medium">Student Name</th>
              <th className="pb-4 font-medium">Subject</th>
              <th className="pb-4 font-medium">Class</th>
              <th className="pb-4 font-medium">Status</th>
              <th className="pb-4 font-medium">Sub. Date</th>
              <th className="pb-4 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0 group">
                <td className="py-4 pl-2">
                  <div className={`size-5 rounded flex items-center justify-center border transition-colors ${exam.checked ? 'border-[#596080] bg-[#596080] text-white' : 'border-slate-200 bg-white'}`}>
                    {exam.checked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </div>
                </td>
                <td className="py-4 text-[14px] font-medium text-[#94A3B8]">{exam.id}</td>
                <td className="py-4 text-[14px] font-bold text-[#1E293B]">{exam.name}</td>
                <td className="py-4 text-[14px] font-bold text-[#1E293B]">{exam.subject}</td>
                <td className="py-4 text-[14px] font-medium text-[#94A3B8]">{exam.class}</td>
                <td className="py-4 text-[14px] font-medium">
                  <span className={`${
                    exam.status === 'Active' ? 'text-[#22C55E]' :
                    exam.status === 'Opened' ? 'text-[#F4A28C]' :
                    'text-[#596080]'
                  }`}>
                    {exam.status}
                  </span>
                </td>
                <td className="py-4 text-[14px] font-bold text-[#1E293B]">{exam.date}</td>
                <td className="py-4 text-[#94A3B8] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-right pr-2">
                  <MoreHorizontal size={20} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-4 mt-8 pt-4">
        <ChevronLeft size={16} className="text-[#94A3B8] cursor-pointer" />
        <div className="flex items-center gap-2 text-[14px] font-bold text-[#94A3B8]">
          <span className="flex size-8 items-center justify-center rounded-full bg-[#F4A28C] text-white">1</span>
          <span className="flex size-8 items-center justify-center cursor-pointer hover:text-[#1E293B]">2</span>
          <span>...</span>
          <span className="flex size-8 items-center justify-center cursor-pointer hover:text-[#1E293B]">10</span>
        </div>
        <ChevronRight size={16} className="text-[#94A3B8] cursor-pointer" />
      </div>
    </div>
  );
}
