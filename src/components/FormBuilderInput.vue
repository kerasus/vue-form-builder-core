<template>
  <div class="form-builder-field">
    <label v-if="label" :for="name" class="form-builder-label">
      {{ label }}
    </label>
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
        @input="onInput"
        @change="onChange"
        @click="onClick"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Props {
  name: string
  modelValue?: string | number | null
  type?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  readonly: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'input', event: Event): void
  (e: 'change', event: Event): void
  (e: 'click', event: MouseEvent): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)

// Handle input value change
const onInput = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('input', event)
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

defineExpose({
  focus,
  inputRef
})
</script>
