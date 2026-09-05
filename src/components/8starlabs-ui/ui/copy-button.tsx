'use client'

import { CheckIcon, CopyIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/8starlabs-ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export const CopyButton = ({
  value,
  className,
  variant = 'ghost',
  ...props
}: React.ComponentProps<typeof Button> & {
  value: string
  src?: string
}): JSX.Element => {
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (!hasCopied) {
      return
    }

    const timer = setTimeout(() => setHasCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [hasCopied])

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            data-slot='copy-button'
            size='icon'
            variant={variant}
            className={cn(
              'absolute top-2 right-2 z-10 size-7 opacity-70 hover:opacity-100 focus-visible:opacity-100',
              className,
            )}
            onClick={() => {
              navigator.clipboard.writeText(value)
              setHasCopied(true)
            }}
            {...props}
          >
            <span className='sr-only'>Copy</span>
            {hasCopied ? <CheckIcon /> : <CopyIcon />}
          </Button>
        }
      />
      <TooltipContent>{hasCopied ? 'Copied' : 'Copy to Clipboard'}</TooltipContent>
    </Tooltip>
  )
}
