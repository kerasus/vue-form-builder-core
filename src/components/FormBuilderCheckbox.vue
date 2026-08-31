<template>
  <div class="form-builder-field-inline">
    <input
        :id="name"
        ref="checkboxRef"
        :checked="!!modelValue"
        type="checkbox"
        :name="name"
        :disabled="disabled"
        class="form-builder-checkbox"
        @change="onChange"
        @click="onClick"
    />
    <label v-if="label" :for="name" class="form-builder-label">
      {{ label }}
    </label>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Props {
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

const onChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
  emit('change', event)
}

const onClick = (event: MouseEvent): void => {
  emit('click', event)
}

const focus = (): void => {
  checkboxRef.value?.focus()
}

defineExpose({
  focus,
  checkboxRef
})
</script>
