import UserModel from "../model/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ENV from "../config.js";
import otpGenerator from "otp-generator";

/*Middleware for verifying user*/
export async function verifyUser(req, res, next) {
  try {
    const { username } = req.method === "GET" ? req.query : req.body; // Use strict comparison operator '==='
    // Check the user existence
    let exist = await UserModel.findOne({ username });
    if (!exist) return res.status(404).send({ error: "Can't find User" });
    next();
  } catch (error) {
    return res.status(500).send({ error: "Authentication error" }); // Use a more general status code for catch block
  }
}

/*POST: http://localhost:8080/api/register*/
export async function register(req, res) {
  try {
    const { username, password, profile, email } = req.body;

    // Check for existing username
    const existUsername = UserModel.findOne({ username });
    // Check for existing email
    const existEmail = UserModel.findOne({ email });

    Promise.all([existUsername, existEmail])
      .then(([usernameExists, emailExists]) => {
        if (usernameExists) {
          throw { error: "Please use a unique username" };
        }
        if (emailExists) {
          throw { error: "Please use a unique email" };
        }

        if (password) {
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              const user = new UserModel({
                username,
                password: hashedPassword,
                profile: profile || "",
                email,
              });

              // Save the user and send response
              user
                .save()
                .then((result) =>
                  res.status(201).send({ msg: "User registered successfully" })
                )
                .catch((error) => res.status(500).send({ error }));
            })
            .catch((error) => {
              return res.status(500).send({
                error: "Unable to hash password",
              });
            });
        }
      })
      .catch((error) => {
        return res.status(500).send({ error });
      });
  } catch (error) {
    return res.status(500).send({ error });
  }
}

/*POST: http://localhost:8080/api/login*/
export async function login(req, res) {
  const { username, password } = req.body;
  try {
    UserModel.findOne({ username })
      .then((user) => {
        bcrypt
          .compare(password, user.password)
          .then((passwordCheck) => {
            if (!passwordCheck)
              return res.status(400).send({ error: "Don't have password" });
            // create jwt token
            const token = jwt.sign(
              {
                userId: user._id,
                username: user.username,
              },
              ENV.JWT_SECRET,
              { expiresIn: "24h" }
            );

            return res.status(200).send({
              msg: "Login Successful!",
              username: user.username,
              token,
            });
          })
          .catch((error) => {
            return res.status(400).send({ error: "password doesn't match" });
          });
      })
      .catch((error) => {
        return res.status(404).send({ error: "username not found" });
      });
  } catch (error) {
    return res.status(500).send({ error });
  }
}

/*GET: http://localhost:8080/api/user/example123*/
export async function getUser(req, res) {
  const { username } = req.params;
  try {
    if (!username) return res.status(501).send({ error: "Invalid Username" });

    const user = await UserModel.findOne({ username }).exec();
    if (!user) return res.status(501).send({ error: "Couldn't find the User" });

    /*remove password from user*/
    // mongoose return unnecessary data with object so convert it into json
    const { password, ...rest } = Object.assign({}, user.toJSON());

    return res.status(201).send(rest);
  } catch (error) {
    res.status(500).send({ error: "Cannot find user data" });
  }
}

/*PUT: http://localhost:8080/api/updateUser*/
export async function updateUser(req, res) {
  try {
    const { userId } = req.user;

    if (userId) {
      const body = req.body;

      // Update the data
      const result = await UserModel.updateOne({ _id: userId }, body).exec();

      if (result.modifiedCount === 1) {
        return res.status(201).send({ msg: "Profile updated successfully" });
      } else {
        return res.status(401).send({ error: "User not found!" });
      }
    } else {
      return res.status(401).send({ error: "User not found!" });
    }
  } catch (error) {
    return res.status(500).send({ error: "An error occurred" });
  }
}

/*GET: http://localhost:8080/api/generateOTP*/
export async function generateOTP(req, res) {
  req.app.locals.OTP = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
}

/*GET: http://localhost:8080/api/verifyOTP*/
export async function verifyOTP(req, res) {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; // resets the OTP value
    req.app.locals.resetSession = true; // start new session fro reset password
    return res.status(201).send({ msg: "verification successful" });
  } else {
    return res.status(400).send({ error: "Invalid OTP" });
  }
}

/*GET: http://localhost:8080/api/createResetSession*/
//Successfully redirect user when OTP is valid
export async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    return res.status(201).send({ flag: req.app.locals.resetSession });
  }
  return res.status(440).send({ error: "Session expired!" });
}

/*put: http://localhost:8080/api/resetpassword*/
export async function resetpassword(req, res) {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).send({ error: "Session expired!" });

    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ error: "Username not found!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.updateOne(
      { username: user.username },
      { password: hashedPassword }
    );

    req.app.locals.resetSession = false; // reset session again

    return res.status(201).send({ msg: "password reset successful!" });
  } catch (error) {
    return res.status(500).send({ error: "An error occurred" });
  }
}
