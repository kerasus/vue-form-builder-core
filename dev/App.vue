<template>
  <div class="dev-container">
    <h2>🧪 Form Builder Playground</h2>

    <div class="card">
      <FormBuilder
          ref="formRef"
          v-model:form-data="formData"
          v-model:inputs="inputs"
          @change="handleChange"
      />
    </div>

    <div class="card json-viewer">
      <h3>Live FormData:</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>

    <div class="actions">
      <button @click="handleGetFormData">getFormData()</button>
      <button @click="handleSetCustomValues">Set Values</button>
      <button @click="handleClear">Clear Values</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import FormBuilder from '../src/FormBuilder.vue'
import type { FormInputItem } from '@/composables/useFormBuilder'

const formRef = ref<any>(null)

const formData = ref<Record<string, any>>({
  fullname: 'علی اسماعیلی',
  email: 'ali@example.com',
  gender: 'male',
  agree: true
})

const inputs = ref<FormInputItem[]>([
  {
    name: 'fullname',
    type: 'text',
    label: 'نام و نام خانوادگی',
    placeholder: 'نام را وارد کنید',
    col: 'col-md-6 col-12'
  },
  {
    name: 'email',
    type: 'email',
    label: 'ایمیل',
    placeholder: 'example@domain.com',
    col: 'col-md-6 col-12'
  },
  {
    name: 'gender',
    type: 'select',
    label: 'جنسیت',
    options: [
      { label: 'مرد', value: 'male' },
      { label: 'زن', value: 'female' }
    ],
    col: 'col-md-6 col-12'
  },
  {
    name: 'agree',
    type: 'checkbox',
    label: 'قوانین را می‌پذیرم',
    col: 'col-12'
  }
])

const handleChange = (payload: any) => {
  console.log('Form Changed:', payload)
}

const handleGetFormData = () => {
  if (formRef.value) {
    alert(JSON.stringify(formRef.value.getFormData(), null, 2))
  }
}

const handleSetCustomValues = () => {
  if (formRef.value) {
    formRef.value.setFormData({
      fullname: 'کاربر جدید',
      email: 'new@user.com',
      gender: 'female',
      agree: false
    })
  }
}

const handleClear = () => {
  if (formRef.value) {
    formRef.value.clearValues()
  }
}
</script>

<style scoped>
.dev-container {
  max-width: 900px;
  margin: 40px auto;
  font-family: system-ui, -apple-system, sans-serif;
  padding: 0 16px;
}
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.json-viewer {
  background: #1e293b;
  color: #38bdf8;
}
.actions {
  display: flex;
  gap: 10px;
}
button {
  padding: 8px 16px;
  border: none;
  background: #2563eb;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}
button:hover {
  background: #1d4ed8;
}
</style>
