export type FormDataMode = 'nested' | 'flat';
export interface FormInputOption {
    label?: string;
    value?: any;
    [key: string]: any;
}
export interface FormInputItem {
    name: string;
    type?: string | object | any;
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
