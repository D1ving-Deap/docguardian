
import { supabase } from "@/integrations/supabase/client";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
    return "Password must contain uppercase, lowercase, numbers, and special characters";
  }

  return null;
};

export const getAuthErrorMessage = (error: any): string => {
  const errorCode = error.code || "";
  const errorMessage = error.message || "";
  
  // Check for specific Supabase error messages
  if (errorMessage.includes("Email not confirmed")) {
    return "Your email is not verified. Please check your inbox for the verification link.";
  }
  
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please log in instead.";
    case "auth/invalid-email":
      return "Invalid email address format.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
      return "No account found with this email. Please register first.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed login attempts. Please try again later.";
    case "auth/weak-password":
      return "Password is too weak. It must be at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    case "auth/email-not-confirmed":
      return "Your email is not verified. Please check your inbox for the verification link.";
    default:
      // For Supabase-specific errors without a code
      if (errorMessage.includes("already registered")) {
        return "This email is already registered. Please log in instead.";
      }
      return errorMessage || "An unexpected error occurred. Please try again.";
  }
};

export const resendVerificationEmail = async (email: string): Promise<void> => {
  try {
    // In Supabase v2, we use resend for resending verification emails
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: "https://verify-flow.com", // ✅ full URL with protocol
      }
    });

    if (error) throw error;
  } catch (error: any) {
    // If there's an error that the user doesn't exist, we'll sign them up
    if (error.message.includes("User not found") || error.message.includes("Invalid user")) {
      // This is a fallback in case the user was not found
      console.log("User not found, attempting to sign up instead");
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: generateTempPassword(), // Generate a secure random password
        options: {
          emailRedirectTo: "https://verify-flow.com", // ✅ full URL with protocol
        },
      });
      
      if (signUpError) throw signUpError;
    } else {
      throw error;
    }
  }
};

// Generate a secure temporary password for signup fallback
function generateTempPassword(): string {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*(),.?":{}|<>';
  
  // Ensure at least one of each character type
  let password = '';
  password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
  password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
  password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Fill the rest with random characters from all sets
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  for (let i = 0; i < 12; i++) { // Add 12 more characters for a total of 16
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

export const validateTwoFactorCode = (code: string): boolean => {
  // Simple validation to check if the code is 6 digits
  return /^\d{6}$/.test(code);
};
