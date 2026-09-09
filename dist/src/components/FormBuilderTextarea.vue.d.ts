interface Props {
    name: string;
    modelValue?: string | null;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    rows?: number;
}
declare const __VLS_export: import('vue').DefineComponent<Props, {
    focus: () => void;
    textareaRef: import('vue').Ref<HTMLTextAreaElement | null, HTMLTextAreaElement | null>;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {} & {
    "update:modelValue": (value: string) => any;
    input: (event: Event) => any;
    change: (event: Event) => any;
    click: (event: MouseEvent) => any;
}, string, import('vue').PublicProps, Readonly<Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
    onInput?: ((event: Event) => any) | undefined;
    onChange?: ((event: Event) => any) | undefined;
    onClick?: ((event: MouseEvent) => any) | undefined;
}>, {
    modelValue: string | null;
    label: string;
    placeholder: string;
    disabled: boolean;
    readonly: boolean;
    rows: number;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
