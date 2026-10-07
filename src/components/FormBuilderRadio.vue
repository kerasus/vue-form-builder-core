<template>
  <fieldset
      class="form-builder-radio-group"
      :class="{
      'has-error': Boolean(errorMessage),
      'is-validating': isValidating,
      'is-disabled': disabled
    }"
      :aria-invalid="Boolean(errorMessage)"
      :aria-describedby="errorMessage ? `${name}-error` : undefined"
  >
    <legend v-if="label" class="form-builder-radio-legend">
      {{ label }}
    </legend>

    <div class="form-builder-radio-options">
      <div
          v-for="(option, index) in options"
          :key="index"
          class="form-builder-radio-item"
          :class="{
          'is-checked': modelValue === getOptionValue(option),
          'is-disabled': disabled || isOptionDisabled(option)
        }"
      >
        <input
            :id="`${name}-${index}`"
            :ref="(el) => setRadioRef(el as HTMLInputElement | null, index)"
            type="radio"
            :name="name"
            :value="getOptionValue(option)"
            :checked="modelValue === getOptionValue(option)"
            :disabled="disabled || isOptionDisabled(option)"
            class="form-builder-radio-native-input"
            @change="onChange(getOptionValue(option), $event)"
            @click="onClick"
        />

        <label :for="`${name}-${index}`" class="form-builder-radio-label">
          {{ getOptionLabel(option) }}
        </label>
      </div>
    </div>

    <div
        v-if="errorMessage"
        :id="`${name}-error`"
        class="form-builder-error"
        role="alert"
    >
      {{ errorMessage }}
    </div>
  </fieldset>
</template>

<script lang="ts" setup>
import { ref, watch, toRef, onBeforeUpdate } from 'vue'
import { useInputRules } from '../composables/useInputRules'

export interface RadioOption {
  label?: string
  value?: any
  disabled?: boolean
  [key: string]: any
}

export interface Props {
  name: string
  modelValue?: any
  label?: string
  disabled?: boolean
  options?: Array<string | number | RadioOption>
  /** Validation rules definition (e.g. 'required') */
  rules?: unknown
  /** Trigger validation immediately when selection changes */
  validateOnChange?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  disabled: false,
  options: () => [],
  rules: undefined,
  validateOnChange: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'change', event: Event): void
  (e: 'click', event: MouseEvent): void
  (e: 'validation', status: { valid: boolean; error: string | null }): void
}>()

const radioRefs = ref<(HTMLInputElement | null)[]>([])
const errorMessage = ref<string | null>(null)
const isValidating = ref<boolean>(false)
const isTouched = ref<boolean>(false)

// Resolve validation rules dynamically from the centralized engine
const { parsedRules } = useInputRules({
  rules: toRef(props, 'rules'),
  label: toRef(props, 'label')
})

// Reset element refs before each template render update
onBeforeUpdate(() => {
  radioRefs.value = []
})

const setRadioRef = (el: HTMLInputElement | null, index: number): void => {
  if (el) {
    radioRefs.value[index] = el
  }
}

/**
 * Normalizes the value for a radio option.
 */
const getOptionValue = (option: string | number | RadioOption): any => {
  if (typeof option === 'object' && option !== null) {
    return option.value !== undefined ? option.value : option.label
  }
  return option
}

/**
 * Normalizes the display label for a radio option.
 */
const getOptionLabel = (option: string | number | RadioOption): string => {
  if (typeof option === 'object' && option !== null) {
    return option.label !== undefined ? option.label : String(option.value)
  }
  return String(option)
}

/**
 * Determines whether a specific option is disabled.
 */
const isOptionDisabled = (option: string | number | RadioOption): boolean => {
  if (typeof option === 'object' && option !== null) {
    return Boolean(option.disabled)
  }
  return false
}

/**
 * Validates the currently selected radio value against defined rules.
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
 * Handles selection change, triggers two-way binding, and runs validation if active.
 */
const onChange = async (value: any, event: Event): Promise<void> => {
  isTouched.value = true
  emit('update:modelValue', value)
  emit('change', event)

  if (props.validateOnChange) {
    await validate(value)
  }
}

const onClick = (event: MouseEvent): void => {
  emit('click', event)
}

/**
 * Programmatically focuses the checked radio button, or the first available option.
 */
const focus = (): void => {
  const checkedInput = radioRefs.value.find((input) => input?.checked && !input?.disabled)
  const firstEnabledInput = radioRefs.value.find((input) => input && !input.disabled)
  ;(checkedInput || firstEnabledInput || radioRefs.value[0])?.focus()
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
  radioRefs
})
</script>
