import { DefineComponent, Component, Ref } from 'vue';

declare module 'vue-form-builder-core' {
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
        responseKey?: string;
        customClass?: string;
        [key: string]: any;
    }

    export type FormDataObject = Record<string, any>;

    export interface UseFormBuilderOptions {
        initialInputs?: FormInputItem[];
        initialFormData?: FormDataObject;
        onUpdateInputs?: (inputs: FormInputItem[]) => void;
        onUpdateFormData?: (formData: FormDataObject) => void;
    }

    export interface FormBuilderMethods {
        focus: () => void;
        getFormData: () => FormDataObject;
        setFormData: (data: FormDataObject) => void;
        getInputsByName: (name: string) => FormInputItem | undefined;
        setInputByName: (name: string, value: any) => void;
        setInputValues: (responseData: Record<string, any>) => void;
        clearValues: () => void;
        disableAllInputs: (status: boolean) => void;
        readonlyAllInputs: (status: boolean) => void;
    }

    export const FormBuilder: DefineComponent<{
        inputs?: FormInputItem[];
        value?: FormInputItem[];
        formData?: FormDataObject;
        disable?: boolean;
        customClass?: string;
    }, {}, any> & {
        new (): {
            $props: {
                inputs?: FormInputItem[];
                value?: FormInputItem[];
                formData?: FormDataObject;
                disable?: boolean;
                customClass?: string;
            };
            $emit: {
                (e: 'update:inputs', value: FormInputItem[]): void;
                (e: 'update:value', value: FormInputItem[]): void;
                (e: 'update:formData', value: FormDataObject): void;
                (e: 'input', payload: { event: Event; index: number; data: FormInputItem[] }): void;
                (e: 'change', payload: { event: Event; index: number; data: FormInputItem[] }): void;
                (e: 'onClick', payload: { event: MouseEvent; input: FormInputItem }): void;
            };
        } & FormBuilderMethods;
    };

    export function useFormBuilder(options?: UseFormBuilderOptions): {
        inputData: Ref<FormInputItem[]>;
        inputRefs: Ref<Record<string, any>>;
        generateUid: () => string;
        setUidForInputs: (inputs?: FormInputItem[]) => void;
        extractFormData: (inputs?: FormInputItem[]) => FormDataObject;
        applyFormDataToInputs: (formData: FormDataObject, inputs?: FormInputItem[]) => void;
        syncState: () => void;
        setInputRef: (el: any, input: FormInputItem) => void;
        setInputs: (newInputs: FormInputItem[]) => void;
        getValidChainedObject: (object: any, keys: string) => any;
        focus: () => void;
        getFormData: () => FormDataObject;
        setFormData: (data: FormDataObject) => void;
        getInputsByName: (name: string, inputs?: FormInputItem[]) => FormInputItem | undefined;
        setInputByName: (name: string, value: any) => void;
        setInputValues: (responseData: Record<string, any>, inputs?: FormInputItem[]) => void;
        clearValues: (inputs?: FormInputItem[]) => void;
        disableAllInputs: (status: boolean, inputs?: FormInputItem[]) => void;
        readonlyAllInputs: (status: boolean, inputs?: FormInputItem[]) => void;
    };
}
