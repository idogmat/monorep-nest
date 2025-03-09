export enum AuthError {
  EMAIL_ALREADY_REGISTERED = "User with this email is already registered",
  WRONG_CRED = "The email or password are incorrect. Try again please",
  CONFIRMATION_EXPIRED = "Code expired",
  CONFIRMATION_ERROR = "Email confirmation code confirmed or not valid",
}