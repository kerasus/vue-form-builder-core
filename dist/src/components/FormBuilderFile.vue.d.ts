interface Props {
    name: string;
    modelValue?: File | File[] | FileList | null;
    label?: string;
    disabled?: boolean;
    multiple?: boolean;
    accept?: string;
}
declare const __VLS_export: import('vue').DefineComponent<Props, {
    focus: () => void;
    fileRef: import('vue').Ref<HTMLInputElement | null, HTMLInputElement | null>;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {} & {
    "update:modelValue": (value: File | File[] | null) => any;
    change: (event: Event) => any;
    click: (event: MouseEvent) => any;
}, string, import('vue').PublicProps, Readonly<Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: File | File[] | null) => any) | undefined;
    onChange?: ((event: Event) => any) | undefined;
    onClick?: ((event: MouseEvent) => any) | undefined;
}>, {
    label: string;
    disabled: boolean;
    multiple: boolean;
    modelValue: File | File[] | FileList | null;
    accept: string;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
