import { cn } from 'cn'

const Skeleton = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => 
  <div data-slot='skeleton' className={cn('bg-muted animate-pulse rounded-2xl', className)} {...props} />


export { Skeleton }
