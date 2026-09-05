'use client'

import { Progress as ProgressPrimitive } from '@base-ui/react/progress'
import { cn } from 'cn'

const Progress = ({ className, children, value, ...props }: ProgressPrimitive.Root.Props): JSX.Element => 
  (
    <ProgressPrimitive.Root
      value={value}
      data-slot='progress'
      className={cn('flex flex-wrap gap-3', className)}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )


const ProgressTrack = ({ className, ...props }: ProgressPrimitive.Track.Props): JSX.Element => 
  (
    <ProgressPrimitive.Track
      className={cn('bg-muted relative flex h-3 w-full items-center overflow-x-hidden rounded-full', className)}
      data-slot='progress-track'
      {...props}
    />
  )


const ProgressIndicator = ({ className, ...props }: ProgressPrimitive.Indicator.Props): JSX.Element => 
  (
    <ProgressPrimitive.Indicator
      data-slot='progress-indicator'
      className={cn('bg-primary h-full transition-all', className)}
      {...props}
    />
  )


const ProgressLabel = ({ className, ...props }: ProgressPrimitive.Label.Props): JSX.Element => 
  (
    <ProgressPrimitive.Label className={cn('text-sm font-medium', className)} data-slot='progress-label' {...props} />
  )


const ProgressValue = ({ className, ...props }: ProgressPrimitive.Value.Props): JSX.Element => 
  (
    <ProgressPrimitive.Value
      className={cn('text-muted-foreground ml-auto text-sm tabular-nums', className)}
      data-slot='progress-value'
      {...props}
    />
  )


export { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue }
