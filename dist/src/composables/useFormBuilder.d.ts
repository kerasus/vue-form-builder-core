import { Ref, Component } from 'vue';
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
export declare function useFormBuilder(options?: UseFormBuilderOptions): {
    inputData: Ref<FormInputItem[], FormInputItem[]>;
    inputRefs: Ref<Record<string, any>, Record<string, any>>;
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
