import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog'
import { cn } from 'cn'
import * as React from 'react'

import { Button } from '@/components/ui/button'

const AlertDialog = ({ ...props }: AlertDialogPrimitive.Root.Props): JSX.Element => 
  <AlertDialogPrimitive.Root data-slot='alert-dialog' {...props} />


const AlertDialogTrigger = ({ ...props }: AlertDialogPrimitive.Trigger.Props): JSX.Element => 
  <AlertDialogPrimitive.Trigger data-slot='alert-dialog-trigger' {...props} />


const AlertDialogPortal = ({ ...props }: AlertDialogPrimitive.Portal.Props): JSX.Element => 
  <AlertDialogPrimitive.Portal data-slot='alert-dialog-portal' {...props} />


const AlertDialogOverlay = ({ className, ...props }: AlertDialogPrimitive.Backdrop.Props): JSX.Element => 
  (
    <AlertDialogPrimitive.Backdrop
      data-slot='alert-dialog-overlay'
      className={cn(
        'data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 isolate z-50 bg-black/30 duration-100 supports-backdrop-filter:backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  )


const AlertDialogContent = ({
  className,
  size = 'default',
  ...props
}: AlertDialogPrimitive.Popup.Props & {
  size?: 'default' | 'sm'
}): JSX.Element => 
  (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot='alert-dialog-content'
        data-size={size}
        className={cn(
          'group/alert-dialog-content bg-popover text-popover-foreground ring-foreground/5 dark:ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-6 rounded-4xl p-6 shadow-xl ring-1 duration-100 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-md',
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  )


const AlertDialogHeader = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => 
  (
    <div
      data-slot='alert-dialog-header'
      className={cn(
        'grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]',
        className,
      )}
      {...props}
    />
  )


const AlertDialogFooter = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => 
  (
    <div
      data-slot='alert-dialog-footer'
      className={cn(
        'flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )


const AlertDialogMedia = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => 
  (
    <div
      data-slot='alert-dialog-media'
      className={cn(
        "bg-muted mb-2 inline-flex size-16 items-center justify-center rounded-full sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-8",
        className,
      )}
      {...props}
    />
  )


const AlertDialogTitle = ({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>): JSX.Element => 
  (
    <AlertDialogPrimitive.Title
      data-slot='alert-dialog-title'
      className={cn(
        'font-heading text-lg font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2',
        className,
      )}
      {...props}
    />
  )


const AlertDialogDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>): JSX.Element => 
  (
    <AlertDialogPrimitive.Description
      data-slot='alert-dialog-description'
      className={cn(
        'text-muted-foreground *:[a]:hover:text-foreground text-sm text-balance md:text-pretty *:[a]:underline *:[a]:underline-offset-3',
        className,
      )}
      {...props}
    />
  )


const AlertDialogAction = ({ className, ...props }: React.ComponentProps<typeof Button>): JSX.Element => 
  <Button data-slot='alert-dialog-action' className={cn(className)} {...props} />


const AlertDialogCancel = ({
  className,
  variant = 'outline',
  size = 'default',
  ...props
}: AlertDialogPrimitive.Close.Props & Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>): JSX.Element => 
  (
    <AlertDialogPrimitive.Close
      data-slot='alert-dialog-cancel'
      className={cn(className)}
      render={<Button variant={variant} size={size} />}
      {...props}
    />
  )


export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
