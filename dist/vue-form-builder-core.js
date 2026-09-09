import { Fragment as e, computed as t, createBlock as n, createCommentVNode as r, createElementBlock as i, createElementVNode as a, defineComponent as o, markRaw as s, mergeProps as c, nextTick as l, normalizeClass as u, normalizeStyle as d, onMounted as f, openBlock as p, ref as m, renderList as h, resolveDynamicComponent as g, toDisplayString as _, toRaw as ee, watch as v } from "vue";
import * as y from "shvl";
//#region src/components/FormBuilderInput.vue?vue&type=script&setup=true&lang.ts
var b = { class: "form-builder-field" }, x = ["for"], S = [
	"id",
	"value",
	"type",
	"name",
	"placeholder",
	"disabled",
	"readonly"
], C = /* @__PURE__ */ o({
	__name: "FormBuilderInput",
	props: {
		name: {},
		modelValue: { default: "" },
		type: { default: "text" },
		label: { default: "" },
		placeholder: { default: "" },
		disabled: {
			type: Boolean,
			default: !1
		},
		readonly: {
			type: Boolean,
			default: !1
		}
	},
	emits: [
		"update:modelValue",
		"input",
		"change",
		"click"
	],
	setup(e, { expose: t, emit: n }) {
		let o = n, s = m(null), c = (e) => {
			let t = e.target;
			o("update:modelValue", t.value), o("input", e);
		}, l = (e) => {
			o("change", e);
		}, u = (e) => {
			o("click", e);
		};
		return t({
			focus: () => {
				s.value?.focus();
			},
			inputRef: s
		}), (t, n) => (p(), i("div", b, [e.label ? (p(), i("label", {
			key: 0,
			for: e.name,
			class: "form-builder-label"
		}, _(e.label), 9, x)) : r("", !0), a("input", {
			id: e.name,
			ref_key: "inputRef",
			ref: s,
			value: e.modelValue,
			type: e.type,
			name: e.name,
			placeholder: e.placeholder,
			disabled: e.disabled,
			readonly: e.readonly,
			class: "form-builder-native-input",
			onInput: c,
			onChange: l,
			onClick: u
		}, null, 40, S)]));
	}
}), w = { class: "form-builder-field" }, T = ["for"], E = [
	"id",
	"name",
	"disabled",
	"multiple",
	"accept"
], D = /* @__PURE__ */ o({
	__name: "FormBuilderFile",
	props: {
		name: {},
		modelValue: { default: null },
		label: { default: "" },
		disabled: {
			type: Boolean,
			default: !1
		},
		multiple: {
			type: Boolean,
			default: !1
		},
		accept: { default: "" }
	},
	emits: [
		"update:modelValue",
		"change",
		"click"
	],
	setup(e, { expose: t, emit: n }) {
		let o = e, s = n, c = m(null), l = (e) => {
			let t = e.target;
			if (t.files) {
				let e = o.multiple ? Array.from(t.files) : t.files[0] || null;
				s("update:modelValue", e);
			}
			s("change", e);
		}, u = (e) => {
			s("click", e);
		};
		return t({
			focus: () => {
				c.value?.focus();
			},
			fileRef: c
		}), (t, n) => (p(), i("div", w, [e.label ? (p(), i("label", {
			key: 0,
			for: e.name,
			class: "form-builder-label"
		}, _(e.label), 9, T)) : r("", !0), a("input", {
			id: e.name,
			ref_key: "fileRef",
			ref: c,
			type: "file",
			name: e.name,
			disabled: e.disabled,
			multiple: e.multiple,
			accept: e.accept,
			class: "form-builder-native-input",
			onChange: l,
			onClick: u
		}, null, 40, E)]));
	}
}), O = { class: "form-builder-field" }, k = ["for"], A = [
	"id",
	"value",
	"name",
	"placeholder",
	"disabled",
	"readonly",
	"rows"
], j = /* @__PURE__ */ o({
	__name: "FormBuilderTextarea",
	props: {
		name: {},
		modelValue: { default: "" },
		label: { default: "" },
		placeholder: { default: "" },
		disabled: {
			type: Boolean,
			default: !1
		},
		readonly: {
			type: Boolean,
			default: !1
		},
		rows: { default: 3 }
	},
	emits: [
		"update:modelValue",
		"input",
		"change",
		"click"
	],
	setup(e, { expose: t, emit: n }) {
		let o = n, s = m(null), c = (e) => {
			let t = e.target;
			o("update:modelValue", t.value), o("input", e);
		}, l = (e) => {
			o("change", e);
		}, u = (e) => {
			o("click", e);
		};
		return t({
			focus: () => {
				s.value?.focus();
			},
			textareaRef: s
		}), (t, n) => (p(), i("div", O, [e.label ? (p(), i("label", {
			key: 0,
			for: e.name,
			class: "form-builder-label"
		}, _(e.label), 9, k)) : r("", !0), a("textarea", {
			id: e.name,
			ref_key: "textareaRef",
			ref: s,
			value: e.modelValue,
			name: e.name,
			placeholder: e.placeholder,
			disabled: e.disabled,
			readonly: e.readonly,
			rows: e.rows,
			class: "form-builder-native-input form-builder-textarea",
			onInput: c,
			onChange: l,
			onClick: u
		}, null, 40, A)]));
	}
}), M = { class: "form-builder-select" }, N = ["for"], P = [
	"id",
	"name",
	"value",
	"disabled",
	"required",
	"aria-readonly"
], F = {
	key: 0,
	value: "",
	disabled: ""
}, I = ["value", "disabled"], te = /* @__PURE__ */ o({
	__name: "FormBuilderSelect",
	props: {
		modelValue: { default: null },
		label: { default: "" },
		name: { default: "" },
		id: { default: "" },
		options: { default: () => [] },
		placeholder: { default: "" },
		disabled: {
			type: Boolean,
			default: !1
		},
		readonly: {
			type: Boolean,
			default: !1
		},
		required: {
			type: Boolean,
			default: !1
		}
	},
	emits: ["update:modelValue", "change"],
	setup(n, { emit: o }) {
		let s = n, c = o, l = t(() => s.id || (s.name ? `form-builder-select-${s.name}` : void 0)), u = (e) => {
			let t = e.target, n = s.options.find((e) => String(e.value) === t.value);
			c("update:modelValue", n?.value ?? null), c("change", e);
		};
		return (t, o) => (p(), i("div", M, [n.label ? (p(), i("label", {
			key: 0,
			class: "form-builder-select__label",
			for: l.value
		}, _(n.label), 9, N)) : r("", !0), a("select", {
			id: l.value,
			class: "form-builder-select__control",
			name: n.name || void 0,
			value: n.modelValue ?? "",
			disabled: n.disabled || n.readonly,
			required: n.required,
			"aria-readonly": n.readonly,
			onChange: u
		}, [n.placeholder ? (p(), i("option", F, _(n.placeholder), 1)) : r("", !0), (p(!0), i(e, null, h(n.options, (e) => (p(), i("option", {
			key: String(e.value),
			value: e.value,
			disabled: e.disabled
		}, _(e.label), 9, I))), 128))], 40, P)]));
	}
}), L = { class: "form-builder-field-inline" }, R = [
	"id",
	"checked",
	"name",
	"disabled"
], z = ["for"], B = /* @__PURE__ */ o({
	__name: "FormBuilderCheckbox",
	props: {
		name: {},
		modelValue: {
			type: Boolean,
			default: !1
		},
		label: { default: "" },
		disabled: {
			type: Boolean,
			default: !1
		}
	},
	emits: [
		"update:modelValue",
		"change",
		"click"
	],
	setup(e, { expose: t, emit: n }) {
		let o = n, s = m(null), c = (e) => {
			let t = e.target;
			o("update:modelValue", t.checked), o("change", e);
		}, l = (e) => {
			o("click", e);
		};
		return t({
			focus: () => {
				s.value?.focus();
			},
			checkboxRef: s
		}), (t, n) => (p(), i("div", L, [a("input", {
			id: e.name,
			ref_key: "checkboxRef",
			ref: s,
			checked: !!e.modelValue,
			type: "checkbox",
			name: e.name,
			disabled: e.disabled,
			class: "form-builder-checkbox",
			onChange: c,
			onClick: l
		}, null, 40, R), e.label ? (p(), i("label", {
			key: 0,
			for: e.name,
			class: "form-builder-label"
		}, _(e.label), 9, z)) : r("", !0)]));
	}
}), V = { class: "form-builder-field" }, H = {
	key: 0,
	class: "form-builder-label"
}, U = [
	"id",
	"name",
	"value",
	"checked",
	"disabled",
	"onChange"
], W = ["for"], G = /* @__PURE__ */ o({
	__name: "FormBuilderRadio",
	props: {
		name: {},
		modelValue: { default: "" },
		label: { default: "" },
		disabled: {
			type: Boolean,
			default: !1
		},
		options: { default: () => [] }
	},
	emits: ["update:modelValue", "change"],
	setup(t, { expose: n, emit: o }) {
		let s = o, c = m([]), l = (e) => typeof e == "object" && e ? e.value === void 0 ? e.label : e.value : e, u = (e) => typeof e == "object" && e ? e.label === void 0 ? String(e.value) : e.label : String(e), d = (e, t) => {
			s("update:modelValue", e), s("change", t);
		};
		return n({ focus: () => {
			c.value[0]?.focus();
		} }), (n, o) => (p(), i("div", V, [t.label ? (p(), i("span", H, _(t.label), 1)) : r("", !0), (p(!0), i(e, null, h(t.options, (e, n) => (p(), i("div", {
			key: n,
			class: "form-builder-radio-item"
		}, [a("input", {
			id: `${t.name}-${n}`,
			ref_for: !0,
			ref_key: "radioRefs",
			ref: c,
			type: "radio",
			name: t.name,
			value: l(e),
			checked: t.modelValue === l(e),
			disabled: t.disabled,
			class: "form-builder-radio",
			onChange: (t) => d(l(e), t)
		}, null, 40, U), a("label", { for: `${t.name}-${n}` }, _(u(e)), 9, W)]))), 128))]));
	}
}), K = ["value", "name"], q = /* @__PURE__ */ o({
	__name: "FormBuilderHidden",
	props: {
		name: {},
		modelValue: {}
	},
	setup(e, { expose: t }) {
		let n = m(null);
		return t({ hiddenRef: n }), (t, r) => (p(), i("input", {
			ref_key: "hiddenRef",
			ref: n,
			value: e.modelValue,
			type: "hidden",
			name: e.name
		}, null, 8, K));
	}
}), J = /*#__PURE__*/ ((e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
})(/* @__PURE__ */ o({
	name: "FormBuilder",
	__name: "FormBuilder",
	props: {
		inputs: { default: void 0 },
		value: { default: void 0 },
		formData: { default: () => ({}) },
		formDataMode: {},
		readonly: {
			type: Boolean,
			default: !1
		},
		disabled: {
			type: Boolean,
			default: !1
		},
		loading: { type: Boolean },
		customClass: { default: "" }
	},
	emits: [
		"update:inputs",
		"update:value",
		"update:formData",
		"input",
		"change",
		"onClick"
	],
	setup(t, { expose: r, emit: a }) {
		let o = t, _ = a, b = m([]), x = m({}), S = !1, w = !1, T = 0, E = () => (T += 1, `fb-id-${T}`), O = (e = b.value) => {
			e.forEach((e) => {
				e.uid ||= E(), e.type === "formBuilder" && Array.isArray(e.inputs) && O(e.inputs);
			});
		}, k = (e = b.value) => {
			let t = {};
			return e.forEach((e) => {
				e.name && (e.type === "formBuilder" && Array.isArray(e.inputs) ? t[e.name] = e.value ?? k(e.inputs) : t[e.name] = e.value === void 0 ? null : e.value);
			}), t;
		}, A = (e) => {
			let t = {};
			return Object.entries(e).forEach(([e, n]) => {
				typeof n == "object" && n && !Array.isArray(n) ? Object.assign(t, A(n)) : t[e] = n;
			}), t;
		}, M = (e, t = b.value) => {
			!e || typeof e != "object" || t.forEach((t) => {
				if (!t.name || !(t.name in e)) return;
				let n = e[t.name];
				t.type === "formBuilder" && Array.isArray(t.inputs) && n && typeof n == "object" ? (M(n, t.inputs), t.value = { ...n }) : t.value = n;
			});
		}, N = () => {
			if (S) return;
			w = !0;
			let e = k(b.value);
			_("update:inputs", b.value), _("update:value", b.value);
			let t = o.formDataMode === "flat" ? A(e) : e;
			_("update:formData", t), l(() => {
				w = !1;
			});
		}, P = (e, t) => {
			if (!t.name) return;
			let n = `input-${t.name}-${t.uid || ""}`;
			e ? x.value[n] = e : delete x.value[n];
		}, F = (e) => {
			b.value = e.map((e) => typeof e.type == "object" || typeof e.type == "function" ? {
				...e,
				type: s(ee(e.type))
			} : { ...e }), O(b.value);
		}, I = {
			text: C,
			number: C,
			password: C,
			email: C,
			date: C,
			time: C,
			file: D,
			textarea: j,
			select: te,
			checkbox: B,
			radio: G,
			hidden: q
		}, L = (e) => typeof e.type == "object" || typeof e.type == "function" ? e.type : e.type === "formBuilder" ? "FormBuilder" : typeof e.type == "string" && I[e.type] ? I[e.type] : C, R = (e) => {
			let { col: t, customClass: n, value: r, uid: i, ...a } = e;
			return e.type === "formBuilder" ? {
				...a,
				formData: r || {}
			} : a;
		}, z = (e) => e.type === "hidden" ? "hidden-col" : e.col ? e.col : "col-12", V = (e) => e.type === "hidden" ? {
			display: "none",
			padding: 0,
			margin: 0
		} : {}, H = (e = b.value) => {
			for (let t of e) if (t.type === "formBuilder" && Array.isArray(t.inputs)) {
				let e = H(t.inputs);
				if (e) return e;
			} else return t;
			return null;
		}, U = () => {
			let e = H();
			if (!e) return;
			let t = `input-${e.name}-${e.uid || ""}`, n = x.value[t];
			n && (typeof n.focus == "function" ? n.focus() : n.$el && typeof n.$el.focus == "function" && n.$el.focus());
		}, W = () => k(b.value), K = (e) => {
			w || !e || (S = !0, M(e, b.value), N(), l(() => {
				S = !1;
			}));
		}, J = (e, t = b.value) => {
			for (let n of t) {
				if (n.name === e) return n;
				if (n.type === "formBuilder" && Array.isArray(n.inputs)) {
					let t = J(e, n.inputs);
					if (t) return t;
				}
			}
		}, Y = (e, t) => {
			let n = J(e);
			n && (n.value = t, N());
		}, X = (e, t = b.value) => {
			t.forEach((t) => {
				if (t.type === "formBuilder" && Array.isArray(t.inputs)) {
					X(e, t.inputs);
					return;
				}
				t.responseKey && (t.value = y.get(e, t.responseKey));
			}), N();
		}, Z = (e = b.value) => {
			e.forEach((e) => {
				e.type === "formBuilder" ? (e.value = {}, Array.isArray(e.inputs) && Z(e.inputs)) : e.value = null;
			}), N();
		}, Q = (e, t = b.value) => {
			t.forEach((t) => {
				t.type === "formBuilder" && Array.isArray(t.inputs) ? Q(e, t.inputs) : t.disabled = e;
			});
		}, $ = (e, t = b.value) => {
			t.forEach((t) => {
				t.type === "formBuilder" && Array.isArray(t.inputs) ? $(e, t.inputs) : t.readonly = e;
			});
		}, ne = (e, t) => {
			e.value = t, N();
		}, re = (e, t) => {
			e.type === "formBuilder" && (e.value = t), N();
		}, ie = (e, t) => {
			_("input", {
				event: e,
				index: t,
				data: b.value
			});
		}, ae = (e, t) => {
			_("change", {
				event: e,
				index: t,
				data: b.value
			});
		}, oe = (e, t) => {
			_("onClick", {
				event: e,
				input: t
			});
		};
		return v(() => o.inputs || o.value, (e) => {
			w || e && Array.isArray(e) && (F(e), O(), o.formData && Object.keys(o.formData).length > 0 && M(o.formData));
		}, {
			immediate: !0,
			deep: !0
		}), v(() => o.formData, (e) => {
			w || !e || Object.keys(e).length === 0 || M(e);
		}, { deep: !0 }), f(() => {
			O();
		}), r({
			focus: U,
			flattenFormData: A,
			getFormData: W,
			setFormData: K,
			getInputsByName: J,
			setInputByName: Y,
			setInputValues: X,
			clearValues: Z,
			disableAllInputs: Q,
			readonlyAllInputs: $
		}), (r, a) => (p(), i("div", { class: u(["row form-builder-container", t.customClass]) }, [(p(!0), i(e, null, h(b.value, (e, r) => (p(), i("div", {
			key: e.uid || r,
			class: u(["form-builder-col", z(e)]),
			style: d(V(e))
		}, [(p(), n(g(L(e)), c({
			"model-value": e.value,
			ref_for: !0,
			ref: (t) => P(t, e)
		}, { ref_for: !0 }, R(e), {
			loading: t.loading || e.loading,
			disabled: t.disabled || e.disabled,
			readonly: t.readonly || e.readonly,
			"onUpdate:modelValue": (t) => ne(e, t),
			"onUpdate:formData": (t) => re(e, t),
			onInput: (e) => ie(e, r),
			onChange: (e) => ae(e, r),
			onClick: (t) => oe(t, e)
		}), null, 16, [
			"model-value",
			"loading",
			"disabled",
			"readonly",
			"onUpdate:modelValue",
			"onUpdate:formData",
			"onInput",
			"onChange",
			"onClick"
		]))], 6))), 128))], 2));
	}
}), [["__scopeId", "data-v-4f895cec"]]), Y = J;
//#endregion
export { J as FormBuilder, Y as default };
