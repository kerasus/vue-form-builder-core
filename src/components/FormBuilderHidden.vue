<template>
  <input
      ref="hiddenRef"
      :value="modelValue"
      type="hidden"
      :name="name"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Props {
  name: string
  modelValue?: any
}

defineProps<Props>()

const hiddenRef = ref<HTMLInputElement | null>(null)

defineExpose({
  hiddenRef
})
</script>
