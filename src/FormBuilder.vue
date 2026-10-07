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
  shallowRef,
  watch,
  toRaw,
  markRaw,
  provide,
  nextTick,
  useAttrs,
  onMounted,
  onBeforeUnmount,
  type Component,
  type CSSProperties,
  type Ref
} from 'vue'
import * as shvl from 'shvl'
import {
  createFormBuilderValidation,
  FORM_VALIDATOR_KEY,
  type ValidationConfig,
  type ValidationRule
} from './composables/useInputRules'

// Standard Built-in Form Components
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
  /** Data resolution strategy: 'nested' preserves hierarchy, 'flat' flattens sub-builders */
  formDataMode?: FormDataMode
  /** Map of registered custom UI components */
  customComponents?: Record<string, Component>
  /** Optional i18n translation delegate */
  i18n?: ValidationConfig['i18n']
  /** Custom validation rules merged into engine */
  customRules?: Record<string, ValidationRule>
  /** Active locale identifier (e.g. 'fa' | 'en') */
  locale?: string
  /** Custom rule messages dictionary */
  messages?: ValidationConfig['messages']
}

export interface FormValidationReport {
  valid: boolean
  errors: Record<string, string | null>
}

const props = withDefaults(defineProps<FormBuilderProps>(), {
  inputs: undefined,
  value: undefined,
  formData: () => ({}),
  formDataMode: 'nested',
  customComponents: () => ({}),
  i18n: undefined,
  customRules: () => ({}),
  locale: 'fa',
  messages: undefined
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
// Validation Pipeline (Provide / Inject)
// ==========================================

const validator = createFormBuilderValidation({
  locale: props.locale,
  i18n: props.i18n,
  customRules: props.customRules,
  messages: props.messages
})

provide(FORM_VALIDATOR_KEY, validator)

const attrs = useAttrs()

// ==========================================
// Internal State
// ==========================================

const inputData = ref<FormInputItem[]>([]) as Ref<FormInputItem[]>
const inputRefs = shallowRef<Record<string, any>>({})

let isSyncingFromFormData = false
let isSyncingFromInputs = false
let uidCounter = 0

const generateSimpleUid = (): string => {
  uidCounter += 1
  return `fb-id-${uidCounter}`
}

// ==========================================
// Status Resolvers (Cascading tri-state)
// ==========================================

const resolveReadonly = (input: FormInputItem): boolean => {
  if (attrs.readonly !== undefined) return attrs.readonly as boolean
  return !!input.readonly
}

const resolveDisable = (input: FormInputItem): boolean => {
  if (attrs.disable !== undefined) return attrs.disable as boolean
  return !!input.disable
}

const resolveLoading = (input: FormInputItem): boolean => {
  if (attrs.loading !== undefined) return attrs.loading as boolean
  return !!input.loading
}

// ==========================================
// Schema & Data Pipeline
// ==========================================

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
        console.warn(`[FormBuilder] Duplicate field key "${input.name}" detected in flat mode.`)
      }
      result[input.name] = input.value !== undefined ? input.value : null
    }
  }
  return result
}

const buildFormData = (inputs: FormInputItem[] = inputData.value): FormDataObject => {
  if (props.formDataMode === 'flat') {
    return flattenGroupInputs(inputs)
  }
  return extractFormData(inputs)
}

const applyFormDataToInputs = (
    formData: FormDataObject,
    inputs?: FormInputItem[]
): void => {
  if (!formData || typeof formData !== 'object') return

  const targetInputs = inputs || inputData.value
  if (!Array.isArray(targetInputs)) return

  for (let i = 0; i < targetInputs.length; i++) {
    const input = targetInputs[i]
    if (!input) continue

    if (input.type === 'formBuilder' && Array.isArray(input.inputs)) {
      if (props.formDataMode === 'flat') {
        applyFormDataToInputs(formData, input.inputs)
      } else if (input.name && input.name in formData) {
        const nestedData = formData[input.name]
        if (nestedData && typeof nestedData === 'object') {
          applyFormDataToInputs(nestedData as FormDataObject, input.inputs)
        }
      }
      continue
    }

    if (!input.name || !(input.name in formData)) {
      continue
    }

    const newVal = formData[input.name]
    if (input.value !== newVal) {
      input.value = newVal
    }
  }
}

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

const registerRef = (el: any, input: FormInputItem): void => {
  if (!input.name) return
  const key = `input-${input.name}-${input.uid || ''}`
  if (el) {
    inputRefs.value[key] = el
  } else {
    delete inputRefs.value[key]
  }
}

const cloneInputItem = (item: FormInputItem): FormInputItem => {
  const cloned: FormInputItem = { ...item }

  if (!cloned.uid) {
    cloned.uid = generateSimpleUid()
  }

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
 * Validates all registered field instances asynchronously.
 */
const validate = async (): Promise<FormValidationReport> => {
  let isAllValid = true
  const errors: Record<string, string | null> = {}

  for (const [key, refInstance] of Object.entries(inputRefs.value)) {
    if (!refInstance) continue

    if (typeof refInstance.validate === 'function') {
      const isValid = await refInstance.validate()
      const fieldError = refInstance.errorMessage || null

      if (!isValid) {
        isAllValid = false
      }
      errors[key] = fieldError
    }
  }

  return {
    valid: isAllValid,
    errors
  }
}

/**
 * Clears errors and validation states on all mounted inputs.
 */
const resetValidation = (): void => {
  for (const refInstance of Object.values(inputRefs.value)) {
    if (refInstance && typeof refInstance.resetValidation === 'function') {
      refInstance.resetValidation()
    }
  }
}

const getFormData = (): FormDataObject => {
  return buildFormData(inputData.value)
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

watch(
    () => props.inputs || props.value,
    (newInputs) => {
      if (isSyncingFromInputs) return
      if (!newInputs || !Array.isArray(newInputs)) return
      if (newInputs === inputData.value) return

      // Fast-path: Synchronize values in-place if structural schema identity is preserved
      if (inputData.value.length === newInputs.length) {
        let isStructureSame = true
        for (let i = 0; i < newInputs.length; i++) {
          if (
              inputData.value[i]?.name !== newInputs[i]?.name ||
              inputData.value[i]?.type !== newInputs[i]?.type
          ) {
            isStructureSame = false
            break
          }
        }
        if (isStructureSame) {
          for (let i = 0; i < newInputs.length; i++) {
            if (inputData.value[i].value !== newInputs[i].value) {
              inputData.value[i].value = newInputs[i].value
            }
          }
          return
        }
      }

      setInputs(newInputs)
      if (props.formData && Object.keys(props.formData).length > 0) {
        applyFormDataToInputs(props.formData)
      }
    },
    { immediate: true }
)

watch(
    () => props.formData,
    (newFormData) => {
      if (isSyncingFromInputs) return
      if (!newFormData || Object.keys(newFormData).length === 0) return
      applyFormDataToInputs(newFormData)
    },
    { deep: true }
)

// Reactively synchronize validation engine settings
watch(
    [
      () => props.locale,
      () => props.i18n,
      () => props.customRules,
      () => props.messages
    ],
    () => {
      validator.updateConfig({
        locale: props.locale,
        i18n: props.i18n,
        customRules: props.customRules,
        messages: props.messages
      })
    },
    { deep: true }
)

onMounted(() => {
  setUidForInputs(inputData.value)
})

onBeforeUnmount(() => {
  inputRefs.value = {}
})

defineExpose({
  focus,
  validate,
  resetValidation,
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
