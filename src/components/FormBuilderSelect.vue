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
    <label v-if="label" :for="selectId" class="form-builder-label">
      {{ label }}
    </label>

    <div class="form-builder-select-wrapper">
      <select
          :id="selectId"
          ref="selectRef"
          :name="name || undefined"
          :value="modelValue ?? ''"
          :disabled="disabled || readonly"
          :aria-readonly="readonly"
          :aria-invalid="Boolean(errorMessage)"
          :aria-describedby="errorMessage ? `${selectId}-error` : undefined"
          class="form-builder-native-select"
          @change="onChange"
          @blur="onBlur"
      >
        <option
            v-if="placeholder"
            value=""
            disabled
            :selected="modelValue === null || modelValue === undefined || modelValue === ''"
        >
          {{ placeholder }}
        </option>

        <option
            v-for="(option, index) in normalizedOptions"
            :key="`${option.value}-${index}`"
            :value="option.value"
            :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>

      <span v-if="isValidating" class="form-builder-spinner" role="status" aria-live="polite"></span>
    </div>

    <div
        v-if="errorMessage"
        :id="`${selectId}-error`"
        class="form-builder-error"
        role="alert"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, toRef } from 'vue'
import { useInputRules } from '../composables/useInputRules'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  [key: string]: any
}

export type RawSelectOption = string | number | SelectOption

export interface Props {
  name: string
  modelValue?: string | number | null
  label?: string
  id?: string
  options?: RawSelectOption[]
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  /** Validation rules definition (e.g. 'required' or custom validator functions) */
  rules?: unknown
  /** Trigger validation immediately when the select value changes */
  validateOnChange?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  id: '',
  options: () => [],
  placeholder: '',
  disabled: false,
  readonly: false,
  rules: undefined,
  validateOnChange: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
  (e: 'change', event: Event): void
  (e: 'blur', event: FocusEvent): void
  (e: 'validation', status: { valid: boolean; error: string | null }): void
}>()

const selectRef = ref<HTMLSelectElement | null>(null)
const errorMessage = ref<string | null>(null)
const isValidating = ref<boolean>(false)
const isTouched = ref<boolean>(false)

const selectId = computed<string>(() => {
  return props.id || (props.name ? `form-builder-select-${props.name}` : 'form-builder-select')
})

// Centralized validation pipeline resolution
const { parsedRules } = useInputRules({
  rules: toRef(props, 'rules'),
  label: toRef(props, 'label')
})

/**
 * Normalizes options into a standard shape of { label, value, disabled }.
 */
const normalizedOptions = computed<SelectOption[]>(() => {
  return props.options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        label: opt.label !== undefined ? String(opt.label) : String(opt.value),
        value: opt.value !== undefined ? opt.value : opt.label,
        disabled: Boolean(opt.disabled)
      }
    }
    return {
      label: String(opt),
      value: opt,
      disabled: false
    }
  })
})

/**
 * Validates the currently selected value against resolved validation rules.
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
 * Resets the validation state and clears any current error message.
 */
const resetValidation = (): void => {
  errorMessage.value = null
  isValidating.value = false
  isTouched.value = false
}

/**
 * Handles select change event, finds matching typed value, and triggers validation.
 */
const onChange = async (event: Event): Promise<void> => {
  const target = event.target as HTMLSelectElement
  isTouched.value = true

  const matched = normalizedOptions.value.find(
      (opt) => String(opt.value) === target.value
  )
  const resolvedValue = matched ? matched.value : (target.value === '' ? null : target.value)

  emit('update:modelValue', resolvedValue)
  emit('change', event)

  if (props.validateOnChange) {
    await validate(resolvedValue)
  }
}

const onBlur = async (event: FocusEvent): Promise<void> => {
  isTouched.value = true
  emit('blur', event)
  await validate(props.modelValue)
}

/**
 * Programmatically focuses the native select element.
 */
const focus = (): void => {
  selectRef.value?.focus()
}

// Watch modelValue changes externally
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
  selectRef
})
</script>
