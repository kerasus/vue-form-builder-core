interface Props {
    name: string;
    modelValue?: string | number | null;
    type?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
}
declare const __VLS_export: import('vue').DefineComponent<Props, {
    focus: () => void;
    inputRef: import('vue').Ref<HTMLInputElement | null, HTMLInputElement | null>;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {} & {
    "update:modelValue": (value: string | number) => any;
    input: (event: Event) => any;
    change: (event: Event) => any;
    click: (event: MouseEvent) => any;
}, string, import('vue').PublicProps, Readonly<Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: string | number) => any) | undefined;
    onInput?: ((event: Event) => any) | undefined;
    onChange?: ((event: Event) => any) | undefined;
    onClick?: ((event: MouseEvent) => any) | undefined;
}>, {
    modelValue: string | number | null;
    type: string;
    label: string;
    placeholder: string;
    disabled: boolean;
    readonly: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
