# vue-form-builder-core

Headless and schema-driven form builder engine for Vue 3. This core engine allows you to build dynamic forms using a simple JSON-like schema, providing complete control over the UI while handling state, validation, and complex nested form structures.

## Installation

```bash
pnpm add vue-form-builder-core
# or
npm install vue-form-builder-core
```

## Quick Start

### Basic Usage with Component

```vue
<template>
  <div>
    <FormBuilder 
      v-model:value="inputs"
      @update:formData="onFormDataUpdate" 
    />
    <button @click="submit">Submit</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FormBuilder } from 'vue-form-builder-core'

const inputs = ref([
  {
    type: 'text',
    name: 'username',
    label: 'Username',
    value: 'john_doe',
    col: 'col-md-6'
  },
  {
    type: 'email',
    name: 'email',
    label: 'Email Address',
    placeholder: 'Enter your email',
    col: 'col-md-6'
  },
  {
    type: 'select',
    name: 'role',
    label: 'User Role',
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'Editor', value: 'editor' },
      { label: 'Viewer', value: 'viewer' }
    ]
  }
])

const onFormDataUpdate = (data) => {
  console.log('Current Form Data:', data)
}

const submit = () => {
  // inputs.value contains the full schema with values
  // use getFormData() for a clean key-value object
}
</script>
```

### Advanced Usage with Composable

The `useFormBuilder` composable provides fine-grained control over the form state and methods.

```vue
<template>
  <FormBuilder :inputs="inputData" />
</template>

<script setup>
import { FormBuilder, useFormBuilder } from 'vue-form-builder-core'

const { 
  inputData, 
  getFormData, 
  setFormData, 
  setInputByName 
} = useFormBuilder({
  initialInputs: [
    { type: 'text', name: 'firstName', label: 'First Name' },
    { type: 'text', name: 'lastName', label: 'Last Name' }
  ]
})

// Programmatically set values
const loadData = () => {
  setFormData({ firstName: 'Ali', lastName: 'Esmaeeli' })
}
</script>
```

## Built-in Input Types

`vue-form-builder-core` comes with several built-in types:

- `text`, `number`, `password`, `email`, `date`, `time` (via standard inputs)
- `textarea`
- `select`
- `checkbox`
- `radio`
- `file`
- `hidden`
- `formBuilder` (for nested/recursive forms)

## Features

- **Schema-Driven**: Define your forms entirely in JSON/JavaScript objects.
- **Headless Core**: Focuses on logic and state, giving you flexibility in styling.
- **Composable API**: Powerful `useFormBuilder` hook for advanced integrations.
- **Nested Forms**: Support for recursive form structures using the `formBuilder` type.
- **Grid System**: Built-in support for column-based layouts (e.g., `col-6`, `col-12`).
- **TypeScript Support**: Fully typed for a better developer experience.

## Component Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `inputs` | `Array` | `[]` | The form schema array. |
| `value` | `Array` | `[]` | Alias for `inputs` (v-model compatibility). |
| `formData` | `Object` | `{}` | Initial data to populate the form. |
| `disable` | `Boolean` | `false` | Global disable state for all inputs. |
| `customClass` | `String` | `''` | Custom CSS class for the container. |

## Methods (via Ref)

When using a ref on the `FormBuilder` component, you have access to:

- `focus()`: Focuses the first focusable input.
- `getFormData()`: Returns the current form data as a key-value object.
- `setFormData(data)`: Updates the form values from a key-value object.
- `getInputsByName(name)`: Find a specific input by its name.
- `setInputByName(name, value)`: Update a specific input's value.
- `clearValues()`: Resets all input values.
- `disableAllInputs(status)`: Set disabled state for all inputs.
- `readonlyAllInputs(status)`: Set readonly state for all inputs.

## License

MIT
