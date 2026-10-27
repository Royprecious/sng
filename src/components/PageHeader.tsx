import type { ReactNode } from 'react'
import { CameroonBadge, CameroonStripe } from './CameroonStripe'

type PageHeaderProps = {
  eyebrow: string
  title: string
  children: ReactNode
}

export function PageHeader({ eyebrow, title, children }: PageHeaderProps) {
  return (
    <header className="mb-8 max-w-3xl sm:mb-12">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[10px] font-bold tracking-[0.2em] text-blue-500 uppercase sm:text-xs sm:tracking-[0.25em]">
          {eyebrow}
        </p>
        <CameroonBadge className="scale-90" />
      </div>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      <CameroonStripe size="md" className="mt-4 max-w-[10rem] rounded-full sm:max-w-[12rem]" />
      <div className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
        {children}
      </div>
    </header>
  )
}
