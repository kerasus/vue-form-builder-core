interface SelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}
interface Props {
    modelValue?: string | number | null;
    label?: string;
    name?: string;
    id?: string;
    options?: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
}
declare const __VLS_export: import('vue').DefineComponent<Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {} & {
    "update:modelValue": (value: string | number | null) => any;
    change: (value: Event) => any;
}, string, import('vue').PublicProps, Readonly<Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: string | number | null) => any) | undefined;
    onChange?: ((value: Event) => any) | undefined;
}>, {
    label: string;
    name: string;
    placeholder: string;
    disabled: boolean;
    readonly: boolean;
    options: SelectOption[];
    modelValue: string | number | null;
    id: string;
    required: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
