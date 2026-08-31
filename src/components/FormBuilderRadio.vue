<template>
  <div class="form-builder-field">
    <span v-if="label" class="form-builder-label">{{ label }}</span>
    <div
        v-for="(option, index) in options"
        :key="index"
        class="form-builder-radio-item"
    >
      <input
          :id="`${name}-${index}`"
          ref="radioRefs"
          type="radio"
          :name="name"
          :value="getOptionValue(option)"
          :checked="modelValue === getOptionValue(option)"
          :disabled="disabled"
          class="form-builder-radio"
          @change="onChange(getOptionValue(option), $event)"
      />
      <label :for="`${name}-${index}`">
        {{ getOptionLabel(option) }}
      </label>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

export interface RadioOption {
  label?: string
  value?: any
  [key: string]: any
}

interface Props {
  name: string
  modelValue?: any
  label?: string
  disabled?: boolean
  options?: Array<string | number | RadioOption>
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  disabled: false,
  options: () => []
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'change', event: Event): void
}>()

const radioRefs = ref<HTMLInputElement[]>([])

const getOptionValue = (option: string | number | RadioOption): any => {
  if (typeof option === 'object' && option !== null) {
    return option.value !== undefined ? option.value : option.label
  }
  return option
}

const getOptionLabel = (option: string | number | RadioOption): string => {
  if (typeof option === 'object' && option !== null) {
    return option.label !== undefined ? option.label : String(option.value)
  }
  return String(option)
}

const onChange = (value: any, event: Event): void => {
  emit('update:modelValue', value)
  emit('change', event)
}

const focus = (): void => {
  radioRefs.value[0]?.focus()
}

defineExpose({
  focus
})
</script>
