import { Component } from 'vue';
export type FormDataMode = 'nested' | 'flat';
export interface FormInputOption {
    label?: string;
    value?: any;
    [key: string]: any;
}
export interface FormInputItem {
    name: string;
    type?: string | Component | object;
    value?: any;
    label?: string;
    placeholder?: string;
    col?: string;
    uid?: string;
    disabled?: boolean;
    readonly?: boolean;
    multiple?: boolean;
    rows?: number;
    options?: Array<string | number | FormInputOption>;
    inputs?: FormInputItem[];
    responseKey?: string;
    customClass?: string;
    [key: string]: any;
}
export type FormDataObject = Record<string, any>;
interface Props {
    inputs?: FormInputItem[];
    value?: FormInputItem[];
    formData?: FormDataObject;
    formDataMode?: FormDataMode;
    readonly?: boolean;
    disabled?: boolean;
    loading?: boolean;
    customClass?: string;
}
declare const __VLS_export: import('vue').DefineComponent<Props, {
    focus: () => void;
    flattenFormData: (data: FormDataObject) => FormDataObject;
    getFormData: () => FormDataObject;
    setFormData: (data: FormDataObject) => void;
    getInputsByName: (name: string, inputs?: FormInputItem[]) => FormInputItem | undefined;
    setInputByName: (name: string, value: any) => void;
    setInputValues: (responseData: Record<string, any>, inputs?: FormInputItem[]) => void;
    clearValues: (inputs?: FormInputItem[]) => void;
    disableAllInputs: (status: boolean, inputs?: FormInputItem[]) => void;
    readonlyAllInputs: (status: boolean, inputs?: FormInputItem[]) => void;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {} & {
    input: (payload: {
        event: Event;
        index: number;
        data: FormInputItem[];
    }) => any;
    change: (payload: {
        event: Event;
        index: number;
        data: FormInputItem[];
    }) => any;
    onClick: (payload: {
        event: MouseEvent;
        input: FormInputItem;
    }) => any;
    "update:inputs": (value: FormInputItem[]) => any;
    "update:value": (value: FormInputItem[]) => any;
    "update:formData": (value: FormDataObject) => any;
}, string, import('vue').PublicProps, Readonly<Props> & Readonly<{
    onInput?: ((payload: {
        event: Event;
        index: number;
        data: FormInputItem[];
    }) => any) | undefined;
    onChange?: ((payload: {
        event: Event;
        index: number;
        data: FormInputItem[];
    }) => any) | undefined;
    onOnClick?: ((payload: {
        event: MouseEvent;
        input: FormInputItem;
    }) => any) | undefined;
    "onUpdate:inputs"?: ((value: FormInputItem[]) => any) | undefined;
    "onUpdate:value"?: ((value: FormInputItem[]) => any) | undefined;
    "onUpdate:formData"?: ((value: FormDataObject) => any) | undefined;
}>, {
    disabled: boolean;
    readonly: boolean;
    value: FormInputItem[];
    inputs: FormInputItem[];
    customClass: string;
    formData: FormDataObject;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
