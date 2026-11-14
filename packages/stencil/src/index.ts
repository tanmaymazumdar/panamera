import { html, render, type ChildPart } from 'lit-html'

let current: State | null
let currentId = 0

function setCurrent(state: State): void {
  current = state
}

function clear(): void {
  current = null
  currentId = 0
}

function notify(): number {
  return currentId++
}

export abstract class Hook<P extends unknown[] = unknown[], R = unknown, H = unknown> {
  id: number
  state: State<H>

  constructor(id: number, state: State<H>) {
    this.id = id
    this.state = state
  }

  abstract update(...args: P): R
  teardown?(): void
}

interface CustomHook<P extends unknown[] = unknown[], R = unknown, H = unknown> {
  new (id: number, state: State<H>, ...args: P): Hook<P, R, H>
}

function use<P extends unknown[], R, H = unknown>(Hook: CustomHook<P, R, H>, ...args: P): R {
  let id = notify()
  let hooks = current![hookSymbol]

  let hook = hooks.get(id) as Hook<P, R, H> | undefined
  if (!hook) {
    hook = new Hook(id, current as State<H>, ...args)
    hooks.set(id, hook)
  }

  return hook.update(...args)
}

export function hook<P extends unknown[], R, H = unknown>(Hook: CustomHook<P, R, H>): (...args: P) => R {
  return use.bind<null, [CustomHook<P, R, H>], P, R>(null, Hook)
}

const phaseSymbol = Symbol('stencil.phase')
const hookSymbol = Symbol('stencil.hook')

const updateSymbol = Symbol('stencil.update')
const commitSymbol = Symbol('stencil.commit')
const effectsSymbol = Symbol('stencil.effects')
const layoutEffectsSymbol = Symbol('stencil.layoutEffects')

type EffectsSymbols = typeof effectsSymbol | typeof layoutEffectsSymbol
type Phase = typeof updateSymbol | typeof commitSymbol | typeof effectsSymbol

const contextEvent = 'stencil.context'

interface Callable {
  call: (state: State) => void
}

export class State<H = unknown> {
  update: VoidFunction
  host: H;
  [hookSymbol]: Map<number, Hook>;
  [effectsSymbol]: Callable[];
  [layoutEffectsSymbol]: Callable[]

  constructor(update: VoidFunction, host: H) {
    this.update = update
    this.host = host
    this[hookSymbol] = new Map()
    this[effectsSymbol] = []
    this[layoutEffectsSymbol] = []
  }

  run<T>(cb: () => T): T {
    setCurrent(this)
    let res = cb()
    clear()
    return res
  }

  _runEffects(phase: EffectsSymbols): void {
    let effects = this[phase]
    setCurrent(this)
    for (let effect of effects) {
      effect.call(this)
    }
    clear()
  }

  runEffects(): void {
    this._runEffects(effectsSymbol)
  }

  runLayoutEffects(): void {
    this._runEffects(layoutEffectsSymbol)
  }

  teardown(): void {
    let hooks = this[hookSymbol]
    hooks.forEach(hook => {
      if (typeof hook.teardown === 'function') {
        hook.teardown()
      }
    })
  }
}

const defer = Promise.resolve().then.bind(Promise.resolve())

function runner() {
  let tasks: VoidFunction[] = []
  let id: Promise<void> | null

  function runTasks(): void {
    id = null
    let t = tasks
    tasks = []
    for (var i = 0, len = t.length; i < len; i++) {
      t[i]?.()
    }
  }

  return function (task: VoidFunction): void {
    tasks.push(task)
    if (id == null) {
      id = defer(runTasks)
    }
  }
}

const read = runner()
const write = runner()

export abstract class BaseScheduler<
  P extends object,
  T extends HTMLElement | ChildPart,
  R extends GenericRenderer<T, P>,
  H extends ComponentOrVirtualComponent<T, P>
> {
  renderer: R
  host: H
  state: State<H>;
  [phaseSymbol]: Phase | null
  _updateQueued: boolean

  constructor(renderer: R, host: H) {
    this.renderer = renderer
    this.host = host
    this.state = new State(this.update.bind(this), host)
    this[phaseSymbol] = null
    this._updateQueued = false
  }

  update(): void {
    if (this._updateQueued) return
    read(() => {
      let result = this.handlePhase(updateSymbol)
      write(() => {
        this.handlePhase(commitSymbol, result)

        write(() => {
          this.handlePhase(effectsSymbol)
        })
      })
      this._updateQueued = false
    })
    this._updateQueued = true
  }

  handlePhase(phase: typeof commitSymbol, arg: unknown): void
  handlePhase(phase: typeof updateSymbol): unknown
  handlePhase(phase: typeof effectsSymbol): void
  handlePhase(phase: Phase, arg?: unknown): unknown {
    this[phaseSymbol] = phase
    switch (phase) {
      case commitSymbol:
        this.commit(arg)
        this.runEffects(layoutEffectsSymbol)
        return
      case updateSymbol:
        return this.render()
      case effectsSymbol:
        return this.runEffects(effectsSymbol)
    }
  }

  render(): unknown {
    return this.state.run(() => this.renderer.call(this.host, this.host))
  }

  runEffects(phase: EffectsSymbols): void {
    this.state._runEffects(phase)
  }

  abstract commit(result: unknown): void

  teardown(): void {
    this.state.teardown()
  }
}

const toCamelCase = (val = ''): string => val.replace(/-+([a-z])?/g, (_, char) => (char ? char.toUpperCase() : ''))

interface Renderer<P extends object> extends GenericRenderer<HTMLElement, P> {
  (this: Component<P>, host: Component<P>): unknown | void
  observedAttributes?: (keyof P)[]
}

type Component<P extends object> = HTMLElement & P

type ComponentConstructor<P extends object> = new (...args: unknown[]) => Component<P>

interface ComponentCreator {
  <P extends object>(renderer: Renderer<P>): ComponentConstructor<P>
  <P extends object>(renderer: Renderer<P>, options: Options<P>): ComponentConstructor<P>
  <P extends object>(
    renderer: Renderer<P>,
    baseElement: ComponentConstructor<{}>,
    options: Omit<Options<P>, 'baseElement'>
  ): ComponentConstructor<P>
}

interface Options<P> {
  baseElement?: ComponentConstructor<{}>
  observedAttributes?: (keyof P)[]
  useShadowDOM?: boolean
  shadowRootInit?: ShadowRootInit
}

function makeComponent(render: RenderFunction): ComponentCreator {
  class Scheduler<P extends object> extends BaseScheduler<P, HTMLElement, Renderer<P>, Component<P>> {
    frag: DocumentFragment | HTMLElement
    isFirstRender: boolean

    constructor(renderer: Renderer<P>, frag: DocumentFragment, host: HTMLElement)
    constructor(renderer: Renderer<P>, host: HTMLElement)
    constructor(renderer: Renderer<P>, frag: DocumentFragment | HTMLElement, host?: HTMLElement) {
      super(renderer, (host || frag) as Component<P>)
      this.frag = frag
      this.isFirstRender = true
    }

    commit(result: unknown): void {
      // Clear component's content before first render
      // Needed by lit-html v2. See https://lit.dev/docs/releases/upgrade/#lit-html
      if (this.isFirstRender) clearContent(this.frag)
      render(result, this.frag)
      this.isFirstRender = false
    }
  }

  function component<P extends object>(renderer: Renderer<P>): ComponentConstructor<P>
  function component<P extends object>(renderer: Renderer<P>, options: Options<P>): ComponentConstructor<P>
  function component<P extends object>(
    renderer: Renderer<P>,
    baseElement: ComponentConstructor<P>,
    options: Omit<Options<P>, 'baseElement'>
  ): ComponentConstructor<P>
  function component<P extends object>(
    renderer: Renderer<P>,
    baseElementOrOptions?: ComponentConstructor<P> | Options<P>,
    options?: Options<P>
  ): ComponentConstructor<P> {
    const BaseElement = (options || (baseElementOrOptions as Options<P>) || {}).baseElement || HTMLElement
    const {
      observedAttributes = [],
      useShadowDOM = true,
      shadowRootInit = {}
    } = options || (baseElementOrOptions as Options<P>) || {}

    class Element extends BaseElement {
      _scheduler: Scheduler<P>

      static get observedAttributes(): (keyof P)[] {
        return renderer.observedAttributes || observedAttributes || []
      }

      constructor() {
        super()
        if (useShadowDOM === false) {
          this._scheduler = new Scheduler(renderer, this)
        } else {
          this.attachShadow({ mode: 'open', ...shadowRootInit })
          this._scheduler = new Scheduler(renderer, this.shadowRoot!, this)
        }
      }

      connectedCallback(): void {
        this._scheduler.update()
      }

      disconnectedCallback(): void {
        this._scheduler.teardown()
      }

      attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown): void {
        if (oldValue === newValue) {
          return
        }
        let val = newValue === '' ? true : newValue
        Reflect.set(this, toCamelCase(name), val)
      }
    }

    function reflectiveProp<T>(initialValue: T): Readonly<PropertyDescriptor> {
      let value = initialValue
      let isSetup = false
      return Object.freeze({
        enumerable: true,
        configurable: true,
        get(): T {
          return value
        },
        set(this: Element, newValue: T): void {
          // Avoid scheduling update when prop value hasn't changed
          if (isSetup && value === newValue) return
          isSetup = true
          value = newValue
          if (this._scheduler) {
            this._scheduler.update()
          }
        }
      })
    }

    const proto = new Proxy(BaseElement.prototype, {
      getPrototypeOf(target: unknown): object | null {
        return target as object
      },

      set(target, key: string, value, receiver): boolean {
        let desc: PropertyDescriptor | undefined
        if (key in target) {
          desc = Object.getOwnPropertyDescriptor(target, key)
          if (desc && desc.set) {
            desc.set.call(receiver, value)
            return true
          }

          Reflect.set(target, key, value, receiver)
          return true
        }

        if (typeof key === 'symbol' || key[0] === '_') {
          desc = {
            enumerable: true,
            configurable: true,
            writable: true,
            value
          }
        } else {
          desc = reflectiveProp(value)
        }
        Object.defineProperty(receiver, key, desc)

        if (desc.set) {
          desc.set.call(receiver, value)
        }

        return true
      }
    })

    Object.setPrototypeOf(Element.prototype, proto)

    return Element as unknown as ComponentConstructor<P>
  }

  return component
}

// Clear content of element or fragment
// Same as element.innerHTML = '', but works on fragments as well
function clearContent(frag: DocumentFragment | HTMLElement): void {
  if (frag.replaceChildren) {
    frag.replaceChildren() // New API
  } else {
    while (frag.firstChild) frag.removeChild(frag.firstChild)
  }
}

type Effect = (this: State) => void | VoidFunction | Promise<void>

export function createEffect(
  setEffects: (state: State, cb: Callable) => void
): (callback: Effect, values?: unknown[] | undefined) => void {
  return hook(
    class extends Hook {
      callback!: Effect
      lastValues?: unknown[]
      values?: unknown[]
      _teardown!: Promise<void> | VoidFunction | void

      constructor(id: number, state: State, _ignored1: Effect, _ignored2?: unknown[]) {
        super(id, state)
        setEffects(state, this)
      }

      update(callback: Effect, values?: unknown[]): void {
        this.callback = callback
        this.values = values
      }

      call(): void {
        const hasChanged = !this.values || this.hasChanged()
        this.lastValues = this.values

        if (hasChanged) {
          this.run()
        }
      }

      run(): void {
        this.teardown()
        this._teardown = this.callback.call(this.state)
      }

      override teardown(): void {
        if (typeof this._teardown === 'function') {
          this._teardown()
        }
        this._teardown = undefined
        this.lastValues = undefined
      }

      hasChanged(): boolean {
        return !this.lastValues || this.values!.some((value, i) => this.lastValues![i] !== value)
      }
    }
  )
}

function setEffects(state: State, cb: Callable): void {
  state[effectsSymbol].push(cb)
}

/**
 * @function
 * @param {() => void} effect - callback function that runs each time dependencies change
 * @param {unknown[]} [dependencies] - list of dependencies to the effect
 * @return {void}
 */
export const useEffect = createEffect(setEffects)

/**
 * @function
 * @template T
 * @param    {Context<T>} context
 * @return   {T}
 */
export const useContext = hook(
  class<T> extends Hook<[Context<T>], T, Element> {
    Context!: Context<T>
    value!: T
    _ranEffect: boolean
    _unsubscribe: VoidFunction | null

    // oxlint-disable-next-line no-unused-vars -- positional hook args are intentionally unused
    constructor(id: number, state: State<Element>, _: Context<T>) {
      super(id, state)
      this._updater = this._updater.bind(this)
      this._ranEffect = false
      this._unsubscribe = null
      setEffects(state, this)
    }

    update(Context: Context<T>): T {
      if (this.Context !== Context) {
        this._subscribe(Context)
        this.Context = Context
      }

      return this.value
    }

    call(): void {
      if (!this._ranEffect) {
        this._ranEffect = true
        if (this._unsubscribe) this._unsubscribe()
        const before = this.value
        this._subscribe(this.Context)
        if (!Object.is(before, this.value)) {
          this.state.update()
        }
      }
    }

    _updater(value: T): void {
      this.value = value
      this.state.update()
    }

    _subscribe(Context: Context<T>): void {
      const detail = { Context, callback: this._updater }

      this.state.host.dispatchEvent(
        new CustomEvent(contextEvent, {
          detail, // carrier
          bubbles: true, // to bubble up in tree
          cancelable: true, // to be able to cancel
          composed: true // to pass ShadowDOM boundaries
        })
      )

      const { unsubscribe = null, value } = detail as ContextDetail<T>

      this.value = unsubscribe ? value : Context.defaultValue

      this._unsubscribe = unsubscribe
    }

    override teardown(): void {
      if (this._unsubscribe) {
        this._unsubscribe()
        this._unsubscribe = null
      }
      this._ranEffect = false
    }
  }
)

interface ConsumerProps<T> {
  render: (value: T) => unknown
}

interface ContextCreator {
  <T>(defaultValue: T): Context<T>
}

interface Context<T> {
  Provider: ComponentConstructor<{}>
  Consumer: ComponentConstructor<ConsumerProps<T>>
  defaultValue: T
}

interface ContextDetail<T> {
  Context: Context<T>
  callback: (value: T) => void

  // These properties will not exist if a context consumer lacks a provider
  value: T
  unsubscribe?: (this: Context<T>) => void
}

function makeContext(component: ComponentCreator): ContextCreator {
  return <T>(defaultValue: T): Context<T> => {
    const Context: Context<T> = {
      Provider: class extends HTMLElement {
        listeners: Set<(value: T) => void>
        _value!: T

        constructor() {
          super()
          this.listeners = new Set()
          this._value = defaultValue

          this.addEventListener(contextEvent, this)
        }

        disconnectedCallback(): void {
          this.removeEventListener(contextEvent, this)
        }

        handleEvent(event: CustomEvent<ContextDetail<T>>): void {
          const { detail } = event

          if (detail.Context === Context) {
            detail.value = this.value
            detail.unsubscribe = this.unsubscribe.bind(this, detail.callback)

            this.listeners.add(detail.callback)

            event.stopPropagation()
          }
        }

        unsubscribe(callback: (value: T) => void): void {
          this.listeners.delete(callback)
        }

        set value(value: T) {
          this._value = value
          for (let callback of this.listeners) {
            callback(value)
          }
        }

        get value(): T {
          return this._value
        }
      },

      Consumer: component<ConsumerProps<T>>(
        function (this: ComponentOrVirtualComponent<HTMLElement, ConsumerProps<T>>, ...args: unknown[]): unknown {
          const { render } = args[0] as ConsumerProps<T>

          const context = useContext(Context)

          return render(context)
        },
        { useShadowDOM: false }
      ),

      defaultValue
    }

    return Context
  }
}

type ComponentOrVirtualComponent<T extends HTMLElement | ChildPart, P extends object> = T extends HTMLElement
  ? Component<P>
  : ChildPart

type GenericRenderer<T extends HTMLElement | ChildPart, P extends object = {}> = (
  this: ComponentOrVirtualComponent<T, P>,
  ...args: unknown[]
) => unknown | void
export type RenderFunction = (result: unknown, container: DocumentFragment | HTMLElement) => void

interface RenderOptions {
  render: RenderFunction
}

export default function stencil({ render }: RenderOptions): {
  component: ComponentCreator
  createContext: ContextCreator
} {
  const component = makeComponent(render)
  const createContext = makeContext(component)

  return { component, createContext }
}

/**
 * @function
 * @template T
 * @param  {() => T} fn function to memoize
 * @param  {unknown[]} values dependencies to the memoized computation
 * @return {T} The next computed value
 */
export const useMemo = hook(
  class<T> extends Hook {
    value: T
    values: unknown[]

    constructor(id: number, state: State, fn: () => T, values: unknown[]) {
      super(id, state)
      this.value = fn()
      this.values = values
    }

    update(fn: () => T, values: unknown[]): T {
      if (this.hasChanged(values)) {
        this.values = values
        this.value = fn()
      }
      return this.value
    }

    hasChanged(values: unknown[] = []): boolean {
      return values.some((value, i) => this.values[i] !== value)
    }
  }
)

// oxlint-disable-next-line react-hooks/exhaustive-deps -- custom memo hook, not React's useMemo
export const useCallback = <T extends Function>(fn: T, inputs: unknown[]): unknown => useMemo(() => fn, inputs)

function setLayoutEffects(state: State, cb: Callable): void {
  state[layoutEffectsSymbol].push(cb)
}

/**
 * @function
 * @param  {Effect} callback effecting callback
 * @param  {unknown[]} [values] dependencies to the effect
 * @return {void}
 */
export const useLayoutEffect = createEffect(setLayoutEffects)

type InitialState<T> = T | (() => T)
type NewState<T> = T | ((previousState: T) => T)
export type StateUpdater<T> = (value: NewState<T>) => void
type StateTuple<T> = readonly [T, StateUpdater<T>]

interface UseState {
  <T>(): StateTuple<T | undefined>
  <T>(value?: InitialState<T>): StateTuple<T>
}

/**
 * @function
 * @template {*} T
 * @param {T} [initialState] - Optional initial state
 * @return {StateTuple<T>} stateTuple - Tuple of current state and state updater function
 */
export const useState = hook(
  class<T> extends Hook {
    args!: StateTuple<T>

    constructor(id: number, state: State, initialValue: InitialState<T>) {
      super(id, state)
      this.updater = this.updater.bind(this)

      if (typeof initialValue === 'function') {
        const initFn = initialValue as () => T
        initialValue = initFn()
      }

      this.makeArgs(initialValue)
    }

    update(): StateTuple<T> {
      return this.args
    }

    updater(value: NewState<T>): void {
      const [previousValue] = this.args
      if (typeof value === 'function') {
        const updaterFn = value as (previousState: T) => T
        value = updaterFn(previousValue)
      }

      if (Object.is(previousValue, value)) {
        return
      }

      this.makeArgs(value)
      this.state.update()
    }

    makeArgs(value: T): void {
      this.args = Object.freeze([value, this.updater])
    }
  }
) as UseState

type Reducer<S, A> = (state: S, action: A) => S

/**
 * Given a reducer function, initial state, and optional state initializer function, returns a tuple of state and dispatch function.
 * @function
 * @template S State
 * @template I Initial State
 * @template A Action
 * @param {Reducer<S, A>} reducer - reducer function to compute the next state given the previous state and the action
 * @param {I} initialState - the initial state of the reducer
 * @param {(init: I) => S} [init=undefined] - Optional initializer function, called on initialState if provided
 * @return {readonly [S, (action: A) => void]}
 */
export const useReducer = hook(
  class<S, I, A> extends Hook {
    reducer!: Reducer<S, A>
    currentState: S

    constructor(id: number, state: State, _: Reducer<S, A>, initialState: I, init?: (_: I) => S) {
      super(id, state)
      this.dispatch = this.dispatch.bind(this)
      this.currentState = init !== undefined ? init(initialState) : (initialState as unknown as S)
    }

    update(reducer: Reducer<S, A>): readonly [S, (action: A) => void] {
      this.reducer = reducer
      return [this.currentState, this.dispatch]
    }

    dispatch(action: A): void {
      const nextState = this.reducer(this.currentState, action)
      if (Object.is(this.currentState, nextState)) {
        return
      }
      this.currentState = nextState
      this.state.update()
    }
  }
)

/**
 * @function
 * @template T
 * @param  {Context} Context Context to provide a value for
 * @param  {T} value the current value
 * @param  {unknown[]} values dependencies to the value update
 * @return void
 */
export const useProvideContext = hook(
  class<T> extends Hook<[Context<T>, T, unknown[]], void, Element> {
    listeners: Set<(value: T) => void>
    _listening: boolean

    context: Context<T>
    value: T
    values?: unknown[]

    constructor(id: number, state: State<Element>, context: Context<T>, value: T, values?: unknown[]) {
      super(id, state)
      this.context = context
      this.value = value
      this.values = values

      this.listeners = new Set()
      this._listening = false
      this._ensureListening()
    }

    _ensureListening(): void {
      if (!this._listening) {
        this.state.host.addEventListener(contextEvent, this)
        this._listening = true
      }
    }

    handleEvent(event: CustomEvent<ContextDetail<T>>): void {
      const { detail } = event

      if (detail.Context === this.context) {
        detail.value = this.value
        detail.unsubscribe = this.unsubscribe.bind(this, detail.callback)

        this.listeners.add(detail.callback)

        event.stopPropagation()
      }
    }

    unsubscribe(callback: (value: T) => void): void {
      this.listeners.delete(callback)
    }

    update(_context: Context<T>, value: T, values?: unknown[]): void {
      this._ensureListening()
      if (this.hasChanged(values)) {
        this.values = values
        this.value = value
        for (const callback of this.listeners) {
          callback(value)
        }
      }
    }

    hasChanged(values?: unknown[]): unknown[] | boolean {
      const lastValues = this.values

      if (lastValues == null || values == null) {
        return true
      }

      return values.some((value, i) => lastValues[i] !== value)
    }

    override teardown(): void {
      if (this._listening) {
        this.state.host.removeEventListener(contextEvent, this)
        this._listening = false
      }
      this.listeners.clear()
    }
  }
)

export interface Ref<T> {
  current: T
}

export function useRef<T>(): Ref<T | undefined>
export function useRef<T>(initialValue: T): Ref<T>
export function useRef<T>(initialValue?: T): Ref<T | undefined> {
  // oxlint-disable react-hooks/exhaustive-deps -- custom memo hook with intentional empty deps
  return useMemo(
    () => ({
      current: initialValue
    }),
    []
  )
  // oxlint-enable react-hooks/exhaustive-deps
}

const { component, createContext } = stencil({ render })

export type { Options as ComponentOption }
export { html, render, component, createContext }
