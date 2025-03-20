export enum AuthError {
  EMAIL_ALREADY_REGISTERED = "User with this email is already registered",
  WRONG_CRED = "The email or password are incorrect. Try again please",
  CONFIRMATION_EXPIRED = "Code expired",
  CONFIRMATION_ERROR = "Email confirmation code confirmed or not valid",
  INVALID_GOOGLE_TOKEN = "Google token payload is empty",
  GOOGLE_AUTH_FAILED = "Failed to validate Google code",
  INVALID_GITHUB_TOKEN = "Invalid github token",
  GITHUB_USER_DOESNT_HAVE_EMAIL = "Github doesnt return email for user"

}