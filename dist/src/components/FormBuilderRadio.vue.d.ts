export interface RadioOption {
    label?: string;
    value?: any;
    [key: string]: any;
}
interface Props {
    name: string;
    modelValue?: any;
    label?: string;
    disabled?: boolean;
    options?: Array<string | number | RadioOption>;
}
declare const __VLS_export: import('vue').DefineComponent<Props, {
    focus: () => void;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {} & {
    "update:modelValue": (value: any) => any;
    change: (event: Event) => any;
}, string, import('vue').PublicProps, Readonly<Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: any) => any) | undefined;
    onChange?: ((event: Event) => any) | undefined;
}>, {
    label: string;
    disabled: boolean;
    options: Array<string | number | RadioOption>;
    modelValue: any;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
