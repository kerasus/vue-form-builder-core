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

    <div class="form-builder-input-wrapper">
      <input
          :id="name"
          ref="inputRef"
          :value="modelValue"
          :type="type"
          :name="name"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          class="form-builder-native-input"
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
  modelValue?: string | number | null
  type?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  /** Validation rules definition (e.g. 'required|email' or array of rules) */
  rules?: unknown
  /** Trigger validation immediately on input once touched or errored */
  validateOnInput?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  rules: undefined,
  validateOnInput: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'input', event: Event): void
  (e: 'blur', event: FocusEvent): void
  (e: 'change', event: Event): void
  (e: 'click', event: MouseEvent): void
  (e: 'validation', status: { valid: boolean; error: string | null }): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const errorMessage = ref<string | null>(null)
const isValidating = ref<boolean>(false)
const isTouched = ref<boolean>(false)

// Resolve validation rules reactively via composable
const { parsedRules } = useInputRules({
  rules: toRef(props, 'rules'),
  label: toRef(props, 'label')
})

/**
 * Validates the current input value against resolved validation rules.
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

const onInput = async (event: Event): Promise<void> => {
  const target = event.target as HTMLInputElement
  const val = target.value
  emit('update:modelValue', val)
  emit('input', event)

  if (props.validateOnInput && (isTouched.value || errorMessage.value)) {
    await validate(val)
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

const focus = (): void => {
  inputRef.value?.focus()
}

// Re-validate if modelValue changes externally after field was already touched
watch(
    () => props.modelValue,
    async (newVal) => {
      if (isTouched.value) {
        await validate(newVal)
      }
    }
)

// Re-validate when rules or active locale changes to update the error message text
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
  inputRef
})
</script>
