<template>
  <div class="docs-container">
    <header class="docs-header">
      <h1>Vue Form Builder Core</h1>
      <p class="docs-subtitle">
        A headless, schema-driven form builder for Vue 3 with centralized
        validation, i18n support and full form lifecycle API.
      </p>

      <!--
        Documentation: Locale Switching
        The `locale` prop is fully reactive. Changing it at runtime
        re-translates every validation message instantly, including
        messages already rendered by active fields.
      -->
      <div class="toolbar" role="group" aria-label="Locale selector">
        <button
            :class="{ active: currentLocale === 'fa' }"
            @click="currentLocale = 'fa'"
        >🇮🇷 Persian</button>
        <button
            :class="{ active: currentLocale === 'en' }"
            @click="currentLocale = 'en'"
        >🇬🇧 English</button>
      </div>
    </header>

    <!-- ========================================== -->
    <!-- Section 1: The Form Schema                  -->
    <!-- Demonstrates: all field types, rule strings, -->
    <!-- custom rules, async rules, nested forms.    -->
    <!-- ========================================== -->
    <section class="docs-card">
      <h2>1 · Form Schema &amp; Fields</h2>
      <p>
        The form below is generated entirely from the
        <code>inputs</code> schema. It demonstrates every supported field
        type, string-based rule chains (<code>required|min:3</code>),
        custom rules and async (server-side) validation.
      </p>

      <FormBuilder
          ref="formRef"
          v-model:form-data="formData"
          v-model:inputs="inputs"
          form-data-mode="flat"
          :locale="currentLocale"
          :custom-rules="customRules"
          :messages="customMessages"
          @change="handleChange"
      />
    </section>

    <!-- ========================================== -->
    <!-- Section 2: Programmatic Validation          -->
    <!-- Demonstrates: validateAll() returning a      -->
    <!-- structured result object.                   -->
    <!-- ========================================== -->
    <section class="docs-card">
      <h2>2 · Programmatic Validation</h2>
      <p>
        Call <code>formRef.validateAll()</code> before submitting.
        It awaits all async rules and returns a structured report
        instead of just a boolean, so you can map errors to your
        own UI or backend payloads.
      </p>

      <button class="primary" @click="handleValidateAll">
        Run validateAll()
      </button>

      <table v-if="validationReport.length" class="report-table">
        <thead>
        <tr>
          <th>Field</th>
          <th>Valid</th>
          <th>Message</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in validationReport" :key="item.name">
          <td><code>{{ item.name }}</code></td>
          <td>{{ item.valid ? '✅' : '❌' }}</td>
          <td>{{ item.error ?? '—' }}</td>
        </tr>
        </tbody>
      </table>

      <p v-if="isFormValid !== null" class="submit-hint" :class="{ ok: isFormValid }">
        {{
          isFormValid
              ? 'Form is valid — safe to submit.'
              : 'Form is invalid — fix the fields above before submitting.'
        }}
      </p>
    </section>

    <!-- ========================================== -->
    <!-- Section 3: Form Data API                    -->
    <!-- Demonstrates: getFormData, setFormData,     -->
    <!-- clearValues and reactive v-model:form-data. -->
    <!-- ========================================== -->
    <section class="docs-card">
      <h2>3 · Form Data API</h2>
      <p>
        <code>v-model:form-data</code> keeps your state in sync, while
        the imperative API is available for programmatic workflows
        (prefilling from an API response, drafts, reset, etc.).
      </p>

      <div class="actions">
        <button @click="handleGetFormData">getFormData()</button>
        <button @click="handleSetCustomValues">
          setFormData() — prefill demo data
        </button>
        <button class="danger" @click="handleClear">clearValues()</button>
      </div>

      <h3>Live <code>formData</code> (via v-model)</h3>
      <pre class="json-viewer">{{ formattedFormData }}</pre>
    </section>

    <!-- ========================================== -->
    <!-- Section 4: Custom Messages                  -->
    <!-- ========================================== -->
    <section class="docs-card">
      <h2>4 · Custom &amp; Translated Messages</h2>
      <p>
        Per-locale message overrides support the
        <code>{field}</code> placeholder. Try entering an invalid
        email or an already-taken address
        (<code>john.smith@example.com</code>) to see custom and
        async messages in both languages.
      </p>
      <ul>
        <li><strong>Global overrides:</strong> passed via the <code>messages</code> prop.</li>
        <li><strong>Custom rules:</strong> passed via <code>custom-rules</code> and referenced by name inside rule strings.</li>
        <li><strong>Async rules:</strong> resolve a Promise; the field shows an <code>is-validating</code> state meanwhile.</li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import FormBuilder from '../src/FormBuilder.vue'
import type { FormInputItem } from '@/utils/types'
import type { ValidationRule } from '@/composables/useInputRules'

interface ValidationReportItem {
  name: string
  valid: boolean
  error: string | null
}

const formRef = ref<any>(null)

// ==========================================
// i18n — reactive locale passed to FormBuilder
// ==========================================

/**
 * Current form locale. Fully reactive: all rendered validation
 * messages re-translate instantly when this value changes.
 */
const currentLocale = ref<'fa' | 'en'>('fa')

// ==========================================
// Custom Validation Rules
// ==========================================

/**
 * Custom rule: Iranian mobile number (starts with 09, 11 digits).
 * Custom rules receive the field value and may return `true`,
 * an error string, or a Promise resolving to either.
 */
const iranianMobile: ValidationRule = (value) => {
  if (!value) return true // emptiness is `required`'s job
  const str = String(value)
  if (!/^09\d{9}$/.test(str)) {
    return currentLocale.value === 'fa'
        ? 'شماره موبایل باید با 09 شروع شده و ۱۱ رقم باشد'
        : 'Mobile number must start with 09 and be 11 digits'
  }
  return true
}

/**
 * Custom rule: value must not be digits only.
 */
const noDigitsOnly: ValidationRule = (value) => {
  if (!value) return true
  if (/^\d+$/.test(String(value))) {
    return currentLocale.value === 'fa'
        ? 'مقدار نمی‌تواند فقط عدد باشد'
        : 'Value cannot be digits only'
  }
  return true
}

/**
 * Async custom rule: simulates a server-side uniqueness check
 * with network latency. While pending, the field renders the
 * `is-validating` semantic class.
 */
const uniqueEmail: ValidationRule = async (value) => {
  if (!value) return true
  await new Promise(resolve => setTimeout(resolve, 600)) // simulate API latency
  const takenEmails = ['john.smith@example.com', 'taken@example.com']
  if (takenEmails.includes(String(value).toLowerCase())) {
    return currentLocale.value === 'fa'
        ? 'این ایمیل قبلاً ثبت شده است'
        : 'This email is already taken'
  }
  return true
}

/**
 * Custom rules registry. Rule names are referenced in schema
 * rule strings, e.g. `rules: 'required|iranian_mobile'`.
 */
const customRules: Record<string, ValidationRule> = {
  iranian_mobile: iranianMobile,
  no_digits_only: noDigitsOnly,
  unique_email: uniqueEmail
}

// ==========================================
// Custom Messages (per-locale overrides)
// ==========================================

/**
 * Locale-aware message overrides for built-in rules.
 * `{field}` is replaced with the field label at render time.
 */
const customMessages = {
  fa: {
    email: 'ایمیل واردشده معتبر نیست — فرمت درست: example@domain.com',
    required: 'لطفاً {field} را وارد کنید'
  },
  en: {
    email: 'Invalid email — expected format: example@domain.com',
    required: 'Please enter {field}'
  }
}

// ==========================================
// Form Schema
// ==========================================

/**
 * Nested form schema (type: 'formBuilder').
 * Nested groups receive their own inputs array and produce
 * a nested object in formData (or a flattened key set with
 * `form-data-mode="flat"`).
 */
const addressInputs: FormInputItem[] = [
  {
    name: 'street',
    type: 'text',
    label: 'Street Address',
    placeholder: 'Enter your street address',
    rules: 'required',
    col: 'col-md-8 col-12'
  },
  {
    name: 'postalCode',
    type: 'text',
    label: 'Postal Code',
    placeholder: 'Enter postal code',
    rules: 'required|digits:10',
    col: 'col-md-4 col-12'
  },
  {
    name: 'city',
    type: 'text',
    label: 'City',
    placeholder: 'Enter your city',
    rules: 'required|no_digits_only',
    col: 'col-md-6 col-12'
  },
  {
    name: 'country',
    type: 'text',
    label: 'Country',
    placeholder: 'Enter your country',
    rules: 'required',
    col: 'col-md-6 col-12'
  }
]

/**
 * Root form schema. Every entry maps to a core component
 * by `type` and is validated through the centralized
 * validation pipeline.
 */
const inputs = ref<FormInputItem[]>([
  {
    name: 'fullname',
    type: 'text',
    label: 'Full Name',
    placeholder: 'Enter your name',
    rules: 'required|no_digits_only|min:3',
    col: 'col-md-6 col-12'
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'example@domain.com',
    // Async custom rule — try john.smith@example.com
    rules: 'required|email|unique_email',
    col: 'col-md-6 col-12'
  },
  {
    name: 'mobile',
    type: 'text',
    label: 'Mobile Number',
    placeholder: '09xxxxxxxxx',
    rules: 'required|iranian_mobile',
    col: 'col-md-6 col-12'
  },
  {
    name: 'age',
    type: 'number',
    label: 'Age',
    rules: 'required|integer|between:18,100',
    col: 'col-md-6 col-12'
  },
  {
    name: 'gender',
    type: 'select',
    label: 'Gender',
    rules: 'required',
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' }
    ],
    col: 'col-md-6 col-12'
  },
  {
    name: 'agree',
    type: 'checkbox',
    label: 'I agree to the terms and conditions',
    rules: 'required',
    col: 'col-12'
  },
  {
    name: 'address',
    type: 'formBuilder',
    label: 'Address',
    rules: 'required',
    inputs: addressInputs,
    col: 'col-12'
  }
])

/**
 * Initial form state, kept in sync via `v-model:form-data`.
 */
const formData = ref<Record<string, any>>({
  fullname: 'Alexander Thompson',
  email: 'alexander@example.com',
  mobile: '09123456789',
  age: 30,
  gender: 'male',
  agree: true,
  address: {
    street: '221B Baker Street',
    postalCode: 'NW1 6XE',
    city: 'London',
    country: 'United Kingdom'
  }
})

/**
 * Pretty-printed snapshot of the reactive form data,
 * rendered live in the documentation viewer.
 */
const formattedFormData = computed(() => JSON.stringify(formData.value, null, 2))

// ==========================================
// Form change event
// ==========================================

/**
 * Fired by FormBuilder on every field mutation.
 * Useful for autosave / draft features.
 */
const handleChange = (payload: any) => {
  console.log('Form changed:', payload)
}

// ==========================================
// Programmatic validation API
// ==========================================

const validationReport = ref<ValidationReportItem[]>([])
const isFormValid = ref<boolean | null>(null)

/**
 * Runs validateAll() on the form instance. Awaits every
 * async rule, then collects a per-field structured report.
 */
const handleValidateAll = async () => {
  if (!formRef.value) return

  const result = await formRef.value.validateAll()

  validationReport.value = result.fields ?? []
  isFormValid.value = Boolean(result.valid)
  console.log('validateAll() result:', result)
}

// ==========================================
// Imperative form data API
// ==========================================

/**
 * Reads the current form data snapshot imperatively.
 */
const handleGetFormData = () => {
  if (formRef.value) {
    console.log('getFormData():', formRef.value.getFormData())
  }
}

/**
 * Prefills the form programmatically. Note that
 * john.smith@example.com intentionally fails the async
 * uniqueness rule — a live demo of server-side validation.
 */
const handleSetCustomValues = () => {
  if (formRef.value) {
    formRef.value.setFormData({
      fullname: 'John Smith',
      email: 'john.smith@example.com',
      mobile: '09121112233',
      age: 25,
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

/**
 * Clears all field values and resets validation state.
 */
const handleClear = () => {
  if (formRef.value) {
    formRef.value.clearValues()
  }
}
</script>

<style lang="scss" scoped>
/* Documentation shell styles only.
   Field appearance is handled by the semantic classes
   exposed by the headless components below (global block). */
.docs-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 16px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  direction: ltr;
  color: #0f172a;
}

.docs-header {
  margin-bottom: 32px;
}

.docs-subtitle {
  color: #64748b;
  margin: 8px 0 20px;
  line-height: 1.7;
}

.docs-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.docs-card h2 {
  margin: 0 0 12px;
  font-size: 20px;
}

.docs-card > p,
.docs-card li {
  color: #475569;
  line-height: 1.8;
  font-size: 14px;
}

code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 13px;
  color: #0f172a;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.toolbar button.active {
  background: #0f172a;
}

.report-table {
  width: 100%;
  margin-top: 16px;
  border-collapse: collapse;
  font-size: 14px;

  th, td {
    text-align: left;
    padding: 8px 12px;
    border-bottom: 1px solid #e2e8f0;
  }

  th {
    background: #f8fafc;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #64748b;
  }
}

.submit-hint {
  margin-top: 12px;
  font-weight: 600;
  color: #dc2626;

  &.ok {
    color: #16a34a;
  }
}

.json-viewer {
  margin: 12px 0 0;
  padding: 16px;
  background: #0f172a;
  border-radius: 8px;
  overflow-x: auto;
  direction: ltr;
  text-align: left;
  color: #38bdf8;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 13px;
  line-height: 1.7;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .docs-container { margin-top: 20px; }
  .docs-card { padding: 16px; }
}
</style>

<style lang="scss">
/* Default documentation theme for headless fields.
   Consumers of vue-form-builder-core are expected to
   provide their own equivalent styles via the semantic
   classes exposed by each component. */
label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

input:not([type="checkbox"]),
select,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #0f172a;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

input:not([type="checkbox"]):hover,
select:hover,
textarea:hover {
  border-color: #94a3b8;
}

input:not([type="checkbox"]):focus,
select:focus,
textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

input::placeholder,
textarea::placeholder {
  color: #94a3b8;
}

/* Semantic validation states exposed by the core components */
.has-error input:not([type="checkbox"]),
.has-error select,
.has-error textarea {
  border-color: #dc2626;
}

.is-disabled input,
.is-disabled select,
.is-disabled textarea {
  background: #f1f5f9;
  cursor: not-allowed;
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
  transition: background-color 0.15s ease, transform 0.1s ease;
}

button:hover { background: #1d4ed8; }
button:active { transform: translateY(1px); }
button.primary { background: #16a34a; }
button.primary:hover { background: #15803d; }
button.danger { background: #dc2626; }
button.danger:hover { background: #b91c1c; }
</style>
