const courses = [
  { title: "Evacuation Mastery", progress: 100, complete: true },
  { title: "Emergency Communications", progress: 72, complete: false },
  { title: "Incident Command Basics", progress: 64, complete: false },
  { title: "Resilience Planning", progress: 100, complete: true },
];

const LearningCenterPage = () => {
  return (
    <section>
      <h1 className="mb-4 text-xl font-semibold">Learning Center</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <article key={course.title} className="glass-card p-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="font-medium">{course.title}</h2>
              {course.complete && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">Complete</span>}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-secondary" style={{ width: `${course.progress}%` }} />
            </div>
            <p className="mt-2 text-sm text-muted">{course.progress}% progress</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default LearningCenterPage;
