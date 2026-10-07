<template>
  <div
      class="form-builder-field"
      :class="{
      'has-error': Boolean(errorMessage),
      'is-validating': isValidating,
      'is-disabled': disabled,
      'is-readonly': readonly
    }"
  >
    <label v-if="label" :for="name" class="form-builder-label">
      {{ label }}
    </label>

    <div class="form-builder-textarea-wrapper">
      <textarea
          :id="name"
          ref="textareaRef"
          :value="modelValue"
          :name="name"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :rows="rows"
          class="form-builder-native-textarea"
          :aria-invalid="Boolean(errorMessage)"
          :aria-describedby="errorMessage ? `${name}-error` : undefined"
          @input="onInput"
          @blur="onBlur"
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
import { ref, watch, toRef } from 'vue'
import { useInputRules } from '../composables/useInputRules'

export interface Props {
  name: string
  modelValue?: string | null
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  rows?: number
  /** Validation rules definition (e.g. 'required|max:500' or custom validator functions) */
  rules?: unknown
  /** Trigger validation on input once the field is touched or already has an error */
  validateOnInput?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  rows: 3,
  rules: undefined,
  validateOnInput: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'input', event: Event): void
  (e: 'blur', event: FocusEvent): void
  (e: 'change', event: Event): void
  (e: 'click', event: MouseEvent): void
  (e: 'validation', status: { valid: boolean; error: string | null }): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const errorMessage = ref<string | null>(null)
const isValidating = ref<boolean>(false)
const isTouched = ref<boolean>(false)

// Centralized validation pipeline resolution
const { parsedRules } = useInputRules({
  rules: toRef(props, 'rules'),
  label: toRef(props, 'label')
})

/**
 * Validates the current textarea value against resolved validation rules.
 * Supports both synchronous and asynchronous rules.
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
 * Handles native input events, syncs the model, and validates lazily.
 */
const onInput = async (event: Event): Promise<void> => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  emit('input', event)

  if (props.validateOnInput && (isTouched.value || errorMessage.value)) {
    await validate(target.value)
  }
}

const onBlur = async (event: FocusEvent): Promise<void> => {
  isTouched.value = true
  emit('blur', event)
  await validate(props.modelValue)
}

const onChange = (event: Event): void => {
  emit('change', event)
}

const onClick = (event: MouseEvent): void => {
  emit('click', event)
}

/**
 * Programmatically focuses the native textarea element.
 */
const focus = (): void => {
  textareaRef.value?.focus()
}

// Watch modelValue changes externally (e.g. programmatic form reset)
watch(
    () => props.modelValue,
    async (newVal) => {
      if (isTouched.value) {
        await validate(newVal)
      }
    }
)

// Re-validate if active rules or active locale changes
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
  validate,
  resetValidation,
  errorMessage,
  isValidating,
  textareaRef
})
</script>
