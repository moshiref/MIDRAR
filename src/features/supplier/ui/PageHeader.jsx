/**
 * Consistent page title + subtitle + optional trailing actions, used at
 * the top of every /supplier/* page so typography and spacing stay
 * identical across the whole portal instead of each page hand-rolling
 * its own `<h1>`.
 */
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-lg font-extrabold text-text-primary md:text-xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
