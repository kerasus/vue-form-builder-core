import { FormInputItem, FormDataObject } from './composables/useFormBuilder';
interface Props {
    inputs?: FormInputItem[];
    value?: FormInputItem[];
    formData?: FormDataObject;
    disable?: boolean;
    customClass?: string;
}
declare var __VLS_15: string, __VLS_16: any;
type __VLS_Slots = {} & {
    [K in NonNullable<typeof __VLS_15>]?: (props: typeof __VLS_16) => any;
};
declare const __VLS_base: import('vue').DefineComponent<Props, {
    focus: () => void;
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
    value: FormInputItem[];
    customClass: string;
    inputs: FormInputItem[];
    formData: FormDataObject;
    disable: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
