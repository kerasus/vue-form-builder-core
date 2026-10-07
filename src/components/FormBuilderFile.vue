<template>
  <div
      class="form-builder-field"
      :class="{
      'has-error': Boolean(errorMessage),
      'is-validating': isValidating,
      'is-disabled': disabled,
      'has-file': hasFile
    }"
  >
    <label v-if="label" :for="name" class="form-builder-label">
      {{ label }}
    </label>

    <div class="form-builder-file-wrapper">
      <input
          :id="name"
          ref="fileRef"
          type="file"
          :name="name"
          :disabled="disabled"
          :multiple="multiple"
          :accept="accept"
          class="form-builder-native-file-input"
          :aria-invalid="Boolean(errorMessage)"
          :aria-describedby="errorMessage ? `${name}-error` : undefined"
          @change="onChange"
          @click="onClick"
      />

      <span v-if="isValidating" class="form-builder-spinner" role="status" aria-live="polite"></span>
    </div>

    <div
        v-if="errorMessage"
        :id="`${name}-error`"
        class="form-builder-error"
        role="alert"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, toRef, watch } from 'vue'
import { useInputRules } from '../composables/useInputRules'

export type FileModelValue = File | File[] | FileList | null

export interface Props {
  name: string
  modelValue?: FileModelValue
  label?: string
  disabled?: boolean
  multiple?: boolean
  accept?: string
  /** Validation rules definition (e.g. 'required' or custom validator functions) */
  rules?: unknown
  /** Trigger validation immediately when a file is selected */
  validateOnChange?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  disabled: false,
  multiple: false,
  accept: '',
  rules: undefined,
  validateOnChange: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: File | File[] | null): void
  (e: 'change', event: Event): void
  (e: 'click', event: MouseEvent): void
  (e: 'validation', status: { valid: boolean; error: string | null }): void
}>()

const fileRef = ref<HTMLInputElement | null>(null)
const errorMessage = ref<string | null>(null)
const isValidating = ref<boolean>(false)
const isTouched = ref<boolean>(false)

// Resolve validation rules dynamically
const { parsedRules } = useInputRules({
  rules: toRef(props, 'rules'),
  label: toRef(props, 'label')
})

const hasFile = computed<boolean>(() => {
  if (!props.modelValue) return false
  if (Array.isArray(props.modelValue)) return props.modelValue.length > 0
  if (typeof FileList !== 'undefined' && props.modelValue instanceof FileList) {
    return props.modelValue.length > 0
  }
  return true
})

/**
 * Validates the selected file(s) against resolved validation rules.
 */
const validate = async (val: unknown = props.modelValue): Promise<boolean> => {
  const rulesList = parsedRules.value

  if (!Array.isArray(rulesList) || rulesList.length === 0) {
    errorMessage.value = null
    emit('validation', { valid: true, error: null })
    return true
  }

  isValidating.value = true

  try {
    for (const rule of rulesList) {
      if (typeof rule !== 'function') continue

      const result = await rule(val)

      if (result !== true) {
        const errorText = typeof result === 'string' ? result : 'Validation error'
        errorMessage.value = errorText
        emit('validation', { valid: false, error: errorText })
        return false
      }
    }

    errorMessage.value = null
    emit('validation', { valid: true, error: null })
    return true
  } finally {
    isValidating.value = false
  }
}

/**
 * Resets the validation state and clears any existing error message.
 */
const resetValidation = (): void => {
  errorMessage.value = null
  isValidating.value = false
  isTouched.value = false
}

/**
 * Clears the input selection and resets the internal file value.
 */
const reset = (): void => {
  if (fileRef.value) {
    fileRef.value.value = ''
  }
  emit('update:modelValue', null)
  resetValidation()
}

/**
 * Handles file input change events, emits model updates, and triggers validation.
 */
const onChange = async (event: Event): Promise<void> => {
  const target = event.target as HTMLInputElement
  isTouched.value = true

  let selectedFiles: File | File[] | null = null

  if (target.files && target.files.length > 0) {
    selectedFiles = props.multiple ? Array.from(target.files) : (target.files[0] || null)
  }

  emit('update:modelValue', selectedFiles)
  emit('change', event)

  if (props.validateOnChange) {
    await validate(selectedFiles)
  }
}

const onClick = (event: MouseEvent): void => {
  emit('click', event)
}

const focus = (): void => {
  fileRef.value?.focus()
}

// Watch modelValue changes externally (e.g. form reset from parent)
watch(
    () => props.modelValue,
    async (newVal) => {
      if (!newVal && fileRef.value) {
        fileRef.value.value = ''
      }
      if (isTouched.value) {
        await validate(newVal)
      }
    }
)

// Re-validate if active rules or locale changes
watch(
    () => parsedRules.value,
    async () => {
      if (isTouched.value || errorMessage.value) {
        await validate(props.modelValue)
      }
    }
)

defineExpose({
  focus,
  reset,
  validate,
  resetValidation,
  errorMessage,
  isValidating,
  fileRef
})
</script>
