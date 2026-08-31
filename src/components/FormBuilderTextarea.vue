<template>
  <div class="form-builder-field">
    <label v-if="label" :for="name" class="form-builder-label">
      {{ label }}
    </label>
    <textarea
        :id="name"
        ref="textareaRef"
        :value="modelValue"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :rows="rows"
        class="form-builder-native-input form-builder-textarea"
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
  modelValue?: string | null
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  rows?: number
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  rows: 3
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'input', event: Event): void
  (e: 'change', event: Event): void
  (e: 'click', event: MouseEvent): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const onInput = (event: Event): void => {
  const target = event.target as HTMLTextAreaElement
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
  textareaRef.value?.focus()
}

defineExpose({
  focus,
  textareaRef
})
</script>
