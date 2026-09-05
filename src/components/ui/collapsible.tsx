import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'

const Collapsible = ({ ...props }: CollapsiblePrimitive.Root.Props): JSX.Element => 
  <CollapsiblePrimitive.Root data-slot='collapsible' {...props} />


const CollapsibleTrigger = ({ ...props }: CollapsiblePrimitive.Trigger.Props): JSX.Element => 
  <CollapsiblePrimitive.Trigger data-slot='collapsible-trigger' {...props} />


const CollapsibleContent = ({ ...props }: CollapsiblePrimitive.Panel.Props): JSX.Element => 
  <CollapsiblePrimitive.Panel data-slot='collapsible-content' {...props} />


export { Collapsible, CollapsibleTrigger, CollapsibleContent }
