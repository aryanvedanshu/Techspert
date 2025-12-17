/**
 * Password generation utility for payment-confirmed leads
 * Rule: First 3 letters of first name + 2 letters of last name + @$ + last 4 digits of phone
 * Example: "John Doe" + "9876543210" => "Joh" + "Do" + "@$" + "3210" => "JohDo@$3210"
 */

export const generateLeadPassword = (firstName, lastName, phone) => {
    if (!firstName || !lastName || !phone) {
        throw new Error('First name, last name, and phone are required')
    }

    // Get first 3 letters of first name (padded if shorter)
    const first3 = firstName.substring(0, 3).padEnd(3, 'x')

    // Get first 2 letters of last name (padded if shorter)
    const last2 = lastName.substring(0, 2).padEnd(2, 'x')

    // Get last 4 digits of phone (remove non-digits first)
    const digitsOnly = phone.replace(/\D/g, '')
    const last4 = digitsOnly.slice(-4).padStart(4, '0')

    // Combine with @$
    return `${first3}${last2}@$${last4}`
}

/**
 * Parse full name into first and last name
 */
export const parseFullName = (fullName) => {
    if (!fullName) return { firstName: '', lastName: '' }

    const parts = fullName.trim().split(/\s+/)
    const firstName = parts[0] || ''
    const lastName = parts.slice(1).join(' ') || parts[0] || ''

    return { firstName, lastName }
}

/**
 * Generate password from full name and phone
 */
export const generatePasswordFromFullName = (fullName, phone) => {
    const { firstName, lastName } = parseFullName(fullName)
    return generateLeadPassword(firstName, lastName, phone)
}

export default {
    generateLeadPassword,
    parseFullName,
    generatePasswordFromFullName,
}
