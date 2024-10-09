const emailOTPTemplate = (user, subject) => {
  return `<!DOCTYPE html>
            <html lang="en">

            <head>
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link
                    href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
                    rel="stylesheet">
            </head>

            <body>
                <div
                    style="font-family: Arial, Helvetica, sans-serif; background-color: #F0F3F7;width: 638px;height: 766px;padding: 24px; margin: 0 auto;">
                    <div style="background-color: #F8F9FB;border-radius: 24px; padding: 30px 55px;">
                        <h1
                            style="font-style: normal;font-weight: 400;font-size: 24px;color: #313D5B;text-align: center; letter-spacing: 0.02em;">
                            Welcome to StrikeO
                        </h1>

                        <p style="text-align:center; font-weight: 400;font-size: 16px; color: #313D5B;">To verify your email,
                            Use this given OTP</p>
                        <div style="text-align:center ; margin-top: 50px;">
                            <span
                                style=" background-color: gray;border-radius: 5px;text-decoration: none;padding: 14px 30px;color: #fff;  ">
                                ${
                                  subject === "Reset Password OTP"
                                    ? user?.reset_OTP?.code
                                    : user?.verify_OTP?.code
                                }
                            </span>
                        </div>
                        <p
                            style="margin-bottom: 0; margin-top: 40px; text-align: center; font-style: normal;font-weight: 400;font-size: 16px; color: #313D5B;">
                           Please don't share this OTP to anyone.
                        </p>
                        
                    </div>
                </div>
            </body>

            </html>`;
};
const emailVerifyTemplate = (user) => {
  return `<!DOCTYPE html>
            <html lang="en">

            <head>
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link
                    href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
                    rel="stylesheet">
            </head>

            <body>
                <div
                    style="font-family: Arial, Helvetica, sans-serif; background-color: #F0F3F7;width: 638px;height: 766px;padding: 24px; margin: 0 auto;">
                    <div style="background-color: #F8F9FB;border-radius: 24px; padding: 30px 55px;">
                        <h1
                            style="font-style: normal;font-weight: 400;font-size: 24px;color: #313D5B;text-align: center; letter-spacing: 0.02em;">
                            Welcome to StrikeO
                        </h1>

                        <p style="text-align:center; font-weight: 400;font-size: 16px; color: #313D5B;">To verify your email
                            address, click the button below:</p>
                        <div style="text-align:center ; margin-top: 50px;">
                            <a href="${user?.verify_token?.link}"
                                style="    background-color: #605BFF;border-radius: 16px;text-decoration: none;padding: 14px 30px;color: #fff;  ">
                                Confirm registration
                            </a>
                        </div>
                        <p
                            style="margin-bottom: 0; margin-top: 40px; text-align: center; font-style: normal;font-weight: 400;font-size: 16px; color: #313D5B;">
                            If the button does not work, follow the link below:
                        </p>
                        <div style="text-align: center; margin-top: 5px;">
                            <a href="${user?.verify_token?.link}"
                                style="text-decoration: none;font-style: normal;font-weight: 400;font-size: 16px;">${user?.verify_token?.link}</a>
                        </div>
                    </div>
                </div>
            </body>

            </html>`;
};

const loginCredentialsTemplate = (user) => {
  return `<!DOCTYPE html>
            <html lang="en">

            <head>
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link
                    href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
                    rel="stylesheet">
            </head>

            <body>
                <div
                    style="font-family: Arial, Helvetica, sans-serif; background-color: #F0F3F7;width: 638px;height: 766px;padding: 24px; margin: 0 auto;">
                    <div style="background-color: #F8F9FB;border-radius: 24px; padding: 30px 55px;">
                        <h1
                            style="font-style: normal;font-weight: 400;font-size: 24px;color: #313D5B;text-align: center; letter-spacing: 0.02em;">
                            Welcome to StrikeO
                        </h1>

                        <p style="text-align:center; font-weight: 400;font-size: 16px; color: #313D5B;">Here are your login credentials:</p>
                        <div style="display:flex ; flex-direction: column; gap: 10px; margin-top: 50px;">
                            <div>
                                <p style="margin-bottom: 0; font-weight: 400;font-size: 16px; color: #313D5B;">Role: ${user.role}</p>
                                <p style="margin-bottom: 0; font-weight: 400;font-size: 16px; color: #313D5B;">Email: ${user.email}</p>
                                <p style="margin-bottom: 0; font-weight: 400;font-size: 16px; color: #313D5B;">Password: ${user.password}</p>
                            </div>
                        </div>
                        <div style="text-align:center ; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL}/admin/login"
                                style="background-color:#605BFF; border-radius: 16px;text-decoration: none;padding: 14px 30px;color: #fff;  ">
                                Login to StrikeO
                            </a>
                        </div>
                    </div>
                </div>
            </body>

            </html>`;
};

const forgotPasswordTemplate = (user) => {
  return `<!DOCTYPE html>
            <html lang="en">

            <head>
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link
                    href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
                    rel="stylesheet">
            </head>

            <body>
               <div style="font-family: Arial, Helvetica, sans-serif; background-color: #F0F3F7;width: 638px;height: 500px;padding: 24px; margin: 0 auto;">
                    <div style="background-color: #F8F9FB;border-radius: 24px; padding: 30px 55px;">
                        <h1 style="font-style: normal;font-weight: 400;font-size: 24px;color: #313D5B;text-align: center; letter-spacing: 0.02em;">Password reset</h1>
                        <p style="text-align:center; font-weight: 400;font-size: 16px; color: #313D5B; width:80%; margin: 30px auto;">You recently requested to reset your password for your StrikeO account.</p>
                        <div style="text-align:center ; margin-top: 30px;">
                            <a href="${user.reset_token.link}"
                                style="background-color:#605BFF; border-radius: 16px;text-decoration: none;padding: 14px 30px;color: #fff;  ">
                                Reset your password
                            </a>
                        </div>
                        <p
                            style="margin-bottom: 0; margin-top: 40px; text-align: center; font-style: normal;font-weight: 400;font-size: 16px; color: #313D5B;">
                            If you did not request to reset your password, please ignore this mail.
                        </p>
                    </div>
                </div>
            </body>

            </html>`;
};

const profileUpdateTemplate = (user, newPass) => {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
        rel="stylesheet">
</head>

<body>
    <div
        style="font-family: Arial, Helvetica, sans-serif; border-radius: 10px; max-width: 680px; padding: 24px; margin: 0 auto;">
        <div style="background-color: #F8F9FB;border-radius: 24px; padding: 30px 55px;">
            <h1
                style="font-style: normal;font-weight: 400;font-size: 24px;color: #313D5B;text-align: center; letter-spacing: 0.02em;">
                Profile Updates
            </h1>

            <p style="font-weight: 400;font-size: 16px; color: #313D5B;">Your profile on StrikeO has
                been updated, here are your updated profile details:</p>
            <div style="display: flex; flex-direction: column; gap: 20px;">

            <div style="display: flex; flex-direction: column; gap: 20px;">
    <h4 style="padding: 0; margin: 0; font-size: 18px;">Profile</h4>
    <div style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden;">
        <img style="width: 100%; height: 100%; object-fit: contain;"
             src="https://wallpapers.com/images/high/default-user-profile-icon-pir94gxp2ec0r4cd.png"
             alt="profile_pic">
    </div>
</div>

                <div>
                    <span style="width: 100px; display: inline-block;"> First Name:</span>
                    <span>${user.firstName}</span>
                </div>
                <div>
                    <span style="width: 100px; display: inline-block;"> Last Name:</span>
                    <span>${user.lastName}</span>
                </div>
                ${
                  user?.username
                    ? `<div>
                    <span style="width: 100px; display: inline-block;"> Username:</span>
                    <span>${user.username}</span>
                </div>`
                    : ""
                }
                <div>
                    <span style="width: 100px; display: inline-block;"> Email:</span>
                    <span>${user.email}</span>
                </div>
                ${
                  newPass
                    ? `<div>
                                <span style="width: 150px; display: inline-block;"> New Password:</span>
                                <span>${newPass}</span>
                            </div>`
                    : ""
                }
            </div>
            <p
                style="margin-bottom: 0; margin-top: 40px; text-align: center; font-style: normal;font-weight: 400;font-size: 16px; color: #313D5B;">
                Login to see your profile.</p>
            <div style="text-align:center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/${
    user?.role === "vendor" ? "admin/" : ""
  }login"
                    style="    background-color: #605BFF;border-radius: 16px;text-decoration: none;padding: 14px 30px;color: #fff;  ">
                    Login to StrikeO
                </a>
            </div>
        </div>
    </div>
</body>

</html>`;
};

const createPasswordTemplate = (user) => {
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
        rel="stylesheet">
</head>

<body>
    <div
        style="font-family: Arial, Helvetica, sans-serif; background-color: #F0F3F7;width: 638px;height: 230px;padding: 24px; margin: 0 auto; border-radius: 10px;">
        <div style="background-color: #F8F9FB;border-radius: 24px; padding: 30px 55px;">
            <h1
                style="font-style: normal;font-weight: 400;font-size: 24px;color: #313D5B;text-align: center; letter-spacing: 0.02em;">
                Welcome to StrikeO</h1>
            <p style="font-weight: 400;font-size: 16px; color: #313D5B; width:80%; margin: 30px auto;">
                You have been added to StrikeO as vendor. You can create your password credentials from this link.</p>
            <div style="text-align:center ; margin-top: 30px;">
                <a href="${user.reset_token.link}"
                    style="background-color:#605BFF; border-radius: 16px;text-decoration: none;padding: 14px 30px;color: #fff;  ">
                    Create Credentials
                </a>
            </div>
        </div>
    </div>
</body>

</html>`;
};
const updatePasswordTemplate = (user) => {
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
        rel="stylesheet">
</head>

<body>
    <div
        style="font-family: Arial, Helvetica, sans-serif; background-color: #F0F3F7; max-width: 720px; height: 100%; padding: 20px; margin: 0 auto; border-radius: 10px;">
        <div style="background-color: #F8F9FB;border-radius: 24px; margin:auto; padding: 20px;">
        <h1
        style="font-style: normal;font-weight: 400;font-size: 24px;color: #313D5B;text-align: center; letter-spacing: 0.02em;">
        Hi ${user?.firstName} ${user?.lastName}</h1>
            <p style="font-weight: 400;font-size: 16px; color: #313D5B; ">
             Your password has been reset. Please use “${user?.new_password}” as your new password to login to the system.    
            </p>
            <p style=" font-weight: 500;font-size: 16px; color: black; margin-bottom: 20px;">
            Team StrikeO
            </p>
            <div style="text-align:center; margin-bottom: 20px;">
                <a href="${process.env.FRONTEND_URL}/admin/login"
                    style=" background-color: #605BFF;border-radius: 8px;text-decoration: none;padding: 14px 30px;color: #fff;  ">
                    Login to StrikeO
                </a>
            </div>
           
            
        </div>
    </div>
</body>

</html>`;
};

const emailChangeTemplate = (user) => {
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
        rel="stylesheet">
</head>

<body>
    <div
        style="font-family: Arial, Helvetica, sans-serif; background-color: #F0F3F7;width: 638px;height: 230px;padding: 24px; margin: 0 auto; border-radius: 10px;">
        <div style="background-color: #F8F9FB;border-radius: 24px; padding: 30px 55px;">
            <h1
                style="font-style: normal;font-weight: 400;font-size: 24px;color: #313D5B;text-align: center; letter-spacing: 0.02em;">
                Welcome to StrikeO</h1>
            <p style="font-weight: 400;font-size: 16px; color: #313D5B; width:80%; margin: 30px auto;">
            Hi ${user.firstName}, your email has been changed. Try logging in with your new email address.
                </p>
            <div style="text-align:center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/admin/login"
                    style="    background-color: #605BFF;border-radius: 16px;text-decoration: none;padding: 14px 30px;color: #fff;  ">
                    Login to StrikeO
                </a>
            </div>
        </div>
    </div>
</body>

</html>`;
};

module.exports = {
  emailOTPTemplate,
  emailVerifyTemplate,
  forgotPasswordTemplate,
  loginCredentialsTemplate,
  profileUpdateTemplate,
  createPasswordTemplate,
  emailChangeTemplate,
  updatePasswordTemplate,
};
