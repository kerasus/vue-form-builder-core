<script setup lang="ts">
import { computed } from 'vue'

interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  modelValue?: string | number | null
  label?: string
  name?: string
  id?: string
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  name: '',
  id: '',
  options: () => [],
  placeholder: '',
  disabled: false,
  readonly: false,
  required: false
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | number | null): void
  (event: 'change', value: Event): void
}>()

const selectId = computed(() => {
  return props.id || (props.name ? `form-builder-select-${props.name}` : undefined)
})

const handleChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  const selectedOption = props.options.find(
      option => String(option.value) === target.value
  )

  emit('update:modelValue', selectedOption?.value ?? null)
  emit('change', event)
}
</script>

<template>
  <div class="form-builder-select">
    <label
        v-if="label"
        class="form-builder-select__label"
        :for="selectId"
    >
      {{ label }}
    </label>

    <select
        :id="selectId"
        class="form-builder-select__control"
        :name="name || undefined"
        :value="modelValue ?? ''"
        :disabled="disabled || readonly"
        :required="required"
        :aria-readonly="readonly"
        @change="handleChange"
    >
      <option
          v-if="placeholder"
          value=""
          disabled
      >
        {{ placeholder }}
      </option>

      <option
          v-for="option in options"
          :key="String(option.value)"
          :value="option.value"
          :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
