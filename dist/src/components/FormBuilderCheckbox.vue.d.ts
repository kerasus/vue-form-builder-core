interface Props {
    name: string;
    modelValue?: boolean | any;
    label?: string;
    disabled?: boolean;
}
declare const __VLS_export: import('vue').DefineComponent<Props, {
    focus: () => void;
    checkboxRef: import('vue').Ref<HTMLInputElement | null, HTMLInputElement | null>;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {} & {
    "update:modelValue": (value: boolean) => any;
    change: (event: Event) => any;
    click: (event: MouseEvent) => any;
}, string, import('vue').PublicProps, Readonly<Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: boolean) => any) | undefined;
    onChange?: ((event: Event) => any) | undefined;
    onClick?: ((event: MouseEvent) => any) | undefined;
}>, {
    modelValue: boolean | any;
    label: string;
    disabled: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
