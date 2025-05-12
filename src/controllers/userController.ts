import { Req, Res, Next } from "../frameworks/types/serverPackageTypes";
import { inputValidation } from "./middleware/inputValidation";
import dotenv from "dotenv";
dotenv.config();

import {
  accessTokenOptions,
  refreshTokenOptions,
} from "./middleware/tokenOptions";

import { IJsonResponse } from "../useCasese/interface/services/jsonResponse";
import { IToken } from "../useCasese/interface/services/jwt.types";
import { IUserUseCase } from "../useCasese/interface/useCase/userUseCase";
import { catchError } from "../useCasese/middlewares/catchError";

export class UserController {
  private userUseCase: IUserUseCase;

  constructor(userUseCase: IUserUseCase) {
    this.userUseCase = userUseCase;
  }

  // *****************************************************************************************************************************
  async registerUser(req: Req, res: Res, next: Next) {
    try {
      await inputValidation(req, "registerUser", next);
      const token = await this.userUseCase.registerUser(req.body, next);

      res.cookie("verificationToken", token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        domain:
          process.env.NODE_ENV === "production" ? ".edemy.shop" : undefined,
        path: "/",
        secure: true,
        expires: new Date(Date.now() + 30 * 60 * 1000),
      });

      res.status(200).json({
        success: true,
        message: "verification otp has been sent the mail",
      });
    } catch (error) {
      catchError(error, next);
    }
  }
  // *****************************************************************************************************************************
  async createUser(req: Req, res: Res, next: Next) {
    try {
      await inputValidation(req, "verifyUser", next);
      const token = req.cookies.verificationToken;
      const result = await this.userUseCase.createUser(
        req.body.verificationCode,
        token,
        next
      );
      res.clearCookie("verificationToken").send(result);
    } catch (error) {
      catchError(error, next);
    }
  }
  // *****************************************************************************************************************************
  async login(req: Req, res: Res, next: Next) {
    try {
      await inputValidation(req, "login", next);
      const result = await this.userUseCase.login(req.body, next);
      if (
        result?.user &&
        result?.tokens.accessToken &&
        result?.tokens.accessToken
      ) {
        res.cookie(
          "accessToken",
          result?.tokens?.accessToken,
          accessTokenOptions
        );
        res.cookie(
          "refreshToken",
          result?.tokens?.accessToken,
          refreshTokenOptions
        );
        res
          .status(200)
          .json({ user: result?.user, message: "user loggedIn successfully" });
      }
    } catch (error) {
      catchError(error, next);
    }
  }
  // *****************************************************************************************************************************
  async logout(req: Req, res: Res, next: Next) {
    try {
      await this.userUseCase.logout(req, res, next);
      res.status(200).json({
        success: true,
        message: "user has been loged out successfully",
      });
    } catch (error) {
      catchError(error, next);
    }
  }
  // *****************************************************************************************************************************
  async refresh(req: Req, res: Res, next: Next) {
    try {
      const result = (await this.userUseCase.refresh(req, res, next)) as IToken;
      res.cookie("accessToken", result.accessToken, accessTokenOptions);
      res.cookie("refreshToken", result.refreshToken, refreshTokenOptions);
      res.status(200).json({ success: true, message: "tokens are updated" });
    } catch (error) {
      catchError(error, next);
    }
  }
  // *****************************************************************************************************************************
  async beInstructor(req: Req, res: Res, next: Next) {
    try {
      await inputValidation(req, "beInstructor", next);
      const result = (await this.userUseCase.beInstructor(
        req,
        next
      )) as IJsonResponse;
      res.status(result.status).json(result);
    } catch (error) {
      catchError(error, next);
    }
  }
  // *****************************************************************************************************************************
  async forgotPassword(req: Req, res: Res, next: Next) {
    try {
      await inputValidation(req, "forgotPassword", next);
      const result = await this.userUseCase.forgotPassword(req, next);

      res.cookie("verificationToken", result, {
          httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        domain:
          process.env.NODE_ENV === "production"
            ? ".digi-world.online"
            : undefined,
        path: "/",
        secure: true,
        expires: new Date(Date.now() + 30 * 60 * 1000),
      });
      res.status(200).json({
        succuss: true,
        message: "verification code has been sent to your account",
      });
    } catch (error) {
      catchError(error, next);
    }
  }
  // *****************************************************************************************************************************
  async forgotPasswordOtpVerification(req: Req, res: Res, next: Next) {
    try {
      await inputValidation(req, "forgotPasswordOtpVerification", next);
      const token = req.cookies.verificationToken as string;
      const result = await this.userUseCase.forgotPasswordOtpVerification(
        req,
        next,
        token
      );
      res.status(200).json(result);
    } catch (error) {
      catchError(error, next);
    }
  }
  // *****************************************************************************************************************************
  async resetForgotPassword(req: Req, res: Res, next: Next) {
    try {
      await inputValidation(req, "resetForgotPassword", next);
      const token = req.cookies.verificationToken;
      const result = await this.userUseCase.resetForgotPassword(
        req,
        token,
        next
      );

      res.clearCookie("verificationToken");
      res.status(200).send(result);
    } catch (error) {
      catchError(error, next);
    }
  }
  // *****************************************************************************************************************************

  async userSession(req: Req, res: Res, next: Next) {
    try {
      const result = await this.userUseCase.userSession(req, next);
      res.status(200).json(result);
    } catch (error) {
      catchError(error, next);
    }
  }

  // *****************************************************************************************************************************

  async getNotifications(req: Req, res: Res, next: Next) {
    try {
      const result = await this.userUseCase.getNotifications(req, next);
      res.status(200).json(result);
    } catch (error) {
      catchError(error, next);
    }
  }

  // *****************************************************************************************************************************

  async updateNotifications(req: Req, res: Res, next: Next) {
    try {
      const result = await this.userUseCase.updateNotifications(req, next);
      res.status(200).json(result);
    } catch (error) {
      catchError(error, next);
    }
  }

  // *****************************************************************************************************************************

  async gAuthUrl(req: Req, res: Res, next: Next) {
    try {
      const result = await this.userUseCase.gAuthUrl(req, next);
      // res.header("Access-Control-Allow-Origin", process.env.CLIENT);
      // res.header("Access-Control-Allow-Credentials", "true");
      // res.header("Referrer-Policy", "no-referrer-when-downgrade");

      res.status(200).json({ url: result });
    } catch (error) {
      catchError(error, next);
    }
  }

  // *****************************************************************************************************************************

  async gAuth(req: Req, res: Res, next: Next) {
    try {
      const result = await this.userUseCase.gAuth(req, next);
      res.redirect(
        303,
        `${process.env.CLIENT}/google_auth/?userData=${JSON.stringify(
          result?.user
        )}&accessToken=${result?.tokens.accessToken}&refreshToken=${
          result?.tokens.refreshToken
        }`
      );
    } catch (error) {
      catchError(error, next);
    }
  }
  // *****************************************************************************************************************************

  async resendOtp(req: Req, res: Res, next: Next) {
    try {
      const result = await this.userUseCase.resendOtp(req, next);
      res.status(200).json(result);
    } catch (error) {
      catchError(error, next);
    }
  }
  // *****************************************************************************************************************************
  async setCookies(req: Req, res: Res, next: Next) {
    try {
      const { accessToken, refreshToken } = req.body;
      res.cookie("accessToken", accessToken, accessTokenOptions);
      res.cookie("refreshToken", refreshToken, refreshTokenOptions);

      res.status(200).json({ success: true });
    } catch (error) {
      catchError(error, next);
    }
  }
}

// import { Req, Res, Next } from "../frameworks/types/serverPackageTypes";
// import { inputValidation } from "./middleware/inputValidation";
// import dotenv from "dotenv";
// dotenv.config();

// import {
//   accessTokenOptions,
//   refreshTokenOptions,
// } from "./middleware/tokenOptions";

// import { IJsonResponse } from "../useCasese/interface/services/jsonResponse";
// import { IToken } from "../useCasese/interface/services/jwt.types";
// import { IUserUseCase } from "../useCasese/interface/useCase/userUseCase";
// import { catchError } from "../useCasese/middlewares/catchError";

// export class UserController {
//   private userUseCase: IUserUseCase;

//   constructor(userUseCase: IUserUseCase) {
//     this.userUseCase = userUseCase;
//   }

//   // *****************************************************************************************************************************
//   async registerUser(req: Req, res: Res, next: Next) {
//     try {
//       await inputValidation(req, "registerUser", next);
//       const token = await this.userUseCase.registerUser(req.body, next);

//       res.cookie("verificationToken", token, {
//         httpOnly: true,
//         sameSite: "strict",
//         // domain: '.digi-world.online',
//         // path: '/',
//         // secure: true,
//         expires: new Date(Date.now() + 30 * 60 * 1000),
//       });

//       res.status(200).json({
//         success: true,
//         message: "verification otp has been sent the mail",
//       });
//     } catch (error) {
//       catchError(error, next);
//     }
//   }
//   // *****************************************************************************************************************************
//   async createUser(req: Req, res: Res, next: Next) {
//     try {
//       await inputValidation(req, "verifyUser", next);
//       const token = req.cookies.verificationToken;
//       const result = await this.userUseCase.createUser(
//         req.body.verificationCode,
//         token,
//         next
//       );
//       res.clearCookie("verificationToken").send(result);
//     } catch (error) {
//       catchError(error, next);
//     }
//   }
//   // *****************************************************************************************************************************
//   async login(req: Req, res: Res, next: Next) {
//     try {
//       await inputValidation(req, "login", next);
//       const result = await this.userUseCase.login(req.body, next);
//       if (
//         result?.user &&
//         result?.tokens.accessToken &&
//         result?.tokens.accessToken
//       ) {
//         console.log("result from login controller", result);
//         res.cookie(
//           "accessToken",
//           result?.tokens?.accessToken,
//           accessTokenOptions
//         );
//         res.cookie(
//           "refreshToken",
//           result?.tokens?.accessToken,
//           refreshTokenOptions
//         );
//         res
//           .status(200)
//           .json({ user: result?.user, message: "user loggedIn successfully" });
//       }
//     } catch (error) {
//       console.log("error block controller");
//       catchError(error, next);
//     }
//   }
//   // *****************************************************************************************************************************
//   async logout(req: Req, res: Res, next: Next) {
//     try {
//       await this.userUseCase.logout(req, res, next);
//       res.status(200).json({
//         success: true,
//         message: "user has been loged out successfully",
//       });
//     } catch (error) {
//       catchError(error, next);
//     }
//   }
//   // *****************************************************************************************************************************
//   async refresh(req: Req, res: Res, next: Next) {
//     try {
//       const result = (await this.userUseCase.refresh(req, res, next)) as IToken;
//       res.cookie("accessToken", result.accessToken, accessTokenOptions);
//       res.cookie("refreshToken", result.refreshToken, refreshTokenOptions);
//       res.status(200).json({ success: true, message: "tokens are updated" });
//     } catch (error) {
//       catchError(error, next);
//     }
//   }
//   // *****************************************************************************************************************************
//   async beInstructor(req: Req, res: Res, next: Next) {
//     try {
//       await inputValidation(req, "beInstructor", next);
//       const result = (await this.userUseCase.beInstructor(
//         req,
//         next
//       )) as IJsonResponse;
//       res.status(result.status).json(result);
//     } catch (error) {
//       catchError(error, next);
//     }
//   }
//   // *****************************************************************************************************************************
//   async forgotPassword(req: Req, res: Res, next: Next) {
//     try {
//       await inputValidation(req, "forgotPassword", next);
//       const result = await this.userUseCase.forgotPassword(req, next);

//       res.cookie("verificationToken", result, {
//         sameSite: "strict",
//         httpOnly: true,
//         // domain: '.digi-world.online',
//         // path: '/',
//         // secure: true,
//         maxAge: 5 * 60 * 1000,
//       });
//       res.status(200).json({
//         succuss: true,
//         message: "verification code has been sent to your account",
//       });
//     } catch (error) {
//       catchError(error, next);
//     }
//   }
//   // *****************************************************************************************************************************
//   async forgotPasswordOtpVerification(req: Req, res: Res, next: Next) {
//     try {
//       await inputValidation(req, "forgotPasswordOtpVerification", next);
//       const token = req.cookies.verificationToken as string;
//       const result = await this.userUseCase.forgotPasswordOtpVerification(
//         req,
//         next,
//         token
//       );
//       res.status(200).json(result);
//     } catch (error) {
//       catchError(error, next);
//     }
//   }
//   // *****************************************************************************************************************************
//   async resetForgotPassword(req: Req, res: Res, next: Next) {
//     try {
//       await inputValidation(req, "resetForgotPassword", next);
//       const token = req.cookies.verificationToken;
//       const result = await this.userUseCase.resetForgotPassword(
//         req,
//         token,
//         next
//       );

//       res.clearCookie("verificationToken");
//       res.status(200).send(result);
//     } catch (error) {
//       catchError(error, next);
//     }
//   }
//   // *****************************************************************************************************************************

//   async userSession(req: Req, res: Res, next: Next) {
//     try {
//       const result = await this.userUseCase.userSession(req, next);
//       res.status(200).json(result);
//     } catch (error) {
//       catchError(error, next);
//     }
//   }

//   // *****************************************************************************************************************************

//   async getNotifications(req: Req, res: Res, next: Next) {
//     try {
//       const result = await this.userUseCase.getNotifications(req, next);
//       res.status(200).json(result);
//     } catch (error) {
//       catchError(error, next);
//     }
//   }

//   // *****************************************************************************************************************************

//   async updateNotifications(req: Req, res: Res, next: Next) {
//     try {
//       const result = await this.userUseCase.updateNotifications(req, next);
//       res.status(200).json(result);
//     } catch (error) {
//       catchError(error, next);
//     }
//   }

//   // *****************************************************************************************************************************

//   async gAuthUrl(req: Req, res: Res, next: Next) {
//     try {
//       const result = await this.userUseCase.gAuthUrl(req, next);
//       // res.header("Access-Control-Allow-Origin", process.env.CLIENT);
//       // res.header("Access-Control-Allow-Credentials", "true");
//       // res.header("Referrer-Policy", "no-referrer-when-downgrade");

//       res.status(200).json({ url: result });
//     } catch (error) {
//       catchError(error, next);
//     }
//   }

//   // *****************************************************************************************************************************

//   async gAuth(req: Req, res: Res, next: Next) {
//     try {
//       const result = await this.userUseCase.gAuth(req, next);
//       res.redirect(
//         303,
//         `${process.env.CLIENT}/google_auth/?userData=${JSON.stringify(
//           result?.user
//         )}&accessToken=${result?.tokens.accessToken}&refreshToken=${
//           result?.tokens.refreshToken
//         }`
//       );
//     } catch (error) {
//       catchError(error, next);
//     }
//   }
//   // *****************************************************************************************************************************

//   async resendOtp(req: Req, res: Res, next: Next) {
//     try {
//       const result = await this.userUseCase.resendOtp(req, next);
//       res.status(200).json(result);
//     } catch (error) {
//       catchError(error, next);
//     }
//   }
//   // *****************************************************************************************************************************
// }
