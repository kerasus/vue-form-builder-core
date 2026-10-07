<template>
  <div
      class="form-builder-checkbox-container"
      :class="{
      'is-disabled': disabled,
      'is-checked': Boolean(modelValue)
    }"
  >
    <input
        :id="name"
        ref="checkboxRef"
        type="checkbox"
        :name="name"
        :checked="!!modelValue"
        :disabled="disabled"
        class="form-builder-checkbox-input"
        @change="onChange"
        @click="onClick"
    />

    <label v-if="label" :for="name" class="form-builder-checkbox-label">
      {{ label }}
    </label>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

export interface Props {
  name: string
  modelValue?: boolean | any
  label?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', event: Event): void
  (e: 'click', event: MouseEvent): void
}>()

const checkboxRef = ref<HTMLInputElement | null>(null)

/**
 * Handles the change event from the native checkbox.
 * Emits the new boolean value and the original event.
 */
const onChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
  emit('change', event)
}

/**
 * Emits the click event for parent component tracking or logging.
 */
const onClick = (event: MouseEvent): void => {
  emit('click', event)
}

/**
 * Exposes the focus method to allow parent components or forms
 * to programmatically focus the checkbox.
 */
const focus = (): void => {
  checkboxRef.value?.focus()
}

defineExpose({
  focus,
  checkboxRef
})
</script>
