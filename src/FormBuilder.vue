<template>
  <div class="row form-builder-container" :class="customClass">
    <div
        v-for="(input, inputIndex) in inputData"
        :key="input.uid || inputIndex"
        :class="['form-builder-col', getComponentCol(input)]"
        :style="getComponentStyle(input)"
    >
      <!-- Dynamic Form Field Component -->
      <component
          :model-value="input.value"
          :is="resolveComponent(input)"
          :ref="(el: any) => setInputRef(el, input)"
          v-bind="getComponentProps(input)"
          :loading="loading || input.loading"
          :disabled="disabled || input.disabled"
          :readonly="readonly || input.readonly"
          @update:model-value="(value: any) => onFieldValueUpdate(input, value)"
          @update:form-data="(value: any) => onNestedFormDataUpdated(input, value)"
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
  nextTick,
  markRaw,
  toRaw,
  type Component,
  type CSSProperties,
  type Ref
} from 'vue'
import * as shvl from 'shvl'

// Native Component Imports
import FormBuilderInput from './components/FormBuilderInput.vue'
import FormBuilderFile from './components/FormBuilderFile.vue'
import FormBuilderTextarea from './components/FormBuilderTextarea.vue'
import FormBuilderSelect from './components/FormBuilderSelect.vue'
import FormBuilderCheckbox from './components/FormBuilderCheckbox.vue'
import FormBuilderRadio from './components/FormBuilderRadio.vue'
import FormBuilderHidden from './components/FormBuilderHidden.vue'

defineOptions({
  name: 'FormBuilder'
})

// --- Types & Interfaces ---
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
  disabled?: boolean
  readonly?: boolean
  multiple?: boolean
  rows?: number
  options?: Array<string | number | FormInputOption>
  inputs?: FormInputItem[]
  responseKey?: string
  customClass?: string
  [key: string]: any
}

export type FormDataObject = Record<string, any>

interface Props {
  inputs?: FormInputItem[]
  value?: FormInputItem[] // Backward compatibility alias
  formData?: FormDataObject
  formDataMode?: FormDataMode
  readonly?: boolean
  disabled?: boolean
  loading?: boolean
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  inputs: undefined,
  value: undefined,
  formData: () => ({}),
  readonly: false,
  disabled: false,
  customClass: ''
})

const emit = defineEmits<{
  (e: 'update:inputs', value: FormInputItem[]): void
  (e: 'update:value', value: FormInputItem[]): void
  (e: 'update:formData', value: FormDataObject): void
  (e: 'input', payload: { event: Event; index: number; data: FormInputItem[] }): void
  (e: 'change', payload: { event: Event; index: number; data: FormInputItem[] }): void
  (e: 'onClick', payload: { event: MouseEvent; input: FormInputItem }): void
}>()

// --- State ---
const inputData = ref<FormInputItem[]>([]) as Ref<FormInputItem[]>
const inputRefs = ref<Record<string, any>>({})

let isSyncingFromFormData = false
let isSyncingFromInputs = false

// عددمحور کردن UID برای بهینه‌سازی سرعت تولید و حافظه
let uidCounter = 0
const generateSimpleUid = (): string => {
  uidCounter += 1
  return `fb-id-${uidCounter}`
}

// --- Internal Helper Methods ---

// Assign unique UIDs recursively using simple counter
const setUidForInputs = (inputs: FormInputItem[] = inputData.value): void => {
  inputs.forEach((input) => {
    if (!input.uid) {
      input.uid = generateSimpleUid()
    }

    if (input.type === 'formBuilder' && Array.isArray(input.inputs)) {
      setUidForInputs(input.inputs)
    }
  })
}

// Recursively extract formData key-value mapping from inputs array
const extractFormData = (inputs: FormInputItem[] = inputData.value): FormDataObject => {
  const data: FormDataObject = {}

  inputs.forEach((input) => {
    if (!input.name) return

    if (input.type === 'formBuilder' && Array.isArray(input.inputs)) {
      data[input.name] = input.value ?? extractFormData(input.inputs)
    } else {
      data[input.name] = input.value !== undefined ? input.value : null
    }
  })

  return data
}

const flattenFormData = (data: FormDataObject): FormDataObject => {
  const result: FormDataObject = {}

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenFormData(value))
    } else {
      result[key] = value
    }
  })

  return result
}

// Recursively apply formData key-value updates to inputs schema
const applyFormDataToInputs = (
    formData: FormDataObject,
    inputs: FormInputItem[] = inputData.value
): void => {
  if (!formData || typeof formData !== 'object') return

  inputs.forEach((input) => {
    if (!input.name || !(input.name in formData)) return

    const incomingValue = formData[input.name]

    if (
        input.type === 'formBuilder' &&
        Array.isArray(input.inputs) &&
        incomingValue &&
        typeof incomingValue === 'object'
    ) {
      applyFormDataToInputs(incomingValue, input.inputs)
      input.value = { ...incomingValue }
    } else {
      input.value = incomingValue
    }
  })
}

// Sync and notify parent/listeners
const syncState = (): void => {
  if (isSyncingFromFormData) return

  isSyncingFromInputs = true
  const calculatedFormData = extractFormData(inputData.value)

  emit('update:inputs', inputData.value)
  emit('update:value', inputData.value)

  const finalFormData =
      props.formDataMode === 'flat'
          ? flattenFormData(calculatedFormData)
          : calculatedFormData

  emit('update:formData', finalFormData)

  nextTick(() => {
    isSyncingFromInputs = false
  })
}

// Register DOM / Component refs dynamically
const setInputRef = (el: any, input: FormInputItem): void => {
  if (!input.name) return
  const key = `input-${input.name}-${input.uid || ''}`
  if (el) {
    inputRefs.value[key] = el
  } else {
    delete inputRefs.value[key]
  }
}

const setInputs = (newInputs: FormInputItem[]): void => {
  inputData.value = newInputs.map((input) => {
    if (typeof input.type === 'object' || typeof input.type === 'function') {
      return {
        ...input,
        type: markRaw(toRaw(input.type))
      }
    }
    return { ...input }
  })
  setUidForInputs(inputData.value)
}

// --- Dynamic Component Rendering Logic ---

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
  if (typeof input.type === 'string' && nativeComponentMap[input.type]) {
    return nativeComponentMap[input.type]
  }
  return FormBuilderInput
}

const getComponentProps = (input: FormInputItem): Record<string, any> => {
  const { col, customClass, value, uid, ...rest } = input

  if (input.type === 'formBuilder') {
    return {
      ...rest,
      formData: value || {}
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
    return { display: 'none', padding: 0, margin: 0 }
  }
  return {}
}

// --- Exposed Form API Methods ---

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

const getFormData = (): FormDataObject => {
  return extractFormData(inputData.value)
}

const setFormData = (data: FormDataObject): void => {
  if (isSyncingFromInputs || !data) return
  isSyncingFromFormData = true
  applyFormDataToInputs(data, inputData.value)
  syncState()
  nextTick(() => {
    isSyncingFromFormData = false
  })
}

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

const setInputByName = (name: string, value: any): void => {
  const target = getInputsByName(name)
  if (target) {
    target.value = value
    syncState()
  }
}

const setInputValues = (
    responseData: Record<string, any>,
    inputs: FormInputItem[] = inputData.value
): void => {
  inputs.forEach((input) => {
    if (input.type === 'formBuilder' && Array.isArray(input.inputs)) {
      setInputValues(responseData, input.inputs)
      return
    }
    if (input.responseKey) {
      input.value = shvl.get(responseData, input.responseKey)
    }
  })
  syncState()
}

const clearValues = (inputs: FormInputItem[] = inputData.value): void => {
  inputs.forEach((input) => {
    if (input.type === 'formBuilder') {
      input.value = {}
      if (Array.isArray(input.inputs)) {
        clearValues(input.inputs)
      }
    } else {
      input.value = null
    }
  })
  syncState()
}

const disableAllInputs = (status: boolean, inputs: FormInputItem[] = inputData.value): void => {
  inputs.forEach((input) => {
    if (input.type === 'formBuilder' && Array.isArray(input.inputs)) {
      disableAllInputs(status, input.inputs)
    } else {
      input.disabled = status
    }
  })
}

const readonlyAllInputs = (status: boolean, inputs: FormInputItem[] = inputData.value): void => {
  inputs.forEach((input) => {
    if (input.type === 'formBuilder' && Array.isArray(input.inputs)) {
      readonlyAllInputs(status, input.inputs)
    } else {
      input.readonly = status
    }
  })
}

// --- Event Handlers ---

const onFieldValueUpdate = (input: FormInputItem, value: any): void => {
  input.value = value
  syncState()
}

const onNestedFormDataUpdated = (input: FormInputItem, value: any): void => {
  if (input.type === 'formBuilder') {
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

// --- Watchers & Lifecycle ---

watch(
    () => props.inputs || props.value,
    (newInputs) => {
      if (isSyncingFromInputs) return
      if (newInputs && Array.isArray(newInputs)) {
        setInputs(newInputs)
        setUidForInputs()
        if (props.formData && Object.keys(props.formData).length > 0) {
          applyFormDataToInputs(props.formData)
        }
      }
    },
    { immediate: true, deep: true }
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

// Expose public API methods for template refs
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
