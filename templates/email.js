const { getMin0Number } = require("../utils/stringsNymber");

const emailTemplateLogo = `<table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="width: 100%; padding: 20px 0 5px">
                    <img
                      src="https://portal.strikeo.com/uploads/1729610341542-strikeo_logo.png"
                      alt="Light Logo"
                      class="logo"
                      width="200"
                      height="auto"
                      style="width: 106px; height: auto; object-fit: cover"
                    />
                  </td>
                </tr>
      </table>
  `;
const emailTemplateFooter = `<table width="100%" cellpadding="20" cellspacing="0">
                        <tr>
                          <td
                            align="center"
                            style="background-color: #eeeeee; padding: 10px"
                          >
                            <p
                              class="footer-find-us"
                              style="
                                font-size: 0.875rem;
                                margin: 0;
                                font-weight: bold;
                                padding: 0.5rem;
                              "
                            >
                              Find us on
                            </p>
                            <!-- Social Media Icons -->
                            <table
                              align="center"
                              cellpadding="0"
                              cellspacing="0"
                              border="0"
                              style="margin-top: 10px"
                            >
                              <tr>
                                <td style="padding: 0 5px">
                                  <a
                                    href="https://www.facebook.com/p/StrikeO-61553772012607"
                                    target="_blank"
                                    style="
                                      color: #111111;
                                      text-decoration: none;
                                    "
                                  >
                                    <img
                                      src="https://portal.strikeo.com/uploads/1728484875886-mczg3knv0vs2l8okgjgy.png"
                                      alt="facebook Icon"
                                      class="social-icon"
                                      width="40"
                                      height="40"
                                      style="
                                        width: 30px;
                                        height: 30px;
                                        margin: 0 5px;
                                      "
                                    />
                                  </a>
                                </td>
                                <td style="padding: 0 5px">
                                  <a
                                    href="https://x.com/ShopStrikeO"
                                    target="_blank"
                                    style="
                                      color: #111111;
                                      text-decoration: none;
                                    "
                                  >
                                    <img
                                      src="https://portal.strikeo.com/uploads/1728484909927-rd8eoqkrkyl5pjvenorx.png"
                                      alt="twitter icon"
                                      class="social-icon"
                                      width="40"
                                      height="40"
                                      style="
                                        width: 30px;
                                        height: 30px;
                                        margin: 0 5px;
                                      "
                                    />
                                  </a>
                                </td>
                                <td style="padding: 0 5px">
                                  <a
                                    href="https://www.linkedin.com/company/strikeo"
                                    target="_blank"
                                    style="
                                      color: #111111;
                                      text-decoration: none;
                                    "
                                  >
                                    <img
                                      src="https://portal.strikeo.com/uploads/1728484946839-u3aka8pqj72golrbcwg7.png"
                                      alt="linkedIn icon"
                                      class="social-icon"
                                      width="40"
                                      height="40"
                                      style="
                                        width: 30px;
                                        height: 30px;
                                        margin: 0 5px;
                                      "
                                    />
                                  </a>
                                </td>
                              </tr>
                            </table>
                            <p
                              class="footer-text"
                              style="
                                padding: 0.5rem;
                                text-align: center;
                                color: #888;
                                font-size: 12px;
                                margin-top: 20px;
                              "
                            >
                              <a
                                style="color: #111111; text-decoration: none"
                                href="https://www.strikeo.com/legal/privacy-policy"
                                target="_blank"
                                >Privacy Policy</a
                              >
                              |
                              <a
                                style="color: #111111; text-decoration: none"
                                href="https://www.strikeo.com/legal/terms-conditions"
                                target="_blank"
                                >Terms & Conditions</a
                              >
                              <br /><br />
                              This is an automatically generated e-mail. Please
                              do not reply.
                            </p>
                          </td>
                        </tr>
                     </table>
  `;
const emailOTPTemplate = (user, subject) => {
  return `<!DOCTYPE html>
    <html
      lang="en"
      dir="ltr"
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office"
    >
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=yes"
        />
        <meta
          name="format-detection"
          content="telephone=no, date=no, address=no, email=no, url=no"
        />
        <meta name="x-apple-disable-message-reformatting" />
        <!-- Set color scheme to light only -->
        <!-- <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" /> -->
        <!--[if mso]>
          <noscript>
            <xml>
              <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          </noscript>
        <![endif]-->
        <style>
          @import url(https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap);
          :root {
            /* color-scheme: light;
            supported-color-schemes: light; */
            font-family: Outfit, Arial, sans-serif;
            background-color: #f4f4f4;
          }
    
          a {
            color: #111111;
            text-decoration: none;
          }
    
          a:hover {
            color: #000000;
            font-weight: 600;
          }
    
          body {
            margin: 0;
            background-color: #f4f4f4;
            padding: 0.6rem;
          }
    
          .table-wrapper {
            max-width: 500px;
            margin: 16px auto;
            padding: 20px;
          }
    
          .logo {
            width: 106px;
            height: auto;
            object-fit: cover;
          }
    
          .social-icon {
            width: 30px;
            height: 30px;
            margin: 0 5px;
          }
    
          .footer-text {
            text-align: center;
            color: #888;
            font-size: 12px;
            margin-top: 20px;
          }
    
          /* Color updates */
    
          .text {
            font-size: 0.875rem;
            line-height: 1.6;
            color: #535252;
            font-weight: 500;
          }
    
          p {
            padding: 0.5rem;
          }
    
          /* Responsive Styles */
          @media (max-width: 600px) {
            .table-wrapper {
              padding: 15px;
            }
    
            .logo {
              width: 76px;
            }
    
            .social-icon {
              width: 25px;
              height: 25px;
            }
    
            .text {
              font-size: 0.675rem;
            }
          }
        </style>
      </head>
    
      <body class="body" style="background-color: #f4f4f4; padding: 0.6rem">
        <div
          role="article"
          aria-roledescription="email"
          aria-label="email name"
          lang="en"
          dir="ltr"
          style="font-size: medium; font-size: max(16px, 1rem)"
        >
          <!-- Start of the email content -->
          <div class="table-wrapper">
            <table cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td align="left" style="background-color: #f4f4f4">
                 ${emailTemplateLogo}
                </td>
              </tr>
              <tr style="background-color: #fff">
                <td>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="width: 100%">
                        <img
                          src="https://portal.strikeo.com/uploads/1728484761390-c1w923tzwjentcj4fce1.png"
                          alt="Light Logo"
                          class="logo"
                          style="padding: 20px 0 5px"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 100%; padding: 0px">
                        <p
                          style="
                            padding: 0px 20px;
                            font-size: 14px;
                            line-height: 20px;
                          "
                        >
                          Please enter this verification code in Strikeo to complete
                          the security verification process
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <p
                          style="
                            padding: 10px;
                            width: 100px;
                            font-size: 22px;
                            font-weight: bold;
                            line-height: 20px;
                            border: 1.5px dashed #dad9d9;
                            border-radius: 5px;
                            background-color: rgb(243, 243, 243);
                          "
                        >
                          ${
                            subject === "Reset Password OTP"
                              ? user?.reset_OTP?.code
                              : user?.verify_OTP?.code
                          }
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 100%">
                        <p
                          style="
                            padding: 0 20px;
                            font-size: 14px;
                            line-height: 20px;
                          "
                        >
                         Use the code before it expires.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 100%">
                        <p
                          style="
                            padding: 0px 20px;
                            font-size: 14px;
                            line-height: 20px;
                          "
                        >
                          This code is valid for the next 5 minutes. Please DO NOT
                          share it with anyone. If you did not request this code,
                          please disregard this message. This is an automated email,
                          so replies will not be received.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div style="padding: 20px">
                            ${emailTemplateFooter}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </body>
    </html>
    `;
};
const emailVerifyTemplate = (user) => {
  return `<!DOCTYPE html>
<html
  lang="en"
  dir="ltr"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=yes"
    />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <meta name="x-apple-disable-message-reformatting" />
    <!-- Set color scheme to light only -->
    <!-- <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" /> -->
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      @import url(https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap);

      :root {
        /* color-scheme: light;
        supported-color-schemes: light; */
        font-family: Outfit, Arial, sans-serif;
        background-color: #eeeeee;
      }
    </style>
  </head>

  <body
    class="body"
    style="background-color: #f4f4f4; padding: 0.6rem; margin: 0"
  >
    <div
      role="article"
      aria-roledescription="email"
      aria-label="email name"
      lang="en"
      dir="ltr"
      style="font-size: medium; font-size: max(16px, 1rem)"
    >
      <!-- Start of the email content -->
      <div
        class="table-wrapper"
        style="max-width: 500px; margin: 16px auto; padding: 20px"
      >
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="left">
              ${emailTemplateLogo}
            </td>
          </tr>
          <tr style="background-color: #fff">
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width: 100%">
                    <div style="border-radius: 24px; padding: 30px 55px">
                      <h1
                        style="
                          font-style: normal;
                          font-weight: 500;
                          font-size: 24px;
                          color: #313d5b;
                          text-align: center;
                          letter-spacing: 0.02em;
                        "
                      >
                        Welcome to Strikeo
                      </h1>

                      <p
                        style="
                          text-align: center;
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                        "
                      >
                        To verify your email address, click the button below:
                      </p>
                      <div style="text-align: center; margin-top: 50px">
                        <a
                          href="${user?.verify_token?.link}"
                          style="
                            background-color: #1a4c5f;
                            border-radius: 16px;
                            text-decoration: none;
                            padding: 14px 30px;
                             color: #fff;
                          "
                        >
                          Confirm registration
                        </a>
                      </div>
                      <p
                        style="
                          margin-bottom: 0;
                          margin-top: 40px;
                          text-align: center;
                          font-style: normal;
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                        "
                      >
                        If the button does not work, follow the link below:
                      </p>
                      <div style="text-align: center; margin-top: 5px">
                        <a
                          href="${user?.verify_token?.link}"
                          style="
                            text-decoration: none;
                            font-style: normal;
                            font-weight: 400;
                            font-size: 16px;
                          "
                          >${user?.verify_token?.link}</a
                        >
                      </div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div style="padding: 20px">
                        ${emailTemplateFooter}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>
`;
};

const loginCredentialsTemplate = (user) => {
  return `<!DOCTYPE html>
<html
  lang="en"
  dir="ltr"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=yes"
    />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <meta name="x-apple-disable-message-reformatting" />
    <!-- Set color scheme to light only -->
    <!-- <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" /> -->
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      @import url(https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap);

      :root {
        /* color-scheme: light;
        supported-color-schemes: light; */
        font-family: Outfit, Arial, sans-serif;
        background-color: #eeeeee;
      }
    </style>
  </head>

  <body
    class="body"
    style="background-color: #f4f4f4; padding: 0.6rem; margin: 0"
  >
    <div
      role="article"
      aria-roledescription="email"
      aria-label="email name"
      lang="en"
      dir="ltr"
      style="font-size: medium; font-size: max(16px, 1rem)"
    >
      <!-- Start of the email content -->
      <div
        class="table-wrapper"
        style="max-width: 500px; margin: 16px auto; padding: 20px"
      >
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="left">
              ${emailTemplateLogo}
            </td>
          </tr>
          <tr style="background-color: #fff">
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width: 100%">
                    <div style="border-radius: 24px; padding: 30px 55px">
                      <h1
                        style="
                          font-style: normal;
                          font-weight: 500;
                          font-size: 24px;
                          color: #313d5b;
                          text-align: center;
                          letter-spacing: 0.02em;
                        "
                      >
                        Welcome to Strikeo
                      </h1>

                      <p
                        style="
                          text-align: center;
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                        "
                      >
                        Here are your login credentials:
                      </p>
                      <div
                        style="
                          background-color: #eeeeee;
                          padding: 20px;
                          display: flex;
                          flex-direction: column;
                          gap: 10px;
                          margin-top: 20px;
                          text-align: left;
                          border-radius: 5px;
                        "
                      >
                        <div>
                          <p
                            style="
                              margin-bottom: 0;
                              font-weight: 400;
                              font-size: 16px;
                              color: #313d5b;
                            "
                          >
                            Role: ${user.role}
                          </p>
                          <p
                            style="
                              margin-bottom: 0;
                              font-weight: 400;
                              font-size: 16px;
                              color: #313d5b;
                            "
                          >
                            Email: ${user.email}
                          </p>
                          <p
                            style="
                              margin-bottom: 0;
                              font-weight: 400;
                              font-size: 16px;
                              color: #313d5b;
                            "
                          >
                            Password: ${user.password}
                          </p>
                        </div>
                      </div>
                      <div style="text-align: center; margin-top: 30px">
                        <a
                          href="${process.env.FRONTEND_URL}/admin/login"
                          style="
                            background-color: #1a4c5f;
                            border-radius: 16px;
                            text-decoration: none;
                            padding: 14px 30px;
                             color: #fff;
                          "
                        >
                          Login to Strikeo
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div style="padding: 20px">
                       ${emailTemplateFooter}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>
`;
};

const forgotPasswordTemplate = (user) => {
  return `<!DOCTYPE html>
<html
  lang="en"
  dir="ltr"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=yes"
    />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <meta name="x-apple-disable-message-reformatting" />
    <!-- Set color scheme to light only -->
    <!-- <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" /> -->
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      @import url(https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap);

      :root {
        /* color-scheme: light;
        supported-color-schemes: light; */
        font-family: Outfit, Arial, sans-serif;
        background-color: #eeeeee;
      }
    </style>
  </head>

  <body
    class="body"
    style="background-color: #f4f4f4; padding: 0.6rem; margin: 0"
  >
    <div
      role="article"
      aria-roledescription="email"
      aria-label="email name"
      lang="en"
      dir="ltr"
      style="font-size: medium; font-size: max(16px, 1rem)"
    >
      <!-- Start of the email content -->
      <div
        class="table-wrapper"
        style="max-width: 500px; margin: 16px auto; padding: 20px"
      >
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="left">
              ${emailTemplateLogo}
            </td>
          </tr>
          <tr style="background-color: #fff">
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width: 100%">
                    <div style="border-radius: 24px; padding: 30px 55px">
                      <h1
                        style="
                          font-style: normal;
                          font-weight: 500;
                          font-size: 24px;
                          color: #313d5b;
                          text-align: center;
                          letter-spacing: 0.02em;
                        "
                      >
                        Password reset
                      </h1>

                      <p
                        style="
                          text-align: center;
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                          width: 80%;
                          margin: 30px auto;
                        "
                      >
                        You recently requested to reset your password for your
                        Strikeo account.
                      </p>
                      <div style="text-align: center; margin-top: 30px">
                        <a
                          href="${user.reset_token.link}"
                          style="
                            background-color: #1a4c5f;
                            border-radius: 16px;
                            text-decoration: none;
                            padding: 14px 30px;
                             color: #fff;
                          "
                        >
                          Reset your password
                        </a>
                      </div>
                      <p
                        style="
                          margin-bottom: 0;
                          margin-top: 40px;
                          text-align: center;
                          font-style: normal;
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                        "
                      >
                        If you did not request to reset your password, please
                        ignore this mail.
                      </p>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div style="padding: 20px">
                       ${emailTemplateFooter}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>
`;
};

const profileUpdateTemplate = (user, newPass) => {
  return `<!DOCTYPE html>
<html
  lang="en"
  dir="ltr"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=yes"
    />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <meta name="x-apple-disable-message-reformatting" />
    <!-- Set color scheme to light only -->
    <!-- <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" /> -->
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      @import url(https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap);

      :root {
        /* color-scheme: light;
        supported-color-schemes: light; */
        font-family: Outfit, Arial, sans-serif;
        background-color: #eeeeee;
      }
    </style>
  </head>

  <body
    class="body"
    style="background-color: #f4f4f4; padding: 0.6rem; margin: 0"
  >
    <div
      role="article"
      aria-roledescription="email"
      aria-label="email name"
      lang="en"
      dir="ltr"
      style="font-size: medium; font-size: max(16px, 1rem)"
    >
      <!-- Start of the email content -->
      <div
        class="table-wrapper"
        style="max-width: 500px; margin: 16px auto; padding: 20px"
      >
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="left">
              ${emailTemplateLogo}
            </td>
          </tr>
          <tr style="background-color: #fff">
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width: 100%">
                    <div style="border-radius: 24px; padding: 30px 30px">
                      <h1
                        style="
                          font-style: normal;
                          font-weight: 500;
                          font-size: 24px;
                          color: #313d5b;
                          text-align: center;
                          letter-spacing: 0.02em;
                        "
                      >
                        Profile Updates
                      </h1>

                      <p
                        style="
                          text-align: left;
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;

                          margin: 30px auto;
                        "
                      >
                        Your profile on Strikeo has been updated. Here are your
                        updated profile details:
                      </p>
                      <table
                        style="
                          width: 100%;
                          border-collapse: collapse;
                          margin-top: 20px;
                        "
                      >
                        <tr>
                          <td >
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
                                      style=" 
                                  background-color: #1a4c5f;
                            border-radius: 16px;
                            text-decoration: none;
                            padding: 14px 30px;
                             color: #fff;
                                      ">
                                      Login to Strikeo
                                  </a>
                              </div>
                          </td>
                         
                        </tr>
                      
                    </div>
                  </td>
                </tr>

               
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <div style="padding: 20px">
                  ${emailTemplateFooter}
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>
`;
};

const createPasswordTemplate = (user) => {
  return `<!DOCTYPE html>
<html
  lang="en"
  dir="ltr"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=yes"
    />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <meta name="x-apple-disable-message-reformatting" />
    <!-- Set color scheme to light only -->
    <!-- <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" /> -->
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      @import url(https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap);

      :root {
        /* color-scheme: light;
        supported-color-schemes: light; */
        font-family: Outfit, Arial, sans-serif;
        background-color: #eeeeee;
      }
    </style>
  </head>

  <body
    class="body"
    style="background-color: #f4f4f4; padding: 0.6rem; margin: 0"
  >
    <div
      role="article"
      aria-roledescription="email"
      aria-label="email name"
      lang="en"
      dir="ltr"
      style="font-size: medium; font-size: max(16px, 1rem)"
    >
      <!-- Start of the email content -->
      <div
        class="table-wrapper"
        style="max-width: 500px; margin: 16px auto; padding: 20px"
      >
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="left">
             ${emailTemplateLogo}
            </td>
          </tr>
          <tr style="background-color: #fff">
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width: 100%">
                    <div style="border-radius: 24px; padding: 30px 55px">
                      <h1
                        style="
                          font-style: normal;
                          font-weight: 500;
                          font-size: 24px;
                          color: #313d5b;
                          text-align: center;
                          letter-spacing: 0.02em;
                        "
                      >
                        Welcome to Strikeo
                      </h1>

                      <p
                        style="
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                          margin: 20px auto;
                          text-align: justify;
                        "
                      >
                        You have been added to Strikeo as ${
                          user?.userType || "Vnedor"
                        }. You can create
                        your password credentials from this link.
                      </p>
                      <div style="text-align: center; margin-top: 40px">
                        <a
                          href="${user.reset_token.link}"
                          style="
                                background-color: #1a4c5f;
                            border-radius: 16px;
                            text-decoration: none;
                            padding: 14px 30px;
                             color: #fff;
                          "
                        >
                          Create Credentials
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div style="padding: 20px">
                        ${emailTemplateFooter}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>
`;
};
const updatePasswordTemplate = (user) => {
  return `<!DOCTYPE html>
<html
  lang="en"
  dir="ltr"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=yes"
    />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <meta name="x-apple-disable-message-reformatting" />
    <!-- Set color scheme to light only -->
    <!-- <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" /> -->
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      @import url(https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap);

      :root {
        /* color-scheme: light;
        supported-color-schemes: light; */
        font-family: Outfit, Arial, sans-serif;
        background-color: #eeeeee;
      }
    </style>
  </head>

  <body
    class="body"
    style="background-color: #f4f4f4; padding: 0.6rem; margin: 0"
  >
    <div
      role="article"
      aria-roledescription="email"
      aria-label="email name"
      lang="en"
      dir="ltr"
      style="font-size: medium; font-size: max(16px, 1rem)"
    >
      <!-- Start of the email content -->
      <div
        class="table-wrapper"
        style="max-width: 500px; margin: 16px auto; padding: 20px"
      >
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="left">
              ${emailTemplateLogo}
            </td>
          </tr>
          <tr style="background-color: #fff">
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width: 100%">
                    <div style="border-radius: 24px; padding: 30px 20px">
                      <h1
                        style="
                          font-style: normal;
                          font-weight: 500;
                          font-size: 24px;
                          color: #313d5b;
                          text-align: center;
                          letter-spacing: 0.02em;
                        "
                      >
                        Password Reset
                      </h1>

                      <h1
                        style="
                          font-style: normal;
                          font-weight: 400;
                          font-size: 20px;
                          color: #313d5b;
                          text-align: left;
                          letter-spacing: 0.02em;
                        "
                      >
                        Hi,
                        <span style="font-weight: bold">
                          ${user?.firstName} ${user?.lastName}
                        </span>
                      </h1>
                      <p
                        style="
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                          text-align: left;
                        "
                      >
                        Your password has been reset. Please use
                        “${user?.new_password}” as your new password to login to
                        the system.
                      </p>
                      <p
                        style="
                          font-weight: 500;
                          font-size: 16px;
                          color: black;

                          background: #eeeeee;
                          padding-top: 10px;
                          padding-bottom: 10px;
                          margin-bottom: 30px;
                        "
                      >
                        Team Strikeo
                      </p>
                      <div style="text-align: center; margin-bottom: 20px">
                        <a
                          href="${process.env.FRONTEND_URL}/admin/login"
                          style="
                            background-color: #1a4c5f;
                            border-radius: 16px;
                            text-decoration: none;
                            padding: 14px 30px;
                            color: #fff;
                          "
                        >
                          Login to Strikeo
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div style="padding: 20px">
                        ${emailTemplateFooter}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>
`;
};

const emailChangeTemplate = (user) => {
  return `<!DOCTYPE html>
<html
  lang="en"
  dir="ltr"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=yes"
    />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <meta name="x-apple-disable-message-reformatting" />
    <!-- Set color scheme to light only -->
    <!-- <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" /> -->
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      @import url(https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap);

      :root {
        /* color-scheme: light;
        supported-color-schemes: light; */
        font-family: Outfit, Arial, sans-serif;
        background-color: #eeeeee;
      }
    </style>
  </head>

  <body
    class="body"
    style="background-color: #f4f4f4; padding: 0.6rem; margin: 0"
  >
    <div
      role="article"
      aria-roledescription="email"
      aria-label="email name"
      lang="en"
      dir="ltr"
      style="font-size: medium; font-size: max(16px, 1rem)"
    >
      <!-- Start of the email content -->
      <div
        class="table-wrapper"
        style="max-width: 500px; margin: 16px auto; padding: 20px"
      >
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="left">
              ${emailTemplateLogo}
            </td>
          </tr>
          <tr style="background-color: #fff">
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width: 100%">
                    <div style="border-radius: 24px; padding: 30px 20px">
                      <h1
                        style="
                          font-style: normal;
                          font-weight: 500;
                          font-size: 24px;
                          color: #313d5b;
                          text-align: center;
                          letter-spacing: 0.02em;
                        "
                      >
                        Welcome to Strikeo
                      </h1>
                      <p
                        style="
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                          width: 80%;
                          margin: 50px auto;
                          text-align: left;
                        "
                      >
                        Hi ${user.firstName}, your email has been changed. Try
                        logging in with your new email address.
                      </p>

                      <div style="text-align: center; margin-bottom: 20px">
                        <a
                          href="${
                            user.loginURL ||
                            process.env.BACKEND_URL + "/admin/login"
                          }"
                          style="
                            background-color: #1a4c5f;
                            border-radius: 16px;
                            text-decoration: none;
                            padding: 14px 30px;
                            color: #fff;
                          "
                        >
                          Login to Strikeo
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div style="padding: 20px">
                        ${emailTemplateFooter}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>
`;
};
const orderConfirmTemplate = (data, user, bill, shippingCost) => {
  const totalDiscount = data.reduce(
    (sum, item) => sum + getMin0Number(item.discount),
    0
  );
  return `<!DOCTYPE html>
<html
  lang="en"
  dir="ltr"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=yes"
    />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <meta name="x-apple-disable-message-reformatting" />
    <!-- Set color scheme to light only -->
    <!-- <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" /> -->
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      @import url(https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap);

      :root {
        font-family: Outfit, Arial, sans-serif;
        background-color: #eeeeee;
      }
    </style>
  </head>

  <body
    class="body"
    style="background-color: #f4f4f4; padding: 0.6rem; margin: 0"
  >
    <div
      role="article"
      aria-roledescription="email"
      aria-label="email name"
      lang="en"
      dir="ltr"
      style="font-size: medium; font-size: max(16px, 1rem)"
    >
      <!-- Start of the email content -->
      <div
        class="table-wrapper"
        style="max-width: 500px; margin: 16px auto; padding: 20px"
      >
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="left">
             ${emailTemplateLogo}
            </td>
          </tr>
          <tr style="background-color: #fff">
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width: 100%">
                    <div style="border-radius: 24px; padding: 30px 55px">
                      <h1
                        style="
                          font-style: normal;
                          font-weight: 500;
                          font-size: 24px;
                          color: #313d5b;
                          text-align: center;
                          letter-spacing: 0.02em;
                        "
                      >
                        Order Confirmation
                      </h1>

                      <p
                        style="
                          font-weight: 400;
                          font-size: 14px;
                          color: #313d5b;
                          margin: 20px auto;
                          text-align: justify;
                        "
                      >
                        You recently placed an order of TK. ${(
                          getMin0Number(bill) + getMin0Number(shippingCost)
                        ).toLocaleString()} on Strikeo for
                        the following items:
                      </p>

                      <!-- Begin order details table -->
                      <table
                     
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="margin: 20px 0; border-collapse: collapse; font-size: 12px;"
                      >
                        <thead>
                          <tr>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: left;
                              "
                            >
                              Item
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: center;
                              "
                            >
                              Quantity
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: right;
                              "
                            >
                              Price
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: right;
                              "
                            >
                            Total  Price
                            </th>
                           
                          </tr>
                        </thead>
                        <tbody>
                          ${data
                            .map(
                              (row) => `
                            <tr>
                              <td style="padding: 10px 0">
                              ${row.item}<br/>
                              ${row?.variant ? `Variant: ${row?.variant}` : ""}
                              
                              </td>
                              <td
                                style="
                                  padding: 10px;
                                  text-align: center;
                                "
                              >
                                ${row?.quantity}
                              </td>
                              <td
                                style="
                                  padding: 10px;
                                  text-align: right;
                                "
                              >
                                ${row?.price}
                              </td>
                              <td
                                style="
                                  padding: 10px;
                                  text-align: right;
                                "
                              >
                                ${row?.totalPrice}
                              </td>
                             
                            </tr>
                          `
                            )
                            .join("")}
                           <tr>
                              <td colspan="3" style="padding: 10px; text-align: right; ">Discount(-)</td>
                              <td style="padding: 10px; text-align: right; ">Tk. ${getMin0Number(
                                totalDiscount
                              ).toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td colspan="3" style="padding: 10px; text-align: right; ">Sub Total</td>
                              <td style="padding: 10px; text-align: right; ">Tk. ${getMin0Number(
                                bill
                              ).toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td colspan="3" style="padding: 10px; text-align: right; ">Delivery Charge</td>
                              <td style="padding: 10px; text-align: right; ">Tk. ${getMin0Number(
                                shippingCost
                              ).toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td colspan="3" style="padding: 10px; text-align: right; ">Total</td>
                              <td style="padding: 10px; text-align: right; ">Tk. ${(
                                getMin0Number(bill) +
                                getMin0Number(shippingCost)
                              ).toLocaleString()}</td>
                            </tr>
                        </tbody>
                      </table>
                      <!-- End order details table -->

                      <p  
                      style="
                          font-weight: 600;
                          font-size: 12px;
                          color: #313d5b;
                          margin: 20px auto;
                          text-align: justify;
                        "
                        >
                        Please confirm your order by clicking on the button below:
                      </p>
                      <div style="text-align: center; margin-top: 40px">
                        <a
                          href="${user.confirm_token.link}"
                          style="
                            background-color: #3fcee5;
                            border-radius: 16px;
                            text-decoration: none;
                            padding: 14px 30px;
                            color: #0b3241;
                          "
                        >
                          Confirm Order
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>

                  <tr>
                  <td>
                    <div style="padding: 20px">
                        ${emailTemplateFooter}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>`;
};
const customerOrderPlaceNotificationVendorTemplate = (data, bill, orderNo) => {
  return `<!DOCTYPE html>
<html
  lang="en"
  dir="ltr"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=yes"
    />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <meta name="x-apple-disable-message-reformatting" />
    <!-- Set color scheme to light only -->
    <!-- <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" /> -->
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      @import url(https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap);

      :root {
        font-family: Outfit, Arial, sans-serif;
        background-color: #eeeeee;
      }
    </style>
  </head>

  <body
    class="body"
    style="background-color: #f4f4f4; padding: 0.6rem; margin: 0"
  >
    <div
      role="article"
      aria-roledescription="email"
      aria-label="email name"
      lang="en"
      dir="ltr"
      style="font-size: medium; font-size: max(16px, 1rem)"
    >
      <!-- Start of the email content -->
      <div
        class="table-wrapper"
        style="max-width: 500px; margin: 16px auto; padding: 20px"
      >
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="left">
             ${emailTemplateLogo}
            </td>
          </tr>
          <tr style="background-color: #fff">
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width: 100%">
                    <div style="border-radius: 24px; padding: 30px">
                      <h1
                        style="
                          font-style: normal;
                          font-weight: 500;
                          font-size: 24px;
                          color: #313d5b;
                          text-align: center;
                          letter-spacing: 0.02em;
                        "
                      >
                        Order Number : ${orderNo}
                      </h1>

                      <!-- Begin order details table -->
                      <table
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="
                          margin: 20px 0;
                          border-collapse: collapse;
                          font-size: 12px;
                        "
                      >
                        <thead>
                          <tr>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: left;
                              "
                            >
                              Item
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: center;
                              "
                            >
                              Quantity
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: right;
                              "
                            >
                              Unit Price
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: right;
                              "
                            >
                              Price
                            </th>
                             
                          </tr>
                        </thead>
                        <tbody>
                          ${data
                            .map(
                              (row) => `
                          <tr>
                            <td style="padding: 10px 0">
                             ${row.item}<br/>
                              ${row.variant ? `variant : ${row.variant}` : ""}
                            </td>
                            <td style="padding: 10px; text-align: center">
                              ${row.quantity}
                            </td>
                            <td style="padding: 10px; text-align: right">
                              ${row.price}
                            </td>
                            <td style="padding: 10px; text-align: right">
                              ${row.totalPrice}
                            </td>
                          </tr>
                          `
                            )
                            .join("")}

                        
                          <tr>
                            <td
                              colspan="3"
                              style="
                                padding: 10px;
                                border-top: 1px solid #ddd;
                                text-align: right;
                                font-weight: bold;
                              "
                            >
                              Total
                            </td>
                            <td
                              style="
                                padding: 10px;
                                border-top: 1px solid #ddd;
                                text-align: right;
                              "
                            >
                             TK. ${getMin0Number(bill).toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <!-- End order details table -->
                    </div>
                  </td>
                </tr>
                 <tr>
                  <td>
                    <div style="text-align: center; margin: 40px 0px 40px">
                      <a
                        href="https://portal.strikeo.com/vendor/orders"
                        style="
                          background-color: #118aa9;
                          border-radius: 16px;
                          text-decoration: none;
                          padding: 14px 30px;
                          color: white;
                        "
                      >
                        View Orders
                      </a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div style="padding: 20px">
                       ${emailTemplateFooter}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>
`;
};

const sslCommerzeOrderTemplate = (data) => {
  return `
  <!DOCTYPE html>
<html
  lang="en"
  dir="ltr"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=yes"
    />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <meta name="x-apple-disable-message-reformatting" />
    <!-- Set color scheme to light only -->
    <!-- <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" /> -->
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      @import url(https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap);

      :root {
        /* color-scheme: light;
        supported-color-schemes: light; */
        font-family: Outfit, Arial, sans-serif;
        background-color: #eeeeee;
      }
    </style>
  </head>

  <body
    class="body"
    style="background-color: #f4f4f4; padding: 0.6rem; margin: 0"
  >
    <div
      role="article"
      aria-roledescription="email"
      aria-label="email name"
      lang="en"
      dir="ltr"
      style="font-size: medium; font-size: max(16px, 1rem)"
    >
      <!-- Start of the email content -->
      <div
        class="table-wrapper"
        style="max-width: 500px; margin: 16px auto; padding: 20px"
      >
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="left">
              ${emailTemplateLogo}
            </td>
          </tr>
          <tr style="background-color: #fff">
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width: 100%">
                    <div style="border-radius: 24px; padding: 30px 55px">
                      <h1
                        style="
                          font-style: normal;
                          font-weight: 500;
                          font-size: 18px;
                          color: #313d5b;
                          text-align: left;
                          letter-spacing: 0.02em;
                        "
                      >
                        ${data?.name},${data?.intro}
                      </h1>

                      <p
                        style="
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                          margin: 20px auto;
                          text-align: left;
                        "
                      >
                        ${data?.action?.instructions}
                      </p>

                      <div style="text-align: center; margin: 40px 0px 40px">
                        <a
                          href="${data?.action?.button?.link}"
                          style="
                            background-color: #3fcee5;
                            border-radius: 16px;
                            text-decoration: none;
                            padding: 14px 30px;
                            color: #0b3241;
                          "
                        >
                        ${data?.action?.button?.text}
                        </a>
                      </div>
                      <p
                        style="
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                          margin: 20px auto;
                          text-align: justify;
                        "
                      >
                        ${data?.outro ?? ""}
                      </p>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div style="padding: 20px">
                        ${emailTemplateFooter}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>

  `;
};

const contactUsMailTemplate = (data) => {
  return `<!DOCTYPE html>
<html
  lang="en"
  dir="ltr"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=yes"
    />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <meta name="x-apple-disable-message-reformatting" />
    <!-- Set color scheme to light only -->
    <!-- <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" /> -->
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      @import url(https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap);

      :root {
        /* color-scheme: light;
        supported-color-schemes: light; */
        font-family: Outfit, Arial, sans-serif;
        background-color: #eeeeee;
      }
    </style>
  </head>

  <body
    class="body"
    style="background-color: #f4f4f4; padding: 0.6rem; margin: 0"
  >
    <div
      role="article"
      aria-roledescription="email"
      aria-label="email name"
      lang="en"
      dir="ltr"
      style="font-size: medium; font-size: max(16px, 1rem)"
    >
      <!-- Start of the email content -->
      <div
        class="table-wrapper"
        style="max-width: 500px; margin: 16px auto; padding: 20px"
      >
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="left">
              ${emailTemplateLogo}
            </td>
          </tr>
          <tr style="background-color: #fff">
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width: 100%">
                    <div style="border-radius: 24px; padding: 30px 55px">
                      <h1
                        style="
                          font-style: normal;
                          font-weight: 500;
                          font-size: 24px;
                          color: #313d5b;
                          text-align: left;
                          letter-spacing: 0.02em;
                        "
                      >
                        Dear Team
                      </h1>

                      <p
                        style="
                          text-align: left;
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                        "
                      >
                        You have received a new message from the "Contact Us"
                        form.
                      </p>
                      <p
                        style="
                          text-align: left;
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                        "
                      >
                        Name : ${data?.name}
                      </p>
                      <p
                        style="
                          text-align: left;
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                        "
                      >
                        Email : ${data?.email}
                      </p>
                      <p
                        style="
                          text-align: left;
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                        "
                      >
                        Phone : ${data?.phone}
                      </p>
                      <p
                        style="
                          text-align: left;
                          font-weight: 500;
                          font-size: 16px;
                          color: #313d5b;
                        "
                      >
                        Message :
                      </p>
                      <p
                        style="
                          text-align: left;
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                        "
                      >
                        ${data?.message}
                      </p>

                      <p
                        style="
                          margin-bottom: 0;
                          margin-top: 40px;
                          text-align: center;
                          font-style: normal;
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                        "
                      >
                        Please respond to the user's inquiry as soon as
                        possible.
                      </p>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div style="padding: 20px">
                       ${emailTemplateFooter}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>
`;
};

const orderUpdateStatusForCustomTemplate = (
  data,
  orderNo,
  bill,
  status,
  shippingDetails
) => {
  const totalDiscount = data.reduce(
    (sum, item) => sum + getMin0Number(item?.discount),
    0
  );
  const shippingCost = getMin0Number(shippingDetails?.shippingCost);
  const orderStatusMessage = (status) => {
    switch (status) {
      case "Pending":
        return "Your order is pending. We'll notify you once it starts processing.";
      case "Processing":
        return "Your order is currently being processed. Thank you for your patience!";
      case "Shipped":
        return "Your order has been shipped! It’s on its way.";
      case "Delivered":
        return "Your order has been delivered! We hope you enjoy it.";
      case "Cancelled":
        return "Your order has been cancelled. If you have any questions, please contact us.";
      case "Confirmed":
        return "Your order has been Confirmed. We'll notify you once it starts processing.";
      default:
        return "Status unknown. Please contact support.";
    }
  };
  return `<!DOCTYPE html>
<html
  lang="en"
  dir="ltr"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=yes"
    />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <meta name="x-apple-disable-message-reformatting" />
    <!-- Set color scheme to light only -->
    <!-- <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" /> -->
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      @import url(https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap);

      :root {
        font-family: Outfit, Arial, sans-serif;
        background-color: #eeeeee;
      }
    </style>
  </head>

  <body
    class="body"
    style="background-color: #f4f4f4; padding: 0.6rem; margin: 0"
  >
    <div
      role="article"
      aria-roledescription="email"
      aria-label="email name"
      lang="en"
      dir="ltr"
      style="font-size: medium; font-size: max(16px, 1rem)"
    >
      <!-- Start of the email content -->
      <div
        class="table-wrapper"
        style="max-width: 500px; margin: 16px auto; padding: 20px"
      >
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="left">
              ${emailTemplateLogo}
            </td>
          </tr>
          <tr style="background-color: #fff">
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width: 100%">
                    <div style="border-radius: 24px; padding: 30px 55px">
                      <h1
                        style="
                          font-style: normal;
                          font-weight: 500;
                          font-size: 24px;
                          color: #313d5b;
                          text-align: left;
                          letter-spacing: 0.02em;
                        "
                      >
                      Order No. :  ${orderNo}
                      </h1>
                      <h2
                        style="
                          font-style: normal;
                          font-weight: 500;
                          font-size: 16px;
                          color: #313d5b;
                          text-align: left;
                          letter-spacing: 0.02em;
                        "
                      >
                       ${orderStatusMessage(status)}
                      </h2>

                      <!-- Begin order details table -->
                      <table
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="margin: 20px 0; border-collapse: collapse; font-size: 12px;"
                      >
                        <thead>
                          <tr>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: left;
                              "
                            >
                              Item
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: center;
                              "
                            >
                              Quantity
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: right;
                              "
                            >
                              Price
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: right;
                              "
                            >
                              Total Price
                            </th>
                           
                          </tr>
                        </thead>
                        <tbody>
                          ${data
                            .map(
                              (row) => `
                            <tr>
                              <td style="padding: 10px 0">
                              ${row.item}
                               <br/>
                              ${row?.variant ? `Variant: ${row?.variant}` : ""}
                              </td>
                              <td
                                style="
                                  padding: 10px;
                                  text-align: center;
                                "
                              >
                                ${row.quantity}
                              </td>
                              <td
                                style="
                                  padding: 10px;
                                  text-align: right;
                                "
                              >
                                ${row.price}
                              </td>
                              <td
                                style="
                                  padding: 10px;
                                  text-align: right;
                                "
                              >
                                ${row.totalPrice}
                              </td>
                            
                             
                            </tr>
                          `
                            )
                            .join("")}
                            <tr>
                              <td colspan="3" style="padding: 10px; text-align: right; ">Discount(-)</td>
                              <td style="padding: 10px; text-align: right; ">Tk. ${getMin0Number(
                                totalDiscount
                              ).toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td colspan="3" style="padding: 10px; text-align: right; ">Sub Total</td>
                              <td style="padding: 10px; text-align: right; ">Tk. ${getMin0Number(
                                bill
                              ).toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td colspan="3" style="padding: 10px; text-align: right; ">Delivery Charge</td>
                              <td style="padding: 10px; text-align: right; ">Tk. ${getMin0Number(
                                shippingCost
                              ).toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td colspan="3" style="padding: 10px; text-align: right; ">Total</td>
                              <td style="padding: 10px; text-align: right; ">Tk. ${(
                                getMin0Number(bill) +
                                getMin0Number(shippingCost)
                              ).toLocaleString()}</td>
                            </tr>
                        </tbody>
                      </table>
                      <!-- End order details table -->
                    </div>
                  </td>
                </tr>

                  <tr>
                  <td>
                    <div style="padding: 20px">
                    ${emailTemplateFooter}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>`;
};

const orderCreateFailedEmailTemplate = (data) => {
  const { title, subTitle, reason, orders } = data;

  return `<!DOCTYPE html>
<html
  lang="en"
  dir="ltr"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=yes"
    />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <meta name="x-apple-disable-message-reformatting" />
    <!-- Set color scheme to light only -->
    <!-- <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" /> -->
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      @import url(https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap);

      :root {
        /* color-scheme: light;
        supported-color-schemes: light; */
        font-family: Outfit, Arial, sans-serif;
        background-color: #eeeeee;
      }
    </style>
  </head>

  <body
    class="body"
    style="background-color: #f4f4f4; padding: 0.6rem; margin: 0"
  >
    <div
      role="article"
      aria-roledescription="email"
      aria-label="email name"
      lang="en"
      dir="ltr"
      style="font-size: medium; font-size: max(16px, 1rem)"
    >
      <!-- Start of the email content -->
      <div
        class="table-wrapper"
        style="max-width: 500px; margin: 16px auto; padding: 20px"
      >
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="left">
             ${emailTemplateLogo}
            </td>
          </tr>
          <tr style="background-color: #fff">
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width: 100%">
                    <div style="border-radius: 24px; padding: 30px">
                      <h1
                        style="
                          font-style: normal;
                          font-weight: 500;
                          font-size: 20px;
                          color: #313d5b;
                          text-align: left;
                          letter-spacing: 0.02em;
                        "
                      >
                       ${title}
                      </h1>

                      <p
                        style="
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                          margin: 20px auto;
                          text-align: justify;
                        "
                      >
                      ${subTitle}
                      </p>

                   
                      <div>
                      <table
                     
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="margin: 20px 0; border-collapse: collapse; font-size: 12px;"
                      >
                        <thead>
                          <tr>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: left;
                              "
                            >
                              Item
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: center;
                              "
                            >
                              Quantity
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: right;
                              "
                            >
                              Price
                            </th>
                             <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: right;
                              "
                            >
                            Total  Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          ${orders
                            .map(
                              (row) => `
                            <tr>
                              <td style="padding: 10px 0">
                              ${row.item}
                              <br/>
                              ${row?.variant ? `Variant: ${row?.variant}` : ""}
                              </td>
                              <td
                                style="
                                  padding: 10px;
                                  text-align: center;
                                "
                              >
                                ${row.quantity}
                              </td>
                              <td
                                style="
                                  padding: 10px;
                                  text-align: right;
                                "
                              >
                                ${row.price}
                              </td>
                               <td
                                style="
                                  padding: 10px;
                                  text-align: right;
                                "
                              >
                                ${row.totalPrice}
                              </td>
                             
                            </tr>
                          `
                            )
                            .join("")}
                           
                        </tbody>
                      </table>
                      </div>

                      <p>If you have any questions, feel free to reach out!</p>
                      <div style="text-align: center; margin-top: 40px;  margin-bottom: 40px;">
                        <a
                          href="mailto:support@strikeo.com"
                          style="
                            background-color: #1a4c5f;
                            border-radius: 16px;
                            text-decoration: none;
                            padding: 14px 30px;
                            color: #fff;
                          "
                        >
                          Contact us
                        </a>
                      </div>
                         <p
                        style="
                          font-weight: 400;
                          font-size: 16px;
                          color: #313d5b;
                          margin: 20px auto;
                          text-align: justify;
                        "
                      >
                      ${reason}
                      </p>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div style="padding: 20px">
                      ${emailTemplateFooter}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>
`;
};
const orderAdminOrderEmailTemplate = (info, customerOrders, vendorOrders) => {
  const {
    customerName,
    customerEmail,
    customerBill,
    shippingDetails,
    //Vendor Info
    vendorName,
    vendorEmail,
    orderNumber,
    vendorBill,
    status,
  } = info;
  const totalDiscount = customerOrders.reduce(
    (sum, item) => sum + getMin0Number(item?.discount),
    0
  );
  const shippingCost = shippingDetails?.shippingCost || 0;
  const orderStatusMessage = (status) => {
    switch (status) {
      case "Pending":
        return `The order (${orderNumber}) is pending.`;
      case "Processing":
        return `The order (${orderNumber}) is currently being processed.`;
      case "Shipped":
        return `The order (${orderNumber}) has been shipped!`;
      case "Delivered":
        return `The order (${orderNumber}) has been delivered!`;
      case "Cancelled":
        return `The order (${orderNumber}) has been cancelled.`;
      case "Confirmed":
        return `The order (${orderNumber}) has been Confirmed.`;
      default:
        return "Something gonna wrong. Please contact developer.";
    }
  };
  return `<!DOCTYPE html>
<html
  lang="en"
  dir="ltr"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=yes"
    />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <meta name="x-apple-disable-message-reformatting" />
    <!-- Set color scheme to light only -->
    <!-- <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" /> -->
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      @import url(https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap);

      :root {
        font-family: Outfit, Arial, sans-serif;
        background-color: #eeeeee;
      }
    </style>
  </head>

  <body
    class="body"
    style="background-color: #f4f4f4; padding: 0.6rem; margin: 0"
  >
    <div
      role="article"
      aria-roledescription="email"
      aria-label="email name"
      lang="en"
      dir="ltr"
      style="font-size: medium; font-size: max(16px, 1rem)"
    >
      <!-- Start of the email content -->
      <div
        class="table-wrapper"
        style="max-width: 500px; margin: 16px auto; padding: 20px"
      >
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="left">${emailTemplateLogo}</td>
          </tr>
          <tr style="background-color: #fff">
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width: 100%">
                    <div
                      style="
                        border-bottom: 1px solid #ddd;
                        font-weight: 500;
                        text-align: left;
                        padding: 10px 20px;
                      "
                    >
                      Customer : ${customerName}
                    </div>
                    <div style="border-radius: 24px; padding: 30px">
                      <h1
                        style="
                          font-style: normal;
                          font-weight: 500;
                          font-size: 24px;
                          color: #313d5b;
                          text-align: left;
                          letter-spacing: 0.02em;
                        "
                      >
                        ${orderStatusMessage(status)}
                      </h1>

                      <!-- Begin order details table -->
                      <table
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="
                          margin: 20px 0;
                          border-collapse: collapse;
                          font-size: 12px;
                        "
                      >
                        <thead>
                          <tr>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: left;
                              "
                            >
                              Item
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: center;
                              "
                            >
                              Quantity
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: right;
                              "
                            >
                              Price
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: right;
                              "
                            >
                              Total Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          ${customerOrders
                            .map(
                              (row) => `
                          <tr>
                            <td style="padding: 10px 0">
                              ${row.item}
                              <br />
                              ${row?.variant ? `Variant: ${row?.variant}` : ""}
                            </td>
                            <td style="padding: 10px; text-align: center">
                              ${row.quantity}
                            </td>
                            <td style="padding: 10px; text-align: right">
                              ${row.price}
                            </td>
                            <td style="padding: 10px; text-align: right">
                              ${row.totalPrice}
                            </td>
                          </tr>
                          `
                            )
                            .join("")}
                          <tr>
                            <td
                              colspan="3"
                              style="padding: 10px; text-align: right"
                            >
                              Discount(-)
                            </td>
                            <td style="padding: 10px; text-align: right">
                              Tk. ${getMin0Number(
                                totalDiscount
                              ).toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td
                              colspan="3"
                              style="padding: 10px; text-align: right"
                            >
                             Sub Total
                            </td>
                            <td style="padding: 10px; text-align: right">
                              Tk. ${getMin0Number(
                                customerBill
                              ).toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td
                              colspan="3"
                              style="padding: 10px; text-align: right"
                            >
                              Delivery Charge
                            </td>
                            <td style="padding: 10px; text-align: right">
                              Tk. ${getMin0Number(
                                shippingCost
                              ).toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td
                              colspan="3"
                              style="padding: 10px; text-align: right"
                            >
                              Total
                            </td>
                            <td style="padding: 10px; text-align: right">
                              Tk. ${(
                                getMin0Number(shippingCost) +
                                getMin0Number(customerBill)
                              ).toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <!-- End order details table -->
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="3">
                    <div style="border-radius: 24px; padding: 30px">
                      <table width="100%" cellpadding="20" cellspacing="0">
                        <tr>
                          <td
                            style="
                              padding: 5px;
                              border-top: 1px solid #ddd;
                              text-align: left;
                            "
                          >
                            Shipping Details :
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              padding: 5px;
                              text-align: left;
                              font-size: 12px;
                            "
                          >
                            <span style="font-weight: bold; padding-right: 4px">
                              Name :
                            </span>
                            ${shippingDetails.firstName}
                            ${shippingDetails.lastName}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              padding: 5px;
                              text-align: left;
                              font-size: 12px;
                            "
                          >
                            <span style="font-weight: bold; padding-right: 4px">
                              Phone :
                            </span>
                            ${shippingDetails.phone}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              padding: 5px;
                              text-align: left;
                              font-size: 12px;
                            "
                          >
                            <span style="font-weight: bold; padding-right: 4px">
                              Address :
                            </span>
                            ${shippingDetails.address}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              padding: 5px;
                              text-align: left;
                              font-size: 12px;
                            "
                          >
                            <span style="font-weight: bold; padding-right: 4px">
                              City :
                            </span>
                            ${shippingDetails.city}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              padding: 5px;
                              text-align: left;
                              font-size: 12px;
                            "
                          >
                            <span style="font-weight: bold; padding-right: 4px">
                              Country :
                            </span>
                            ${shippingDetails.country}
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="width: 100%">
                    <div
                      style="
                        border-bottom: 1px solid #ddd;
                        font-weight: 500;
                        text-align: left;
                        padding: 10px 20px;
                      "
                    >
                      Vendor : ${vendorName}
                    </div>
                    <div style="border-radius: 24px; padding: 30px">
                      <!-- Begin order details table -->
                      <table
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="
                          margin: 20px 0;
                          border-collapse: collapse;
                          font-size: 12px;
                        "
                      >
                        <thead>
                          <tr>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: left;
                              "
                            >
                              Item
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: center;
                              "
                            >
                              Quantity
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: right;
                              "
                            >
                              Price
                            </th>
                            <th
                              style="
                                padding: 10px;
                                border-bottom: 1px solid #ddd;
                                text-align: right;
                              "
                            >
                              Total Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          ${vendorOrders
                            .map(
                              (row) => `
                          <tr>
                            <td style="padding: 10px 0">
                              ${row.item}
                              <br />
                              ${row?.variant ? `Variant: ${row?.variant}` : ""}
                            </td>
                            <td style="padding: 10px; text-align: center">
                              ${row.quantity}
                            </td>
                            <td style="padding: 10px; text-align: right">
                              ${row.price}
                            </td>
                            <td style="padding: 10px; text-align: right">
                              ${row.totalPrice}
                            </td>
                          </tr>
                          `
                            )
                            .join("")}
                        
                          <tr>
                            <td
                              colspan="3"
                              style="padding: 10px; text-align: right"
                            >
                              Total
                            </td>
                            <td style="padding: 10px; text-align: right">
                              Tk. ${getMin0Number(vendorBill).toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <!-- End order details table -->
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style="padding: 20px">${emailTemplateFooter}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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
  orderConfirmTemplate,
  sslCommerzeOrderTemplate,
  contactUsMailTemplate,
  customerOrderPlaceNotificationVendorTemplate,
  orderUpdateStatusForCustomTemplate,
  orderCreateFailedEmailTemplate,
  orderAdminOrderEmailTemplate,
};
