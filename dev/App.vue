<template>
  <div class="dev-container">
    <h2>🧪 Form Builder Playground</h2>

    <!-- =========================
         Form Builder
         ========================= -->

    <div class="card">
      <h3>Form Builder</h3>

      <FormBuilder
          ref="formRef"
          v-model:form-data="formData"
          v-model:inputs="inputs"
          form-data-mode="flat"
          @change="handleChange"
      />
    </div>

    <!-- =========================
         Static Form
         ========================= -->

    <div class="card">
      <h3>Static Form</h3>

      <form class="static-form" @submit.prevent>
        <div class="form-grid">
          <!-- Fullname -->
          <div class="form-field">
            <label for="fullname">Full Name</label>
            <input
                id="fullname"
                v-model="formData.fullname"
                type="text"
                placeholder="Enter your name"
            />
          </div>

          <!-- Email -->
          <div class="form-field">
            <label for="email">Email</label>
            <input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="example@domain.com"
            />
          </div>

          <!-- Gender -->
          <div class="form-field">
            <label for="gender">Gender</label>
            <select id="gender" v-model="formData.gender">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <!-- Agree -->
          <div class="form-field checkbox-field">
            <label>
              <input
                  v-model="formData.agree"
                  type="checkbox"
              />
              <span>I agree to the terms and conditions</span>
            </label>
          </div>
        </div>
      </form>
    </div>

    <!-- =========================
         Live FormData
         ========================= -->

    <div class="card json-viewer">
      <h3>Live FormData</h3>

      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>

    <!-- =========================
         Actions
         ========================= -->

    <div class="actions">
      <button @click="handleGetFormData">
        getFormData()
      </button>

      <button @click="handleSetCustomValues">
        Set Values
      </button>

      <button class="danger" @click="handleClear">
        Clear Values
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import FormBuilder from '../src/FormBuilder.vue'
import type { FormInputItem } from '../src/composables/useFormBuilder'

const formRef = ref<any>(null)

/**
 * Nested form definition
 */
const addressInputs: FormInputItem[] = [
  {
    name: 'street',
    type: 'text',
    label: 'Street Address',
    placeholder: 'Enter your street address',
    col: 'col-md-8 col-12'
  },
  {
    name: 'postalCode',
    type: 'text',
    label: 'Postal Code',
    placeholder: 'Enter postal code',
    col: 'col-md-4 col-12'
  },
  {
    name: 'city',
    type: 'text',
    label: 'City',
    placeholder: 'Enter your city',
    col: 'col-md-6 col-12'
  },
  {
    name: 'country',
    type: 'text',
    label: 'Country',
    placeholder: 'Enter your country',
    col: 'col-md-6 col-12'
  }
]

/**
 * Main form inputs
 */
const inputs = ref<FormInputItem[]>([
  {
    name: 'fullname',
    type: 'text',
    label: 'Full Name',
    placeholder: 'Enter your name',
    col: 'col-md-6 col-12'
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'example@domain.com',
    col: 'col-md-6 col-12'
  },
  {
    name: 'gender',
    type: 'select',
    label: 'Gender',
    options: [
      {
        label: 'Male',
        value: 'male'
      },
      {
        label: 'Female',
        value: 'female'
      }
    ],
    col: 'col-md-6 col-12'
  },
  {
    name: 'agree',
    type: 'checkbox',
    label: 'I agree to the terms and conditions',
    col: 'col-12'
  },

  /**
   * Nested Form
   */
  {
    name: 'address',
    type: 'formBuilder',
    label: 'Address',
    inputs: addressInputs,
    col: 'col-12'
  }
])

/**
 * Main form data
 */
const formData = ref<Record<string, any>>({
  fullname: 'Alexander Thompson',
  email: 'alexander@example.com',
  gender: 'male',
  agree: true,

  /**
   * Nested form data
   */
  address: {
    street: '221B Baker Street',
    postalCode: 'NW1 6XE',
    city: 'London',
    country: 'United Kingdom'
  }
})

const handleChange = (payload: any) => {
  console.log('Form Changed:', payload)
}

const handleGetFormData = () => {
  if (formRef.value) {
    alert(
        JSON.stringify(
            formRef.value.getFormData(),
            null,
            2
        )
    )
  }
}

const handleSetCustomValues = () => {
  if (formRef.value) {
    formRef.value.setFormData({
      fullname: 'John Smith',
      email: 'john.smith@example.com',
      gender: 'male',
      agree: false,

      address: {
        street: '10 Downing Street',
        postalCode: 'SW1A 2AA',
        city: 'London',
        country: 'United Kingdom'
      }
    })
  }
}

const handleClear = () => {
  if (formRef.value) {
    formRef.value.clearValues()
  }
}
</script>

<style lang="scss" scoped>
.dev-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 16px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  direction: ltr;
}

h2 {
  margin-bottom: 24px;
  color: #0f172a;
}

h3 {
  margin: 0 0 20px;
  color: #334155;
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

/* =========================
   Static Form
   ========================= */

.static-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Checkbox */

.checkbox-field {
  justify-content: center;
}

.checkbox-field label {
  flex-direction: row;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-field input {
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
  accent-color: #2563eb;
}

/* =========================
   JSON Viewer
   ========================= */

.json-viewer {
  background: #0f172a;
  border-color: #1e293b;
}

.json-viewer h3 {
  color: #e2e8f0;
}

.json-viewer pre {
  margin: 0;
  overflow-x: auto;
  direction: ltr;
  text-align: left;
  color: #38bdf8;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 13px;
  line-height: 1.7;
}

/* =========================
   Actions
   ========================= */

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>

<style lang="scss">


label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

input:not([type="checkbox"]),
select {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #0f172a;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease,
      background-color 0.15s ease;
}

input::placeholder {
  color: #94a3b8;
}

input:not([type="checkbox"]):hover,
select:hover {
  border-color: #94a3b8;
}

input:not([type="checkbox"]):focus,
select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

button {
  min-height: 40px;
  padding: 8px 16px;
  border: none;
  background: #2563eb;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition:
      background-color 0.15s ease,
      transform 0.1s ease;
}

button:hover {
  background: #1d4ed8;
}

button:active {
  transform: translateY(1px);
}

button.danger {
  background: #dc2626;
}

button.danger:hover {
  background: #b91c1c;
}

/* =========================
   Responsive
   ========================= */

@media (max-width: 640px) {
  .dev-container {
    margin-top: 20px;
  }

  .card {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>