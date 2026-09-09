# vue-form-builder-core

Headless, schema-driven form builder engine for Vue 3. Build dynamic forms from a JSON-like schema; the core focuses on state, validation, and nested structures while remaining headless so you can style the UI however you like.

## Installation

Prefer pnpm for development (this repository uses pnpm):

```bash
pnpm install
```

To add the package to a project (when published):

```bash
pnpm add vue-form-builder-core
# or
npm install vue-form-builder-core
```

## Quick Start

Use the `FormBuilder` component in your Vue 3 app with v-model or the provided composable API.

Basic example (component):

```vue
<template>
  <FormBuilder v-model:value="inputs" />
</template>

<script setup>
import { ref } from 'vue'
import { FormBuilder } from 'vue-form-builder-core'

const inputs = ref([
  { type: 'text', name: 'firstName', label: 'First Name' },
  { type: 'text', name: 'lastName', label: 'Last Name' }
])
</script>
```

Composable example:

```js
import { useFormBuilder } from 'vue-form-builder-core'

const { inputData, getFormData, setFormData } = useFormBuilder({
  initialInputs: [{ type: 'text', name: 'email', label: 'Email' }]
})

// read values with getFormData()
```

## Demo (from dev/App.vue)

The included demo at `dev/App.vue` shows a practical usage of the `FormBuilder` with two-way binding for both `inputs` and `formData`, nested forms, and programmatic methods via a component ref.

```vue
<template>
  <FormBuilder
    ref="formRef"
    v-model:form-data="formData"
    v-model:inputs="inputs"
    form-data-mode="flat"
    @change="handleChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import FormBuilder from './src/FormBuilder.vue'

const formRef = ref(null)

const inputs = ref([
  { name: 'fullname', type: 'text', label: 'Full Name' },
  { name: 'email', type: 'email', label: 'Email' },
  { name: 'gender', type: 'select', label: 'Gender', options: [{label:'Male',value:'male'},{label:'Female',value:'female'}] },
  { name: 'agree', type: 'checkbox', label: 'I agree' },
  { name: 'address', type: 'formBuilder', label: 'Address', inputs: [
    { name: 'street', type: 'text', label: 'Street' },
    { name: 'city', type: 'text', label: 'City' }
  ] }
])

const formData = ref({ fullname: 'Alice', email: '', gender: 'female', agree: false, address: { street: '', city: '' } })

function handleChange(payload) { console.log('Form changed:', payload) }

// Methods available via `formRef.value` in the demo:
// - getFormData()
// - setFormData(data)
// - clearValues()
</script>
```

## Development (local demo)

This repository includes a small demo app in the `dev/` folder that runs with Vite.

Run locally:

```bash
pnpm install
pnpm dev
```

Build package (type checking + bundle):

```bash
pnpm run build
```

Preview the production build:

```bash
pnpm run preview
```

## Built-in Input Types

- text, number, password, email, date, time
- textarea
- select
- checkbox
- radio
- file
- hidden
- nested `formBuilder` type for recursive forms

## Features

- Schema-driven API for dynamic forms
- Headless core (styling entirely up to you)
- `useFormBuilder` composable for programmatic control
- Nested/recursive forms support
- Simple grid/column helpers
- TypeScript typings included

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork and branch.
2. Run `pnpm install` and `pnpm dev` to test the demo.
3. Open a PR with a clear description.

## License

MIT
