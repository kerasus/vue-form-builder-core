<template>
  <div :class="['row', 'form-builder-container', $attrs.class]">
    <div
        v-for="(input, inputIndex) in inputData"
        :key="input.uid || inputIndex"
        :class="['form-builder-col', getComponentCol(input)]"
        :style="getComponentStyle(input)"
    >
      <component
          :is="resolveComponent(input)"
          v-memo="[input.type, input.value, input.disable, input.readonly, input.loading]"
          :ref="(el: any) => registerRef(el, input)"
          :model-value="input.value"
          v-bind="getComponentProps(input)"
          :loading="resolveLoading(input)"
          :disable="resolveDisable(input)"
          :readonly="resolveReadonly(input)"
          @update:model-value="onFieldValueUpdate(input, $event)"
          @update:form-data="onNestedFormDataUpdated(input, $event)"
          @input="onInput($event, inputIndex)"
          @change="onChange($event, inputIndex)"
          @click="onClick($event, input)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  markRaw,
  toRaw,
  type Component,
  type CSSProperties,
  type Ref
} from 'vue'
import * as shvl from 'shvl'

// Native Component Fallbacks
import FormBuilderInput from './components/FormBuilderInput.vue'
import FormBuilderFile from './components/FormBuilderFile.vue'
import FormBuilderTextarea from './components/FormBuilderTextarea.vue'
import FormBuilderSelect from './components/FormBuilderSelect.vue'
import FormBuilderCheckbox from './components/FormBuilderCheckbox.vue'
import FormBuilderRadio from './components/FormBuilderRadio.vue'
import FormBuilderHidden from './components/FormBuilderHidden.vue'

defineOptions({
  name: 'FormBuilder',
  inheritAttrs: false
})

// ==========================================
// Types & Interfaces
// ==========================================

/** Data extraction strategy for nested FormBuilder instances. */
export type FormDataMode = 'nested' | 'flat'

export interface FormInputOption {
  label?: string
  value?: any
  [key: string]: any
}

export interface FormInputItem {
  name: string
  type?: string | Component | object
  value?: any
  label?: string
  placeholder?: string
  col?: string
  uid?: string
  disable?: boolean
  readonly?: boolean
  loading?: boolean
  multiple?: boolean
  rows?: number
  options?: Array<string | number | FormInputOption>
  inputs?: FormInputItem[]
  responseKey?: string
  [key: string]: any
}

export type FormDataObject = Record<string, any>

export interface FormBuilderProps {
  /** Form schema item definitions */
  inputs?: FormInputItem[]
  /** Backward-compatible schema alias */
  value?: FormInputItem[]
  /** Initial or bound form key-value state */
  formData?: FormDataObject
  /** Data shape resolution strategy: 'nested' preserves hierarchy, 'flat' flattens all sub-builders */
  formDataMode?: FormDataMode
  /** Global readonly state override */
  readonly?: boolean | undefined
  /** Global disable state override */
  disable?: boolean | undefined
  /** Global loading state override */
  loading?: boolean | undefined
  customComponents?: Record<string, Component>
}

const props = withDefaults(defineProps<FormBuilderProps>(), {
  inputs: undefined,
  value: undefined,
  formData: () => ({}),
  formDataMode: 'nested',
  readonly: undefined,
  disable: undefined,
  loading: undefined,
  customComponents: () => ({})
})

const emit = defineEmits<{
  (e: 'update:inputs', value: FormInputItem[]): void
  (e: 'update:value', value: FormInputItem[]): void
  (e: 'update:formData', value: FormDataObject): void
  (e: 'input', payload: { event: Event; index: number; data: FormInputItem[] }): void
  (e: 'change', payload: { event: Event; index: number; data: FormInputItem[] }): void
  (e: 'onClick', payload: { event: MouseEvent; input: FormInputItem }): void
}>()

// ==========================================
// Internal State
// ==========================================

const inputData = ref<FormInputItem[]>([]) as Ref<FormInputItem[]>
const inputRefs = ref<Record<string, any>>({})

let isSyncingFromFormData = false
let isSyncingFromInputs = false
let uidCounter = 0

/**
 * Generates an internal unique identifier for each schema item.
 */
const generateSimpleUid = (): string => {
  uidCounter += 1
  return `fb-id-${uidCounter}`
}

// ==========================================
// Status Resolvers (Cascading tri-state)
// ==========================================

const resolveReadonly = (input: FormInputItem): boolean => {
  if (props.readonly !== undefined) return props.readonly
  return !!input.readonly
}

const resolveDisable = (input: FormInputItem): boolean => {
  if (props.disable !== undefined) return props.disable
  return !!input.disable
}

const resolveLoading = (input: FormInputItem): boolean => {
  if (props.loading !== undefined) return props.loading
  return !!input.loading
}

// ==========================================
// Schema & Data Pipeline
// ==========================================

/**
 * Recursively assigns unique IDs to schema items lacking one.
 */
const setUidForInputs = (inputs: FormInputItem[] = inputData.value): void => {
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    if (!input.uid) {
      input.uid = generateSimpleUid()
    }
    if (input.type === 'formBuilder' && Array.isArray(input.inputs)) {
      setUidForInputs(input.inputs)
    }
  }
}

/**
 * Extracts form values preserving schema hierarchy.
 */
const extractFormData = (inputs: FormInputItem[] = inputData.value): FormDataObject => {
  const data: FormDataObject = {}

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    if (!input.name) continue

    if (input.type === 'formBuilder' && Array.isArray(input.inputs)) {
      data[input.name] = input.value !== undefined ? input.value : extractFormData(input.inputs)
    } else {
      data[input.name] = input.value !== undefined ? input.value : null
    }
  }

  return data
}

/**
 * Flattens arbitrary nested objects into a single-level dictionary.
 */
const flattenFormData = (data: FormDataObject): FormDataObject => {
  const result: FormDataObject = {}

  for (const [key, value] of Object.entries(data)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenFormData(value))
    } else {
      result[key] = value
    }
  }

  return result
}

/**
 * Extracts form values while flattening nested FormBuilder groups only.
 * Leaves non-group object payloads (e.g. QSelect options) intact.
 */
const flattenGroupInputs = (
    inputs: FormInputItem[],
    result: FormDataObject = {}
): FormDataObject => {
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    if (input.type === 'formBuilder' && Array.isArray(input.inputs)) {
      flattenGroupInputs(input.inputs, result)
    } else if (input.name) {
      if (input.name in result) {
        console.warn(`[FormBuilder] Duplicate key "${input.name}" detected in flat mode.`)
      }
      result[input.name] = input.value !== undefined ? input.value : null
    }
  }
  return result
}

/**
 * Builds the current form data object according to the active `formDataMode`.
 */
const buildFormData = (inputs: FormInputItem[] = inputData.value): FormDataObject => {
  if (props.formDataMode === 'flat') {
    return flattenGroupInputs(inputs)
  }
  return extractFormData(inputs)
}

/**
 * Populates schema item values from an incoming form data payload.
 */
const applyFormDataToInputs = (
    formData: FormDataObject,
    inputs?: FormInputItem[]
): void => {
  if (!formData || typeof formData !== 'object') return

  // حتماً تارگت رو روی inputData بگذار اگر پاس داده نشده بود
  const targetInputs = inputs || inputData.value
  if (!Array.isArray(targetInputs)) return

  for (let i = 0; i < targetInputs.length; i++) {
    const input = targetInputs[i]
    if (!input) continue

    // ۱. اگر فیلد از نوع formBuilder تودرتو است
    if (input.type === 'formBuilder' && Array.isArray(input.inputs)) {
      if (props.formDataMode === 'flat') {
        // در حالت Flat کل دیتای والد به فرزندان پاس داده می‌شود
        applyFormDataToInputs(formData, input.inputs)
      } else if (input.name && input.name in formData) {
        const nestedData = formData[input.name]
        if (nestedData && typeof nestedData === 'object') {
          applyFormDataToInputs(nestedData as FormDataObject, input.inputs)
        }
      }
      continue
    }

    // ۲. فیلدهای عادی (Separatorها و المان‌های بدون name رد می‌شوند)
    if (!input.name || !(input.name in formData)) {
      continue
    }

    const newVal = formData[input.name]

    // فقط مقدار .value تغییر می‌کند؛ دست به ساختار آیتم نزن!
    if (input.value !== newVal) {
      input.value = newVal
    }
  }
}

/**
 * Emits the updated schema and resolved form payload.
 */
const syncState = (): void => {
  if (isSyncingFromFormData) return

  isSyncingFromInputs = true
  const calculatedFormData = buildFormData(inputData.value)

  emit('update:inputs', inputData.value)
  emit('update:value', inputData.value)
  emit('update:formData', calculatedFormData)

  nextTick(() => {
    isSyncingFromInputs = false
  })
}

/**
 * Registers component references with garbage-collection cleanup.
 */
const registerRef = (el: any, input: FormInputItem): void => {
  if (!input.name) return
  const key = `input-${input.name}-${input.uid || ''}`
  if (el) {
    inputRefs.value[key] = el
  } else {
    delete inputRefs.value[key]
  }
}

/**
 * Deep-clones a schema item and marks non-reactive component definitions raw.
 */
const cloneInputItem = (item: FormInputItem): FormInputItem => {
  const cloned: FormInputItem = { ...item }
  if (typeof cloned.type === 'object' || typeof cloned.type === 'function') {
    cloned.type = markRaw(toRaw(cloned.type))
  }
  if (cloned.type === 'formBuilder' && Array.isArray(cloned.inputs)) {
    cloned.inputs = cloned.inputs.map(cloneInputItem)
  }
  return cloned
}

const setInputs = (newInputs: FormInputItem[]): void => {
  inputData.value = newInputs.map(cloneInputItem)
  setUidForInputs(inputData.value)
}

// ==========================================
// Component Resolution Map
// ==========================================

const nativeComponentMap: Record<string, Component> = {
  text: FormBuilderInput,
  number: FormBuilderInput,
  password: FormBuilderInput,
  email: FormBuilderInput,
  date: FormBuilderInput,
  time: FormBuilderInput,
  file: FormBuilderFile,
  textarea: FormBuilderTextarea,
  select: FormBuilderSelect,
  checkbox: FormBuilderCheckbox,
  radio: FormBuilderRadio,
  hidden: FormBuilderHidden
}

const resolveComponent = (input: FormInputItem): Component | string => {
  if (typeof input.type === 'object' || typeof input.type === 'function') {
    return input.type as Component
  }
  if (input.type === 'formBuilder') {
    return 'FormBuilder'
  }
  if (typeof input.type === 'string' && props.customComponents[input.type]) {
    return props.customComponents[input.type]
  }
  if (typeof input.type === 'string' && nativeComponentMap[input.type]) {
    return nativeComponentMap[input.type]
  }
  return FormBuilderInput
}

/**
 * Filters out internal control properties prior to passing props down to dynamic components.
 */
const getComponentProps = (input: FormInputItem): Record<string, any> => {
  const { col, value, uid, readonly, disable, loading, inputs, ...rest } = input

  if (input.type === 'formBuilder') {
    return {
      ...rest,
      inputs,
      customComponents: props.customComponents,
      formData:
          props.formDataMode === 'flat'
              ? flattenGroupInputs(input.inputs || [])
              : (value || {}),
      formDataMode: props.formDataMode
    }
  }
  return rest
}

const getComponentCol = (input: FormInputItem): string => {
  if (input.type === 'hidden') return 'hidden-col'
  return input.col ? input.col : 'col-12'
}

const getComponentStyle = (input: FormInputItem): CSSProperties => {
  if (input.type === 'hidden') {
    return { display: 'none', padding: '0px', margin: '0px' }
  }
  return {}
}

// ==========================================
// Public API Methods
// ==========================================

const getFirstInput = (inputs: FormInputItem[] = inputData.value): FormInputItem | null => {
  for (const input of inputs) {
    if (input.type === 'formBuilder' && Array.isArray(input.inputs)) {
      const nested = getFirstInput(input.inputs)
      if (nested) return nested
    } else {
      return input
    }
  }
  return null
}

/**
 * Focuses the first available interactive form input field.
 */
const focus = (): void => {
  const firstInput = getFirstInput()
  if (!firstInput) return
  const targetKey = `input-${firstInput.name}-${firstInput.uid || ''}`
  const targetRef = inputRefs.value[targetKey]
  if (targetRef) {
    if (typeof targetRef.focus === 'function') {
      targetRef.focus()
    } else if (targetRef.$el && typeof targetRef.$el.focus === 'function') {
      targetRef.$el.focus()
    }
  }
}

/**
 * Returns the current evaluated form data matching the active mode.
 */
const getFormData = (): FormDataObject => {
  return buildFormData(inputData.value)
}

/**
 * Ingests and applies a new form data payload to the current inputs schema.
 */
const setFormData = (data: FormDataObject): void => {
  if (isSyncingFromInputs || !data) return
  isSyncingFromFormData = true
  applyFormDataToInputs(data, inputData.value)
  syncState()
  nextTick(() => {
    isSyncingFromFormData = false
  })
}

/**
 * Finds a schema item definition by its `name`.
 */
const getInputsByName = (
    name: string,
    inputs: FormInputItem[] = inputData.value
): FormInputItem | undefined => {
  for (const input of inputs) {
    if (input.name === name) return input
    if (input.type === 'formBuilder' && Array.isArray(input.inputs)) {
      const nested = getInputsByName(name, input.inputs)
      if (nested) return nested
    }
  }
  return undefined
}

/**
 * Updates a specific input's value by name and triggers sync.
 */
const setInputByName = (name: string, value: any): void => {
  const target = getInputsByName(name)
  if (target) {
    target.value = value
    syncState()
  }
}

/**
 * Maps an external response object to inputs matching their `responseKey`.
 */
const setInputValues = (
    responseData: Record<string, any>,
    inputs: FormInputItem[] = inputData.value
): void => {
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    if (input.type === 'formBuilder' && Array.isArray(input.inputs)) {
      setInputValues(responseData, input.inputs)
      continue
    }
    if (input.responseKey) {
      input.value = shvl.get(responseData, input.responseKey)
    }
  }
  syncState()
}

/**
 * Resets all input values to null or empty objects.
 */
const clearValues = (inputs: FormInputItem[] = inputData.value): void => {
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    if (input.type === 'formBuilder') {
      input.value = {}
      if (Array.isArray(input.inputs)) {
        clearValues(input.inputs)
      }
    } else {
      input.value = null
    }
  }
  syncState()
}

/**
 * Batch-updates the disable state across all form items.
 */
const disableAllInputs = (status: boolean, inputs: FormInputItem[] = inputData.value): void => {
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    if (input.type === 'formBuilder' && Array.isArray(input.inputs)) {
      disableAllInputs(status, input.inputs)
    } else {
      input.disable = status
    }
  }
}

/**
 * Batch-updates the readonly state across all form items.
 */
const readonlyAllInputs = (status: boolean, inputs: FormInputItem[] = inputData.value): void => {
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    if (input.type === 'formBuilder' && Array.isArray(input.inputs)) {
      readonlyAllInputs(status, input.inputs)
    } else {
      input.readonly = status
    }
  }
}

// ==========================================
// Event Listeners
// ==========================================

const onFieldValueUpdate = (input: FormInputItem, value: any): void => {
  input.value = value
  syncState()
}

const onNestedFormDataUpdated = (input: FormInputItem, value: any): void => {
  if (input.type === 'formBuilder' && props.formDataMode !== 'flat') {
    input.value = value
  }
  syncState()
}

const onInput = (event: Event, inputIndex: number): void => {
  emit('input', {
    event,
    index: inputIndex,
    data: inputData.value
  })
}

const onChange = (event: Event, inputIndex: number): void => {
  emit('change', {
    event,
    index: inputIndex,
    data: inputData.value
  })
}

const onClick = (event: MouseEvent, input: FormInputItem): void => {
  emit('onClick', { event, input })
}

// ==========================================
// Watchers & Lifecycle Hooks
// ==========================================

// در FormBuilder.vue (Core)
watch(
    () => props.inputs || props.value,
    (newInputs) => {
      if (isSyncingFromInputs) return // این فلگ خیلی مهمه!
      if (!newInputs || !Array.isArray(newInputs)) return

      // اگر دیتای ورودی دقیقاً همین رفرنس فعلی هست کاری نکن
      if (newInputs === inputData.value) return

      // اگر فقط مقادیر value تغییر کرده‌اند، ساختار رو از اول نساز
      if (inputData.value.length === newInputs.length) {
        let isStructureSame = true
        for (let i = 0; i < newInputs.length; i++) {
          if (inputData.value[i]?.name !== newInputs[i]?.name || inputData.value[i]?.type !== newInputs[i]?.type) {
            isStructureSame = false
            break
          }
        }
        if (isStructureSame) {
          // ساختار یکیه، فقط مقدارها رو سینک کن بدون بازسازی کل DOM
          for (let i = 0; i < newInputs.length; i++) {
            if (inputData.value[i].value !== newInputs[i].value) {
              inputData.value[i].value = newInputs[i].value
            }
          }
          return
        }
      }

      // اگر ساختار واقعاً عوض شده (مثلاً فیلدی کم یا زیاد شده):
      setInputs(newInputs)
      if (props.formData && Object.keys(props.formData).length > 0) {
        applyFormDataToInputs(props.formData)
      }
    },
    { immediate: true } // 👈 deep: true را از اینجا هم بردار!
)

watch(
    () => props.formData,
    (newFormData) => {
      if (isSyncingFromInputs) return
      if (!newFormData || Object.keys(newFormData).length === 0) {
        return
      }
      applyFormDataToInputs(newFormData)
    },
    { deep: true }
)

onMounted(() => {
  setUidForInputs()
})

onBeforeUnmount(() => {
  inputRefs.value = {}
})

defineExpose({
  focus,
  flattenFormData,
  getFormData,
  setFormData,
  getInputsByName,
  setInputByName,
  setInputValues,
  clearValues,
  disableAllInputs,
  readonlyAllInputs
})
</script>

<style lang="scss" scoped>
.form-builder-container {
  box-sizing: border-box;
}

.hidden-col {
  display: none !important;
  padding: 0 !important;
  margin: 0 !important;
}
</style>
