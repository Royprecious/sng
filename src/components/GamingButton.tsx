import { forwardRef, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'primary' | 'secondary'
type Size = 'md' | 'sm'

function buttonClasses(
  variant: Variant,
  size: Size,
  className: string,
): string {
  return [
    'btn-gaming',
    variant === 'primary' ? 'btn-gaming-primary' : 'btn-gaming-secondary',
    size === 'sm' ? 'btn-gaming-sm' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

type SharedProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: never
  }

type LinkButtonProps = SharedProps &
  Omit<LinkProps, 'className' | 'children'> & {
    to: string
  }

export const GamingButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps | LinkButtonProps
>(function GamingButton(
  {
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...rest
  },
  ref,
) {
  const cn = buttonClasses(variant, size, className)
  const inner = <span className="relative z-10">{children}</span>

  if ('to' in rest && rest.to) {
    const { to, ...linkRest } = rest as LinkButtonProps
    return (
      <Link
        ref={ref as Ref<HTMLAnchorElement>}
        to={to}
        className={cn}
        {...linkRest}
      >
        {inner}
      </Link>
    )
  }

  const buttonRest = rest as ButtonProps
  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      type={buttonRest.type ?? 'button'}
      className={cn}
      {...buttonRest}
    >
      {inner}
    </button>
  )
})

/** Class strings when a plain `Link` or native control is required. */
export const gamingBtnPrimary = buttonClasses('primary', 'md', '')
export const gamingBtnPrimarySm = buttonClasses('primary', 'sm', '')
export const gamingBtnSecondary = buttonClasses('secondary', 'md', '')
export const gamingBtnSecondarySm = buttonClasses('secondary', 'sm', '')
