<template>
  <input
      :id="name"
      ref="hiddenRef"
      type="hidden"
      :name="name"
      :value="normalizedValue"
  />
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

export interface Props {
  name: string
  modelValue?: string | number | boolean | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
})

const hiddenRef = ref<HTMLInputElement | null>(null)

/**
 * Normalizes model value to a safe HTML input value string.
 */
const normalizedValue = computed<string>(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return ''
  }
  return String(props.modelValue)
})

/**
 * Formal validate method for form lifecycle consistency.
 * Always resolves to true unless extended.
 */
const validate = async (): Promise<boolean> => {
  return true
}

/**
 * Resets the validation state for form lifecycle consistency.
 */
const resetValidation = (): void => {
  // No-op for hidden inputs
}

defineExpose({
  hiddenRef,
  validate,
  resetValidation
})
</script>
