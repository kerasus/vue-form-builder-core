import { ref, nextTick, type Ref, type Component } from 'vue'
import * as shvl from 'shvl'

export type FormDataMode = 'nested' | 'flat'

export interface FormInputOption {
    label?: string
    value?: any
    [key: string]: any
}

export interface FormInputItem {
    name: string
    type?: string | Component | object
    value?: any
    label?: string
    placeholder?: string
    col?: string
    uid?: string
    disabled?: boolean
    readonly?: boolean
    multiple?: boolean
    rows?: number
    options?: Array<string | number | FormInputOption>
    responseKey?: string
    customClass?: string
    [key: string]: any
}

export type FormDataObject = Record<string, any>

export interface UseFormBuilderOptions {
    initialInputs?: FormInputItem[]
    initialFormData?: FormDataObject
    onUpdateInputs?: (inputs: FormInputItem[]) => void
    onUpdateFormData?: (formData: FormDataObject) => void
}

export function useFormBuilder(options: UseFormBuilderOptions = {}) {
    const inputData: Ref<FormInputItem[]> = ref([])
    const inputRefs: Ref<Record<string, any>> = ref({})

    let isSyncingFromFormData = false
    let isSyncingFromInputs = false

    // Generate unique identifier
    const generateUid = (): string => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID()
        }
        return 'uid-' + Math.random().toString(36).substring(2, 9)
    }

    // Assign unique UIDs recursively
    const setUidForInputs = (
        inputs: FormInputItem[] = inputData.value
    ): void => {
        inputs.forEach((input) => {
            if (!input.uid) {
                input.uid = generateUid()
            }

            if (
                input.type === 'formBuilder' &&
                Array.isArray(input.inputs)
            ) {
                setUidForInputs(input.inputs)
            }
        })
    }

    // Recursively extract formData key-value mapping from inputs array
    const extractFormData = (
        inputs: FormInputItem[] = inputData.value
    ): FormDataObject => {
        const data: FormDataObject = {}

        inputs.forEach((input) => {
            if (!input.name) return

            if (
                input.type === 'formBuilder' &&
                Array.isArray(input.inputs)
            ) {
                data[input.name] = input.value ?? {}
            } else {
                data[input.name] =
                    input.value !== undefined
                        ? input.value
                        : null
            }
        })

        return data
    }

    const flattenFormData = (
        data: FormDataObject
    ): FormDataObject => {
        const result: FormDataObject = {}

        Object.entries(data).forEach(([key, value]) => {
            if (
                value !== null &&
                typeof value === 'object' &&
                !Array.isArray(value)
            ) {
                Object.assign(
                    result,
                    flattenFormData(value)
                )
            } else {
                result[key] = value
            }
        })

        return result
    }

    // Recursively apply formData key-value updates to inputs schema
    const applyFormDataToInputs = (
        formData: FormDataObject,
        inputs: FormInputItem[] = inputData.value
    ): void => {
        if (!formData || typeof formData !== 'object') return

        inputs.forEach((input) => {
            if (!input.name || !(input.name in formData)) return

            const incomingValue = formData[input.name]

            if (
                input.type === 'formBuilder' &&
                Array.isArray(input.inputs) &&
                incomingValue &&
                typeof incomingValue === 'object'
            ) {
                input.value = {
                    ...incomingValue
                }
            } else {
                input.value = incomingValue
            }
        })
    }

    // Sync and notify parent/listeners
    const syncState = (): void => {
        if (isSyncingFromFormData) return

        isSyncingFromInputs = true
        const calculatedFormData = extractFormData(inputData.value)

        options.onUpdateInputs?.(inputData.value)
        options.onUpdateFormData?.(calculatedFormData)

        nextTick(() => {
            isSyncingFromInputs = false
        })
    }

    // Deep property lookup helper using shvl
    const getValidChainedObject = (object: any, keys: string): any => {
        if (!object || !keys) return object
        return shvl.get(object, keys)
    }

    // Register DOM / Component refs dynamically
    const setInputRef = (el: any, input: FormInputItem): void => {
        if (el && input.name) {
            const key = `input-${input.name}-${input.uid || ''}`
            inputRefs.value[key] = el
        }
    }

    // Locate the first focusable input
    const getFirstInput = (inputs: FormInputItem[] = inputData.value): FormInputItem | null => {
        for (const input of inputs) {
            if (input.type === 'formBuilder' && Array.isArray(input.value)) {
                const nested = getFirstInput(input.value)
                if (nested) return nested
            } else {
                return input
            }
        }
        return null
    }

    // Focus the first input element
    const focus = (): void => {
        const firstInput = getFirstInput()
        if (!firstInput) return
        const targetKey = `input-${firstInput.name}-${firstInput.uid || ''}`
        const targetRef = inputRefs.value[targetKey]
        if (targetRef) {
            if (typeof targetRef.focus === 'function') {
                targetRef.focus()
            } else if (targetRef.$el && typeof targetRef.$el.focus === 'function') {
                targetRef.$el.focus()
            }
        }
    }

    const getFormData = (): FormDataObject => {
        return extractFormData(inputData.value)
    }

    const setFormData = (data: FormDataObject): void => {
        if (isSyncingFromInputs || !data) return
        isSyncingFromFormData = true
        applyFormDataToInputs(data, inputData.value)
        syncState()
        nextTick(() => {
            isSyncingFromFormData = false
        })
    }

    const getInputsByName = (
        name: string,
        inputs: FormInputItem[] = inputData.value
    ): FormInputItem | undefined => {
        for (const input of inputs) {
            if (input.name === name) return input
            if (input.type === 'formBuilder' && Array.isArray(input.value)) {
                const nested = getInputsByName(name, input.value)
                if (nested) return nested
            }
        }
        return undefined
    }

    const setInputByName = (name: string, value: any): void => {
        const target = getInputsByName(name)
        if (target) {
            target.value = value
            syncState()
        }
    }

    const setInputValues = (
        responseData: Record<string, any>,
        inputs: FormInputItem[] = inputData.value
    ): void => {
        inputs.forEach((input) => {
            if (input.type === 'formBuilder' && Array.isArray(input.value)) {
                setInputValues(responseData, input.value)
                return
            }
            if (input.responseKey) {
                input.value = shvl.get(responseData, input.responseKey)
            }
        })
        syncState()
    }

    const clearValues = (inputs: FormInputItem[] = inputData.value): void => {
        inputs.forEach((input) => {
            if (input.type === 'formBuilder') {
                input.value = {}
            } else if (input.type === 'checkbox') {
                input.value = false
            } else if (Array.isArray(input.value)) {
                input.value = []
            } else {
                input.value = null
            }
        })
        syncState()
    }

    const disableAllInputs = (
        status: boolean,
        inputs: FormInputItem[] = inputData.value
    ): void => {
        inputs.forEach((input) => {
            if (input.type === 'formBuilder' && Array.isArray(input.value)) {
                disableAllInputs(status, input.value)
            } else {
                input.disabled = status
            }
        })
    }

    const readonlyAllInputs = (
        status: boolean,
        inputs: FormInputItem[] = inputData.value
    ): void => {
        inputs.forEach((input) => {
            if (input.type === 'formBuilder' && Array.isArray(input.value)) {
                readonlyAllInputs(status, input.value)
            } else {
                input.readonly = status
            }
        })
    }

    const setInputs = (newInputs: FormInputItem[]): void => {
        inputData.value = newInputs ? JSON.parse(JSON.stringify(newInputs)) : []
        setUidForInputs(inputData.value)
    }

    return {
        inputData,
        inputRefs,
        generateUid,
        setUidForInputs,
        extractFormData,
        applyFormDataToInputs,
        syncState,
        setInputRef,
        setInputs,
        getValidChainedObject,
        // Exposed Form API Methods
        focus,
        flattenFormData,
        getFormData,
        setFormData,
        getInputsByName,
        setInputByName,
        setInputValues,
        clearValues,
        disableAllInputs,
        readonlyAllInputs
    }
}
