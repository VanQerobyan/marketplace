import isEmail from 'validator/lib/isEmail'
import isLength from 'validator/lib/isLength'

const trimInput = (value: string = '') => value.trim()

export const FirstNameValidator = {
    setValueAs: trimInput,
    required: 'Please enter your first name',
    validate: (value: string) =>
        isLength(value, { max: 50 }) || 'First name must be at most 50 characters'
}

export const LastNameValidator = {
    setValueAs: trimInput,
    required: 'Please enter your last name',
    validate: (value: string) =>
        isLength(value, { max: 50 }) || 'Last name must be at most 50 characters'
}

export const EmailValidator = {
    setValueAs: trimInput,
    required: 'Please enter your email address',
    validate: (value: string) => isEmail(value) || 'Please enter a valid email address'
}

export const UsernameValidator = {
    setValueAs: trimInput,
    required: 'Please enter your username',
    minLength: {
        value: 3,
        message: 'Username must be at least 3 characters'
    },
    maxLength: {
        value: 30,
        message: 'Username must be at most 30 characters'
    },
    pattern: {
        value: /^[A-Za-z0-9_]+$/,
        message: 'Username can contain only letters, numbers and underscores'
    }
}

export const PasswordValidator = {
    required: 'Please enter your password',
    minLength: {
        value: 8,
        message: 'Password must be at least 8 characters'
    },
    pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        message: 'Use at least 8 characters with uppercase, lowercase, a number and one of @$!%*?&'
    }
}
