import { computed, inject, toValue, type ComputedRef, type Ref } from 'vue'
import { all as allVeeValidations } from '@vee-validate/rules'

export type ValidationRule = (
    value: unknown,
    params?: unknown[]
) => boolean | string | Promise<boolean | string>

export type ValidationMessageParams = Record<string, string>

export type SupportedLocale = 'fa' | 'en' | string

export interface ValidationConfig {
    locale?: SupportedLocale
    i18n?: (key: string, named?: ValidationMessageParams) => string
    customRules?: Record<string, ValidationRule>
    messages?: Record<SupportedLocale, Record<string, string>> | Record<string, string>
}

export const FORM_VALIDATOR_KEY = Symbol('FormValidator')

export const defaultMessages: Record<string, Record<string, string>> = {
    fa: {
        required: 'فیلد {field} الزامی است',
        email: 'فیلد {field} باید یک ایمیل معتبر باشد',
        min: 'فیلد {field} باید حداقل {min} کاراکتر باشد',
        max: 'فیلد {field} باید حداکثر {max} کاراکتر باشد',
        length: 'فیلد {field} باید {length} کاراکتر باشد',
        digits: 'فیلد {field} باید دقیقاً {length} رقم باشد',
        numeric: 'فیلد {field} باید عددی باشد',
        integer: 'فیلد {field} باید عدد صحیح باشد',
        decimal: 'فیلد {field} باید عددی اعشاری باشد',
        alpha: 'فیلد {field} باید فقط شامل حروف باشد',
        alpha_num: 'فیلد {field} باید فقط شامل حروف و اعداد باشد',
        alpha_dash: 'فیلد {field} باید فقط شامل حروف، اعداد، خط تیره و زیرخط باشد',
        min_value: 'مقدار فیلد {field} باید حداقل {min} باشد',
        max_value: 'مقدار فیلد {field} باید حداکثر {max} باشد',
        between: 'مقدار فیلد {field} باید بین {min} و {max} باشد',
        confirmed: 'مقدار فیلد {field} با مقدار تأییدشده یکسان نیست',
        url: 'فیلد {field} باید یک آدرس معتبر باشد',
        regex: 'فرمت فیلد {field} معتبر نیست',
        before: 'تاریخ فیلد {field} باید قبل از {target} باشد',
        after: 'تاریخ فیلد {field} باید بعد از {target} باشد',
        before_or_equal: 'تاریخ فیلد {field} باید قبل یا مساوی {target} باشد',
        after_or_equal: 'تاریخ فیلد {field} باید بعد یا مساوی {target} باشد'
    },
    en: {
        required: 'The {field} field is required',
        email: 'The {field} field must be a valid email',
        min: 'The {field} field must be at least {min} characters',
        max: 'The {field} field must not be greater than {max} characters',
        length: 'The {field} field must be {length} characters',
        digits: 'The {field} field must be {length} digits',
        numeric: 'The {field} field must be numeric',
        integer: 'The {field} field must be an integer',
        decimal: 'The {field} field must be a decimal number',
        alpha: 'The {field} field may only contain alphabetic characters',
        alpha_num: 'The {field} field may only contain alpha-numeric characters',
        alpha_dash: 'The {field} field may only contain alpha-numeric characters, dashes, and underscores',
        min_value: 'The {field} field must be {min} or greater',
        max_value: 'The {field} field must be {max} or less',
        between: 'The {field} field must be between {min} and {max}',
        confirmed: 'The {field} field confirmation does not match',
        url: 'The {field} field must be a valid URL',
        regex: 'The {field} field format is invalid',
        before: 'The {field} field must be before {target}',
        after: 'The {field} field must be after {target}',
        before_or_equal: 'The {field} field must be before or equal to {target}',
        after_or_equal: 'The {field} field must be after or equal to {target}'
    }
}

export const createFormBuilderValidation = (
    config: ValidationConfig = {}
) => {
    let currentConfig: ValidationConfig = {
        locale: 'en',
        ...config
    }

    const allValidations: Record<string, ValidationRule> = {
        ...allVeeValidations,
        ...(currentConfig.customRules || {})
    }

    const getMessageDictionary = (): Record<string, string> => {
        const locale: SupportedLocale = currentConfig.locale || 'en'
        const base = defaultMessages[locale] || defaultMessages.en || {}

        if (!currentConfig.messages) {
            return base
        }

        const custom = currentConfig.messages as Record<string, any>
        if (typeof custom[locale] === 'object' && custom[locale] !== null) {
            return { ...base, ...custom[locale] }
        }

        if (typeof currentConfig.messages === 'object') {
            return { ...base, ...(currentConfig.messages as Record<string, string>) }
        }

        return base
    }

    const translate = (
        key: string,
        params: ValidationMessageParams
    ): string => {
        if (currentConfig.i18n) {
            return currentConfig.i18n(key, params)
        }

        const dict = getMessageDictionary()
        const ruleKey = key.replace('error.validation.', '')
        const message = dict[ruleKey] || key

        return message.replace(
            /\{(\w+)}/g,
            (_: string, paramName: string) => params[paramName] ?? `{${paramName}}`
        )
    }

    const getRuleParamsForTranslation = (
        ruleName: string,
        ruleParams: unknown[]
    ): ValidationMessageParams => {
        const firstParam = ruleParams[0]

        switch (ruleName) {
            case 'digits':
            case 'length':
                return { length: String(firstParam ?? '') }

            case 'min':
                return { min: String(firstParam ?? '') }

            case 'max':
                return { max: String(firstParam ?? '') }

            case 'between':
                return {
                    min: String(ruleParams[0] ?? ''),
                    max: String(ruleParams[1] ?? '')
                }

            case 'min_value':
                return { min: String(firstParam ?? '') }

            case 'max_value':
                return { max: String(firstParam ?? '') }

            case 'size':
                return { size: String(firstParam ?? '') }

            case 'dimensions':
                return {
                    width: String(ruleParams[0] ?? ''),
                    height: String(ruleParams[1] ?? '')
                }

            case 'before':
            case 'after':
            case 'before_or_equal':
            case 'after_or_equal':
                return { target: String(firstParam ?? '') }

            default:
                return {}
        }
    }

    const getRuleTranslation = (
        ruleName: string,
        ruleParams: unknown[],
        fieldName: string
    ): string => {
        const params: ValidationMessageParams = {
            field: fieldName || '-',
            ...getRuleParamsForTranslation(ruleName, ruleParams)
        }

        return translate(`error.validation.${ruleName}`, params)
    }

    const parseRule = (rule: string) => {
        const separatorIndex = rule.indexOf(':')

        if (separatorIndex === -1) {
            return { name: rule, params: [] }
        }

        const name = rule.slice(0, separatorIndex)
        const rawParams = rule.slice(separatorIndex + 1)

        if (name === 'regex') {
            return { name, params: [rawParams] }
        }

        return { name, params: rawParams.split(',') }
    }

    const normalizeRules = (
        rulesString: string
    ): Array<{ name: string; params: unknown[] }> => {
        const rules: Array<{ name: string; params: unknown[] }> = []
        let currentRule = ''
        let insideRegex = false

        for (const part of rulesString.split('|')) {
            if (part.startsWith('regex:')) {
                currentRule = part
                insideRegex = true
                continue
            }

            if (insideRegex) {
                currentRule += `|${part}`
                if (part.endsWith('/')) {
                    rules.push(parseRule(currentRule))
                    currentRule = ''
                    insideRegex = false
                }
                continue
            }

            const parsedRule = parseRule(part)
            if (parsedRule.name) {
                rules.push(parsedRule)
            }
        }

        if (currentRule) {
            rules.push(parseRule(currentRule))
        }

        return rules
    }

    const parseRules = (
        targetRules: string,
        fieldName = ''
    ): ValidationRule[] => {
        return normalizeRules(targetRules).map(({ name, params }) => {
            // تبدیل به تابع async تا Promise ها به درستی resolve شوند
            const ruleFunction = (async (inputValue: unknown) => {
                const validation = allValidations[name]

                if (!validation) {
                    return `Validation rule "${name}" is not registered`
                }

                // اینجا await اضافه شد
                const result = await validation(inputValue, params)

                if (result === true) return true
                if (typeof result === 'string') return result

                return getRuleTranslation(name, params, fieldName)
            }) as ValidationRule & {
                ruleName?: string
                ruleParams?: unknown[]
            }

            ruleFunction.ruleName = name
            ruleFunction.ruleParams = params

            return ruleFunction
        })
    }

    return {
        parseRules,
        registerRule: (name: string, rule: ValidationRule) => {
            allValidations[name] = rule
        },
        registerRules: (rules: Record<string, ValidationRule>) => {
            Object.assign(allValidations, rules)
        },
        updateConfig: (newConfig: ValidationConfig) => {
            currentConfig = { ...currentConfig, ...newConfig }
            if (newConfig.customRules) {
                Object.assign(allValidations, newConfig.customRules)
            }
        }
    }
}

export function useInputRules(props: {
    rules?: unknown
    label?: string | Ref<string> | ComputedRef<string> | (() => string)
}) {
    const validator = inject<
        ReturnType<typeof createFormBuilderValidation>
    >(FORM_VALIDATOR_KEY)

    const parsedRules = computed(() => {
        const rawRules = toValue(props.rules)
        const rawLabel = toValue(props.label) || ''

        if (!rawRules) return []
        if (!validator || typeof rawRules !== 'string') return rawRules

        return validator.parseRules(rawRules, rawLabel)
    })

    return { parsedRules }
}
