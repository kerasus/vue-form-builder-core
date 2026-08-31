<template>
  <div class="form-builder-field">
    <label v-if="label" :for="name" class="form-builder-label">
      {{ label }}
    </label>
    <input
        :id="name"
        ref="fileRef"
        type="file"
        :name="name"
        :disabled="disabled"
        :multiple="multiple"
        :accept="accept"
        class="form-builder-native-input"
        @change="onChange"
        @click="onClick"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Props {
  name: string
  modelValue?: File | File[] | FileList | null
  label?: string
  disabled?: boolean
  multiple?: boolean
  accept?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  disabled: false,
  multiple: false,
  accept: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: File | File[] | null): void
  (e: 'change', event: Event): void
  (e: 'click', event: MouseEvent): void
}>()

const fileRef = ref<HTMLInputElement | null>(null)

// Handle file selection
const onChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = props.multiple ? Array.from(target.files) : (target.files[0] || null)
    emit('update:modelValue', files)
  }
  emit('change', event)
}

const onClick = (event: MouseEvent): void => {
  emit('click', event)
}

const focus = (): void => {
  fileRef.value?.focus()
}

defineExpose({
  focus,
  fileRef
})
</script>
