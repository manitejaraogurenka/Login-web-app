import toast from "react-hot-toast";
import { authenticate } from "./helper";

/*validate login page username*/
export async function usernameValidate(values) {
  const errors = usernameVerify({}, values);

  if (values.username) {
    // Check if the user exists
    const { status } = await authenticate(values.username);
    if (status !== 200) {
      errors.exist = toast.error("User does not exist!");
    }
  }

  return errors;
}

/*validate password*/
export async function passwordValidate(values) {
  const errors = passwordVerify({}, values);
  return errors;
}

/* validate reset password */
export async function resetPasswordValidate(values) {
  const errors = passwordVerify({}, values);
  if (values.password !== values.confirm_password) {
    errors.exist = toast.error("Password isn't matching!");
  }
  return errors;
}

/*Validate register form*/
export async function registerValidate(values) {
  const errors = usernameVerify({}, values);
  passwordVerify(errors, values);
  emailVerify(errors, values);
  return errors;
}

/*Validate profile page*/
export async function profileValidate(values) {
  const errors = emailVerify({}, values);
  return errors;
}

/*Validate password*/
function passwordVerify(error = {}, values) {
  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  if (!values.password) {
    error.password = toast.error("Password required!");
  } else if (values.password.includes(" ")) {
    error.password = toast.error("Wrong password!");
  } else if (values.password.length < 6) {
    error.password = toast.error("Password must be atleast 6 characters long!");
  } else if (!specialChars.test(values.password)) {
    error.password = toast.error("Password must have special characters!");
  }
  return error;
}

/*Validate username*/
function usernameVerify(error = {}, values) {
  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  if (!values.username) {
    error.username = toast.error("Username Required!");
  } else if (values.username.includes(" ")) {
    error.username = toast.error("Invalid Username!");
  } else if (specialChars.test(values.username)) {
    error.username = toast.error(
      "Username must not contain special characters!"
    );
  }
  return error;
}

/*validate email*/
function emailVerify(error = {}, values) {
  if (!values.email) {
    error.email = toast.error("Email required!");
  } else if (values.email.includes(" ")) {
    error.email = toast.error("Wrong email!");
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    error.email = toast.error("Invalid email address!");
  }
  return error;
}
