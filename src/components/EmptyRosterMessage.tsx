type EmptyRosterMessageProps = {
  title?: string
  description?: string
  className?: string
}

export function EmptyRosterMessage({
  title = 'No soldiers yet',
  description = 'The clan roster is empty. Check back once leadership adds members.',
  className = '',
}: EmptyRosterMessageProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-700/90 bg-slate-900/40 px-6 py-12 text-center sm:py-14 ${className}`}
      role="status"
    >
      <p className="text-lg font-black tracking-tight text-slate-300 sm:text-xl">
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  )
}
