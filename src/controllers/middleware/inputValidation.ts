import { Next, Req } from "../../frameworks/types/serverPackageTypes";
import { TInputValidation } from "../../useCasese/interface/inputValidation/inputValidation";
import ErrorHandler from "../../useCasese/middlewares/errorHandler";

// Mail format
const mailValidation = (email: string): boolean => {
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password complexity check
const isStrongPassword = (password: string): boolean => {
  // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one digit, and one special character
  const passwordRegex: RegExp =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
  return passwordRegex.test(password);
};

export const inputValidation: TInputValidation = async (
  req: Req,
  route: string,
  next: Next
) => {
  // Trim and validate required fields
  for (const prop in req.body) {
    // if (req.body.hasOwnProperty(prop)) { this was my code but eslint gave warning so that it is changed
    if (Object.prototype.hasOwnProperty.call(req.body, prop)) {
      //by this it will avoid the trim application on any prototype chained props
      if (typeof req.body[prop] === "string") {
        req.body[prop] = req.body[prop].trim();

        // empty space checking
        if (!req.body[prop]) {
          return next(new ErrorHandler(400, "required fields are missing"));
        }

        if (prop === "email") {
          if (!mailValidation(req.body[prop])) {
            return next(new ErrorHandler(400, "Invalid email format"));
          }
        }

        if (prop === "password") {
          // Validate password length and complexity
          if (req.body[prop].length < 8 || !isStrongPassword(req.body[prop])) {
            return next(
              new ErrorHandler(
                400,
                "Password does not meet complexity requirements"
              )
            );
          }
        }
      }
    }
  }

  // Additional validations based on the route
  let name, password, confirmPassword;
  switch (route) {
    case "registerUser":
      ({ name, password, confirmPassword } = req.body);

      // Validate name length
      if (name.length < 3) {
        return next(new ErrorHandler(400, "give a name with valid width"));
      }

      // Confirm password matching
      if (password !== confirmPassword) {
        return next(new ErrorHandler(400, "Password mismatches"));
      }
      break;
    // ------------------------------------------------------------
    case "verifyUser":
      if (req.body.verificationCode.length !== 4) {
        return next(
          new ErrorHandler(400, "verification code should be four digits")
        );
      }
      break;

    //----------------------------------------------------------------------
    case "forgotPasswordOtpVerification":
      if (req.body.verificationCode.length !== 4) {
        return next(
          new ErrorHandler(400, "verification code should be four digits")
        );
      }
      break;
    default:
      return true;
  }
};
