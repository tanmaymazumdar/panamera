'use client'

import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import * as React from 'react'

import { cn } from '@/lib/utils'

type TooltipMode = 'tooltip' | 'popover'

const DESKTOP_TOOLTIP_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 1024px)'

const TOOLTIP_CONTENT_CLASSNAME =
  'bg-foreground text-background z-50 w-fit origin-(--transform-origin) rounded-md px-3 py-1.5 text-xs text-balance transition-[transform,scale,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0'

const TOOLTIP_ARROW_CLASSNAME = 'bg-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]'

const TooltipModeContext = React.createContext<TooltipMode>('tooltip')

const getTooltipMode = (query: MediaQueryList): TooltipMode => 
  query.matches ? 'tooltip' : 'popover'


const useTooltipMode = (): TooltipMode => {
  const [mode, setMode] = React.useState<TooltipMode>('tooltip')

  React.useEffect(() => {
    const query = window.matchMedia(DESKTOP_TOOLTIP_QUERY)
    const updateMode = () => setMode(getTooltipMode(query))

    updateMode()
    query.addEventListener('change', updateMode)

    return () => query.removeEventListener('change', updateMode)
  }, [])

  return mode
}

const TooltipProvider = ({
  delayDuration = 0,
  ...props
}: Omit<TooltipPrimitive.Provider.Props, 'delay'> & {
  delayDuration?: number
}): JSX.Element =>
  <TooltipPrimitive.Provider delay={delayDuration} {...props} />


const Tooltip = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration,
  disableHoverableContent,
  ...props
}: Omit<TooltipPrimitive.Root.Props, 'onOpenChange'> & {
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
  disableHoverableContent?: boolean
}): JSX.Element => {
  const mode = useTooltipMode()

  return (
    <TooltipModeContext.Provider value={mode}>
      {mode === 'tooltip' ? (
        <TooltipProvider delayDuration={delayDuration}>
          <TooltipPrimitive.Root
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            disableHoverablePopup={disableHoverableContent}
            {...props}
          >
            {children}
          </TooltipPrimitive.Root>
        </TooltipProvider>
      ) : (
        <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
          {children}
        </PopoverPrimitive.Root>
      )}
    </TooltipModeContext.Provider>
  )
}

const TooltipTrigger = ({
  nativeButton,
  render,
  ...props
}: React.ComponentProps<'button'> & {
  render?: React.ReactElement
  nativeButton?: boolean
}): JSX.Element => {
  const mode = React.useContext(TooltipModeContext)

  if (mode === 'popover') {
    return (
      <PopoverPrimitive.Trigger data-slot='tooltip-trigger' nativeButton={nativeButton} render={render} {...props} />
    )
  }

  return <TooltipPrimitive.Trigger data-slot='tooltip-trigger' render={render} {...props} />
}

type TooltipContentProps = React.ComponentProps<'div'> &
  Pick<TooltipPrimitive.Positioner.Props, 'align' | 'side' | 'sideOffset' | 'alignOffset'> & {
    hideArrow?: boolean
  }

const TooltipContent = ({
  className,
  align = 'center',
  side,
  sideOffset = 0,
  alignOffset,
  hideArrow = false,
  children,
  ...props
}: TooltipContentProps): JSX.Element => {
  const mode = React.useContext(TooltipModeContext)

  if (mode === 'popover') {
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          align={align}
          side={side}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className='isolate z-50'
        >
          <PopoverPrimitive.Popup
            data-slot='tooltip-content'
            className={cn(TOOLTIP_CONTENT_CLASSNAME, className)}
            {...props}
          >
            {children}
            {!hideArrow && <PopoverPrimitive.Arrow className={TOOLTIP_ARROW_CLASSNAME} />}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    )
  }

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        side={side}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className='isolate z-50'
      >
        <TooltipPrimitive.Popup
          data-slot='tooltip-content'
          className={cn(TOOLTIP_CONTENT_CLASSNAME, className)}
          {...props}
        >
          {children}
          {!hideArrow && <TooltipPrimitive.Arrow className={TOOLTIP_ARROW_CLASSNAME} />}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
