import { Fragment as e, computed as t, createBlock as n, createCommentVNode as r, createElementBlock as i, createElementVNode as a, createSlots as o, defineAsyncComponent as s, defineComponent as c, mergeProps as l, nextTick as u, normalizeClass as d, normalizeStyle as f, onMounted as p, openBlock as m, ref as h, renderList as g, renderSlot as _, resolveDynamicComponent as v, toDisplayString as y, unref as b, watch as x, withCtx as S } from "vue";
import * as C from "shvl";
//#region \0rolldown/runtime.js
var w = Object.defineProperty, T = (e, t) => {
	let n = {};
	for (var r in e) w(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || w(n, Symbol.toStringTag, { value: "Module" }), n;
};
//#endregion
//#region src/composables/useFormBuilder.ts
function E(e = {}) {
	let t = h([]), n = h({}), r = !1, i = !1, a = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "uid-" + Math.random().toString(36).substring(2, 9), o = (e = t.value) => {
		e.forEach((e) => {
			e.uid ||= a(), e.type === "formBuilder" && Array.isArray(e.value) && o(e.value);
		});
	}, s = (e = t.value) => {
		let n = {};
		return e.forEach((e) => {
			e.name && (e.type === "formBuilder" && Array.isArray(e.value) ? n[e.name] = s(e.value) : n[e.name] = e.value === void 0 ? null : e.value);
		}), n;
	}, c = (e, n = t.value) => {
		!e || typeof e != "object" || n.forEach((t) => {
			if (!t.name || !(t.name in e)) return;
			let n = e[t.name];
			t.type === "formBuilder" && Array.isArray(t.value) && typeof n == "object" ? c(n, t.value) : t.value = n;
		});
	}, l = () => {
		if (r) return;
		i = !0;
		let n = s(t.value);
		e.onUpdateInputs?.(t.value), e.onUpdateFormData?.(n), u(() => {
			i = !1;
		});
	}, d = (e, t) => !e || !t ? e : C.get(e, t), f = (e, t) => {
		if (e && t.name) {
			let r = `input-${t.name}-${t.uid || ""}`;
			n.value[r] = e;
		}
	}, p = (e = t.value) => {
		for (let t of e) if (t.type === "formBuilder" && Array.isArray(t.value)) {
			let e = p(t.value);
			if (e) return e;
		} else return t;
		return null;
	}, m = () => {
		let e = p();
		if (!e) return;
		let t = `input-${e.name}-${e.uid || ""}`, r = n.value[t];
		r && (typeof r.focus == "function" ? r.focus() : r.$el && typeof r.$el.focus == "function" && r.$el.focus());
	}, g = () => s(t.value), _ = (e) => {
		i || !e || (r = !0, c(e, t.value), l(), u(() => {
			r = !1;
		}));
	}, v = (e, n = t.value) => {
		for (let t of n) {
			if (t.name === e) return t;
			if (t.type === "formBuilder" && Array.isArray(t.value)) {
				let n = v(e, t.value);
				if (n) return n;
			}
		}
	}, y = (e, t) => {
		let n = v(e);
		n && (n.value = t, l());
	}, b = (e, n = t.value) => {
		n.forEach((t) => {
			if (t.type === "formBuilder" && Array.isArray(t.value)) {
				b(e, t.value);
				return;
			}
			t.responseKey && (t.value = C.get(e, t.responseKey));
		}), l();
	}, x = (e = t.value) => {
		e.forEach((e) => {
			e.type === "formBuilder" && Array.isArray(e.value) ? x(e.value) : e.value = e.type === "checkbox" ? !1 : Array.isArray(e.value) ? [] : null;
		}), l();
	}, S = (e, n = t.value) => {
		n.forEach((t) => {
			t.type === "formBuilder" && Array.isArray(t.value) ? S(e, t.value) : t.disabled = e;
		});
	}, w = (e, n = t.value) => {
		n.forEach((t) => {
			t.type === "formBuilder" && Array.isArray(t.value) ? w(e, t.value) : t.readonly = e;
		});
	};
	return {
		inputData: t,
		inputRefs: n,
		generateUid: a,
		setUidForInputs: o,
		extractFormData: s,
		applyFormDataToInputs: c,
		syncState: l,
		setInputRef: f,
		setInputs: (e) => {
			t.value = e ? JSON.parse(JSON.stringify(e)) : [], o(t.value);
		},
		getValidChainedObject: d,
		focus: m,
		getFormData: g,
		setFormData: _,
		getInputsByName: v,
		setInputByName: y,
		setInputValues: b,
		clearValues: x,
		disableAllInputs: S,
		readonlyAllInputs: w
	};
}
//#endregion
//#region src/components/FormBuilderInput.vue?vue&type=script&setup=true&lang.ts
var D = { class: "form-builder-field" }, O = ["for"], k = [
	"id",
	"value",
	"type",
	"name",
	"placeholder",
	"disabled",
	"readonly"
], A = /* @__PURE__ */ c({
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
		let o = n, s = h(null), c = (e) => {
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
		}), (t, n) => (m(), i("div", D, [e.label ? (m(), i("label", {
			key: 0,
			for: e.name,
			class: "form-builder-label"
		}, y(e.label), 9, O)) : r("", !0), a("input", {
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
		}, null, 40, k)]));
	}
}), j = { class: "form-builder-field" }, M = ["for"], N = [
	"id",
	"name",
	"disabled",
	"multiple",
	"accept"
], P = /* @__PURE__ */ c({
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
		let o = e, s = n, c = h(null), l = (e) => {
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
		}), (t, n) => (m(), i("div", j, [e.label ? (m(), i("label", {
			key: 0,
			for: e.name,
			class: "form-builder-label"
		}, y(e.label), 9, M)) : r("", !0), a("input", {
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
		}, null, 40, N)]));
	}
}), F = { class: "form-builder-field" }, I = ["for"], L = [
	"id",
	"value",
	"name",
	"placeholder",
	"disabled",
	"readonly",
	"rows"
], R = /* @__PURE__ */ c({
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
		let o = n, s = h(null), c = (e) => {
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
		}), (t, n) => (m(), i("div", F, [e.label ? (m(), i("label", {
			key: 0,
			for: e.name,
			class: "form-builder-label"
		}, y(e.label), 9, I)) : r("", !0), a("textarea", {
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
		}, null, 40, L)]));
	}
}), z = { class: "form-builder-select" }, B = ["for"], V = [
	"id",
	"name",
	"value",
	"disabled",
	"required",
	"aria-readonly"
], H = {
	key: 0,
	value: "",
	disabled: ""
}, U = ["value", "disabled"], ee = /* @__PURE__ */ c({
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
		return (t, o) => (m(), i("div", z, [n.label ? (m(), i("label", {
			key: 0,
			class: "form-builder-select__label",
			for: l.value
		}, y(n.label), 9, B)) : r("", !0), a("select", {
			id: l.value,
			class: "form-builder-select__control",
			name: n.name || void 0,
			value: n.modelValue ?? "",
			disabled: n.disabled || n.readonly,
			required: n.required,
			"aria-readonly": n.readonly,
			onChange: u
		}, [n.placeholder ? (m(), i("option", H, y(n.placeholder), 1)) : r("", !0), (m(!0), i(e, null, g(n.options, (e) => (m(), i("option", {
			key: String(e.value),
			value: e.value,
			disabled: e.disabled
		}, y(e.label), 9, U))), 128))], 40, V)]));
	}
}), W = { class: "form-builder-field-inline" }, G = [
	"id",
	"checked",
	"name",
	"disabled"
], K = ["for"], te = /* @__PURE__ */ c({
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
		let o = n, s = h(null), c = (e) => {
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
		}), (t, n) => (m(), i("div", W, [a("input", {
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
		}, null, 40, G), e.label ? (m(), i("label", {
			key: 0,
			for: e.name,
			class: "form-builder-label"
		}, y(e.label), 9, K)) : r("", !0)]));
	}
}), q = { class: "form-builder-field" }, J = {
	key: 0,
	class: "form-builder-label"
}, Y = [
	"id",
	"name",
	"value",
	"checked",
	"disabled",
	"onChange"
], X = ["for"], ne = /* @__PURE__ */ c({
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
		let s = o, c = h([]), l = (e) => typeof e == "object" && e ? e.value === void 0 ? e.label : e.value : e, u = (e) => typeof e == "object" && e ? e.label === void 0 ? String(e.value) : e.label : String(e), d = (e, t) => {
			s("update:modelValue", e), s("change", t);
		};
		return n({ focus: () => {
			c.value[0]?.focus();
		} }), (n, o) => (m(), i("div", q, [t.label ? (m(), i("span", J, y(t.label), 1)) : r("", !0), (m(!0), i(e, null, g(t.options, (e, n) => (m(), i("div", {
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
		}, null, 40, Y), a("label", { for: `${t.name}-${n}` }, y(u(e)), 9, X)]))), 128))]));
	}
}), Z = ["value", "name"], re = /* @__PURE__ */ c({
	__name: "FormBuilderHidden",
	props: {
		name: {},
		modelValue: {}
	},
	setup(e, { expose: t }) {
		let n = h(null);
		return t({ hiddenRef: n }), (t, r) => (m(), i("input", {
			ref_key: "hiddenRef",
			ref: n,
			value: e.modelValue,
			type: "hidden",
			name: e.name
		}, null, 8, Z));
	}
}), Q = /*@__PURE__*/ c({
	__name: "FormBuilder",
	props: {
		inputs: { default: void 0 },
		value: { default: void 0 },
		formData: { default: () => ({}) },
		disable: {
			type: Boolean,
			default: !1
		},
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
		let c = s(() => Promise.resolve().then(() => ae)), u = t, y = a;
		h({});
		let { inputData: C, setInputRef: w, setUidForInputs: T, setInputs: D, syncState: O, applyFormDataToInputs: k, focus: j, getFormData: M, setFormData: N, getInputsByName: F, setInputByName: I, setInputValues: L, clearValues: z, disableAllInputs: B, readonlyAllInputs: V } = E({
			onUpdateInputs: (e) => {
				y("update:inputs", e), y("update:value", e);
			},
			onUpdateFormData: (e) => {
				y("update:formData", e);
			}
		}), H = {
			text: A,
			number: A,
			password: A,
			email: A,
			date: A,
			time: A,
			file: P,
			textarea: R,
			select: ee,
			checkbox: te,
			radio: ne,
			hidden: re
		};
		x(() => u.inputs || u.value, (e) => {
			e && Array.isArray(e) && (D(e), T(), u.formData && Object.keys(u.formData).length > 0 && k(u.formData));
		}, {
			immediate: !0,
			deep: !0
		}), x(() => u.formData, (e) => {
			!e || Object.keys(e).length === 0 || k(e);
		}, { deep: !0 }), p(() => {
			T();
		});
		let U = (e) => typeof e.type == "object" || typeof e.type == "function" ? e.type : e.type === "formBuilder" ? c : typeof e.type == "string" && H[e.type] ? H[e.type] : A, W = (e) => {
			let { col: t, customClass: n, value: r, uid: i, ...a } = e;
			return a;
		}, G = (e) => {
			if (typeof e.type != "object" || !e.type) return [];
			let t = typeof e.type.data == "function" ? e.type.data() : e.type.data;
			return t && Array.isArray(t.slots) ? t.slots : [];
		}, K = (e) => e.type === "hidden" ? "hidden-col" : e.col ? e.col : "col-12", q = (e) => e.type === "hidden" ? {
			display: "none",
			padding: 0,
			margin: 0
		} : {}, J = (e, t) => {
			e.value = t, O();
		}, Y = (e, t) => {
			e.type === "formBuilder" && (e.value = t), O();
		}, X = (e, t) => {
			y("input", {
				event: e,
				index: t,
				data: C.value
			});
		}, Z = (e, t) => {
			y("change", {
				event: e,
				index: t,
				data: C.value
			});
		}, Q = (e, t) => {
			y("onClick", {
				event: e,
				input: t
			});
		};
		return r({
			focus: j,
			getFormData: M,
			setFormData: N,
			getInputsByName: F,
			setInputByName: I,
			setInputValues: L,
			clearValues: z,
			disableAllInputs: B,
			readonlyAllInputs: V
		}), (r, a) => (m(), i("div", { class: d(["row form-builder-container", t.customClass]) }, [(m(!0), i(e, null, g(b(C), (e, a) => (m(), i("div", {
			key: e.uid || a,
			class: d(["form-builder-col", K(e)]),
			style: f(q(e))
		}, [(m(), n(v(U(e)), l({
			ref_for: !0,
			ref: (t) => b(w)(t, e),
			"model-value": e.value
		}, { ref_for: !0 }, W(e), {
			disabled: t.disable || e.disabled,
			readonly: e.readonly,
			"onUpdate:modelValue": (t) => J(e, t),
			"onUpdate:formData": (t) => Y(e, t),
			onInput: (e) => X(e, a),
			onChange: (e) => Z(e, a),
			onClick: (t) => Q(t, e)
		}), o({ _: 2 }, [g(G(e), (e) => ({
			name: e,
			fn: S((t) => [_(r.$slots, e, l({ ref_for: !0 }, t || {}), void 0, !0)])
		}))]), 1040, [
			"model-value",
			"disabled",
			"readonly",
			"onUpdate:modelValue",
			"onUpdate:formData",
			"onInput",
			"onChange",
			"onClick"
		]))], 6))), 128))], 2));
	}
}), ie = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, ae = /* @__PURE__ */ T({ default: () => $ }), $ = /*#__PURE__*/ ie(Q, [["__scopeId", "data-v-77dcfe13"]]), oe = $;
//#endregion
export { $ as FormBuilder, oe as default, E as useFormBuilder };
