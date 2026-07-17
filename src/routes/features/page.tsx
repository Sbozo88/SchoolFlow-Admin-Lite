export default function FeaturesPage() {
  const features = [
    {
      title: "Attendance Tracking",
      description: "Mark present, absent, or late with a single tap. Daily attendance rolls roll up into beautiful weekly and monthly reports automatically.",
      icon: "CheckSquare",
      color: "from-[#2ed573] to-[#10ac84]"
    },
    {
      title: "Fee Collection & Payments",
      description: "Log tuition and uniform payments. See who owes what instantly, and send automated reminders to parents with overdue accounts.",
      icon: "CreditCard",
      color: "from-[#feca57] to-[#f0932b]"
    },
    {
      title: "Parent Communication",
      description: "Keep a unified log of all parent conversations, calls, and follow-ups. Never lose track of an important parent request again.",
      icon: "PhoneForwarded",
      color: "from-[#ff6b81] to-[#ee5a24]"
    },
    {
      title: "Learner Profiles",
      description: "Store emergency contacts, medical info, and enrollment documents in secure, easy-to-search digital profiles.",
      icon: "GraduationCap",
      color: "from-[#7c6cf0] to-[#4834d4]"
    },
    {
      title: "Real-time Reports",
      description: "Generate beautiful attendance and financial reports for your principal, board, or local education department with one click.",
      icon: "BarChart3",
      color: "from-[#1dd1a1] to-[#00b894]"
    },
    {
      title: "Digital Enrollment",
      description: "Let parents apply online via a secure link. Review applications and approve them directly into your learner database.",
      icon: "ClipboardList",
      color: "from-[#a29bfe] to-[#6c5ce7]"
    }
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl mb-6">
          Everything you need to run your school.
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300">
          SchoolFlow Lite replaces scattered spreadsheets and paper registers with one unified, easy-to-use platform.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800 transition-all hover:shadow-md">
            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-sm`}>
              {/* Note: Icon rendering is simplified here, ideally we'd map string to Lucide component. 
                  For a real features page, we'd import the specific icons. */}
              <div className="text-white font-bold text-xl">{feature.title[0]}</div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
