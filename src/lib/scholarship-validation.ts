/**
 * Centralized Production-Grade Validation Module for Scholarship Platform
 */

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

// 1. Phone Number Validation (10 digits Indian mobile format)
export function validatePhone(phone: string): { isValid: boolean; message?: string; cleanPhone: string } {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required.', cleanPhone: '' }
  }

  // Clean non-digit characters
  const clean = phone.replace(/\D/g, '')

  // Standard Indian phone format allows optional country code '91' prefix
  let finalPhone = clean
  if (clean.length === 12 && clean.startsWith('91')) {
    finalPhone = clean.slice(2)
  }

  if (finalPhone.length !== 10) {
    return {
      isValid: false,
      message: `Phone number must be exactly 10 digits (e.g. 9876543210). Provided: ${finalPhone.length} digits.`,
      cleanPhone: finalPhone,
    }
  }

  if (!/^[6-9]\d{9}$/.test(finalPhone)) {
    return {
      isValid: false,
      message: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.',
      cleanPhone: finalPhone,
    }
  }

  return { isValid: true, cleanPhone: finalPhone }
}

// 2. Email Address Validation
export function validateEmail(email: string): { isValid: boolean; message?: string; cleanEmail: string } {
  if (!email) {
    return { isValid: false, message: 'Email address is required.', cleanEmail: '' }
  }

  const clean = email.trim().toLowerCase()
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  if (!emailRegex.test(clean)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address (e.g. name@domain.com).',
      cleanEmail: clean,
    }
  }

  return { isValid: true, cleanEmail: clean }
}

// 3. Name Validation (Min 2 chars, letters, spaces, dots, hyphens)
export function validateName(name: string, fieldName = 'Name'): { isValid: boolean; message?: string; cleanName: string } {
  if (!name || !name.trim()) {
    return { isValid: false, message: `${fieldName} is required.`, cleanName: '' }
  }

  const clean = name.trim()
  if (clean.length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters long.`, cleanName: clean }
  }

  if (!/^[a-zA-Z\s.'-]+$/.test(clean)) {
    return { isValid: false, message: `${fieldName} should contain only letters, spaces, and standard name symbols (. '-).`, cleanName: clean }
  }

  return { isValid: true, cleanName: clean }
}

// 4. Pincode Validation (6 numeric digits)
export function validatePincode(pincode: string): { isValid: boolean; message?: string; cleanPincode: string } {
  if (!pincode) {
    return { isValid: false, message: 'Pincode is required.', cleanPincode: '' }
  }

  const clean = pincode.toString().trim()
  if (!/^\d{6}$/.test(clean)) {
    return { isValid: false, message: 'Pincode must be exactly 6 numeric digits.', cleanPincode: clean }
  }

  return { isValid: true, cleanPincode: clean }
}

// 5. Percentage / CGPA Validation
export function validatePercentage(percentage: number | string): { isValid: boolean; message?: string; value: number } {
  if (percentage === undefined || percentage === null || percentage === '') {
    return { isValid: false, message: 'Percentage / Marks score is required.', value: 0 }
  }

  const num = typeof percentage === 'number' ? percentage : parseFloat(percentage)

  if (isNaN(num)) {
    return { isValid: false, message: 'Please enter a numeric percentage value.', value: 0 }
  }

  if (num < 0 || num > 100) {
    return { isValid: false, message: 'Percentage must be between 0% and 100%.', value: num }
  }

  return { isValid: true, value: num }
}

// 6. Family Income Validation
export function validateIncome(income: number | string): { isValid: boolean; message?: string; value: number } {
  if (income === undefined || income === null || income === '') {
    return { isValid: false, message: 'Annual family income is required.', value: 0 }
  }

  const num = typeof income === 'number' ? income : parseFloat(income)

  if (isNaN(num) || num <= 0) {
    return { isValid: false, message: 'Please enter a valid positive amount for annual family income (in Lakhs or ₹).', value: 0 }
  }

  return { isValid: true, value: num }
}

// 7. Bank IFSC Code Validation
export function validateIFSC(ifsc: string): { isValid: boolean; message?: string; cleanIFSC: string } {
  if (!ifsc) {
    return { isValid: false, message: 'IFSC Code is required for bank transfer.', cleanIFSC: '' }
  }

  const clean = ifsc.trim().toUpperCase()
  // Format: 4 letters, 0, 6 digits/letters (e.g. SBIN0001234, PUNB0123400)
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(clean)) {
    return { isValid: false, message: 'Invalid IFSC Code format (e.g. SBIN0001234 - 11 characters).', cleanIFSC: clean }
  }

  return { isValid: true, cleanIFSC: clean }
}

// 8. Bank Account Number Validation (9 to 18 numeric digits)
export function validateAccountNumber(acc: string): { isValid: boolean; message?: string; cleanAcc: string } {
  if (!acc) {
    return { isValid: false, message: 'Account Number is required.', cleanAcc: '' }
  }

  const clean = acc.trim()
  if (!/^\d{9,18}$/.test(clean)) {
    return { isValid: false, message: 'Bank Account Number must be between 9 and 18 numeric digits.', cleanAcc: clean }
  }

  return { isValid: true, cleanAcc: clean }
}

// 9. UPI ID / VPA Validation
export function validateUPI(upi: string): { isValid: boolean; message?: string; cleanUPI: string } {
  if (!upi) {
    return { isValid: true, cleanUPI: '' } // Optional if bank account provided
  }

  const clean = upi.trim()
  if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(clean)) {
    return { isValid: false, message: 'Invalid UPI ID format (e.g. mobile@upi or username@okicici).', cleanUPI: clean }
  }

  return { isValid: true, cleanUPI: clean }
}

// Full Application Validation Runner
export function validateScholarshipFormData(formData: any): ValidationResult {
  const errors: Record<string, string> = {}

  // Name
  const nameRes = validateName(formData.applicant_name, 'Full Name')
  if (!nameRes.isValid) errors.applicant_name = nameRes.message!

  // Phone
  const phoneRes = validatePhone(formData.applicant_phone)
  if (!phoneRes.isValid) errors.applicant_phone = phoneRes.message!

  // Email
  const emailRes = validateEmail(formData.applicant_email)
  if (!emailRes.isValid) errors.applicant_email = emailRes.message!

  // Address
  if (!formData.address?.trim()) {
    errors.address = 'Residential Address is required.'
  }

  // Pincode (if provided)
  if (formData.pincode) {
    const pinRes = validatePincode(formData.pincode)
    if (!pinRes.isValid) errors.pincode = pinRes.message!
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
