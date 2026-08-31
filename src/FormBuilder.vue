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
          :is="resolveComponent(input)"
          :ref="(el: any) => setInputRef(el, input)"
          :model-value="input.value"
          v-bind="getComponentProps(input)"
          :disabled="disable || input.disabled"
          :readonly="input.readonly"
          @update:model-value="(value: any) => onFieldValueUpdate(input, value)"
          @update:form-data="(value: any) => onNestedFormDataUpdated(input, value)"
          @input="onInput($event, inputIndex)"
          @change="onChange($event, inputIndex)"
          @click="onClick($event, input)"
      >
        <template
            v-for="name in getCustomComponentSlots(input)"
            :key="name"
            #[name]="slotProps"
        >
          <slot :name="name" v-bind="slotProps || {}" />
        </template>
      </component>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, defineAsyncComponent, type Component, type CSSProperties } from 'vue'
import {
  useFormBuilder,
  type FormInputItem,
  type FormDataObject
} from './composables/useFormBuilder'

// Native Component Imports
import FormBuilderInput from './components/FormBuilderInput.vue'
import FormBuilderFile from './components/FormBuilderFile.vue'
import FormBuilderTextarea from './components/FormBuilderTextarea.vue'
import FormBuilderSelect from './components/FormBuilderSelect.vue'
import FormBuilderCheckbox from './components/FormBuilderCheckbox.vue'
import FormBuilderRadio from './components/FormBuilderRadio.vue'
import FormBuilderHidden from './components/FormBuilderHidden.vue'

// Self-Registration for Recursive Nested FormBuilder
const AsyncFormBuilder = defineAsyncComponent(() => import('./FormBuilder.vue'))

interface Props {
  inputs?: FormInputItem[]
  value?: FormInputItem[] // Backward compatibility alias
  formData?: FormDataObject
  disable?: boolean
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  inputs: undefined,
  value: undefined,
  formData: () => ({}),
  disable: false,
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

const nestedFormData = ref<Record<string, any>>({})

// Initialize Composable
const {
  inputData,
  setInputRef,
  setUidForInputs,
  setInputs,
  syncState,
  applyFormDataToInputs,
  focus,
  getFormData,
  setFormData,
  getInputsByName,
  setInputByName,
  setInputValues,
  clearValues,
  disableAllInputs,
  readonlyAllInputs
} = useFormBuilder({
  onUpdateInputs: (updatedInputs) => {
    emit('update:inputs', updatedInputs)
    emit('update:value', updatedInputs)
  },
  onUpdateFormData: (updatedFormData) => {
    emit('update:formData', updatedFormData)
  }
})

// Native component mapping
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

// Watch inputs from outside
watch(
    () => props.inputs || props.value,
    (newInputs) => {
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

// Watch formData from outside (in case parent resets/updates it)
watch(
    () => props.formData,
    (newFormData) => {
      if (!newFormData || Object.keys(newFormData).length === 0) {
        return
      }

      applyFormDataToInputs(newFormData)
    },
    {
      deep: true
    }
)

onMounted(() => {
  setUidForInputs()
})

const resolveComponent = (input: FormInputItem): Component | string => {
  if (typeof input.type === 'object' || typeof input.type === 'function') {
    return input.type as Component
  }
  if (input.type === 'formBuilder') {
    return AsyncFormBuilder
  }
  if (typeof input.type === 'string' && nativeComponentMap[input.type]) {
    return nativeComponentMap[input.type]
  }
  return FormBuilderInput
}

const getComponentProps = (input: FormInputItem): Record<string, any> => {
  const {
    col,
    customClass,
    value,
    uid,
    ...rest
  } = input

  return rest
}

const getCustomComponentSlots = (input: FormInputItem): string[] => {
  if (typeof input.type !== 'object' || !input.type) return []
  const data = typeof (input.type as any).data === 'function' ? (input.type as any).data() : (input.type as any).data
  return data && Array.isArray(data.slots) ? data.slots : []
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

const onFieldValueUpdate = (
    input: FormInputItem,
    value: any
): void => {
  input.value = value
  syncState()
}

const onNestedFormDataUpdated = (
    input: FormInputItem,
    value: any
): void => {
  if (input.type === 'formBuilder') {
    input.value = value
  }

  syncState()
}

const onInput = (
    event: Event,
    inputIndex: number
): void => {
  emit('input', {
    event,
    index: inputIndex,
    data: inputData.value
  })
}

const onChange = (
    event: Event,
    inputIndex: number
): void => {
  emit('change', {
    event,
    index: inputIndex,
    data: inputData.value
  })
}

const onClick = (event: MouseEvent, input: FormInputItem): void => {
  emit('onClick', { event, input })
}

defineExpose({
  focus,
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
@use '@/assets/scss/grid.scss';

.form-builder-container {
  box-sizing: border-box;
}

.hidden-col {
  display: none !important;
  padding: 0 !important;
  margin: 0 !important;
}
</style>
