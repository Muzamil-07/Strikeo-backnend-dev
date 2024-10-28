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
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="left" style="width: 100%; padding: 10px 0px">
                        <img
                          src="https://portal.strikeo.com/uploads/1729610341542-strikeo_logo.png"
                          alt="Light Logo"
                          class="logo"
                        />
                      </td>
                    </tr>
                  </table>
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
                          <table width="100%" cellpadding="20" cellspacing="0">
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
                                      >
                                        <img
                                          src="https://portal.strikeo.com/uploads/1728484875886-mczg3knv0vs2l8okgjgy.png"
                                          alt="Facebook"
                                          class="social-icon"
                                        />
                                      </a>
                                    </td>
                                    <td style="padding: 0 5px">
                                      <a
                                        href="https://x.com/ShopStrikeO"
                                        target="_blank"
                                      >
                                        <img
                                          src="https://portal.strikeo.com/uploads/1728484909927-rd8eoqkrkyl5pjvenorx.png"
                                          alt="Twitter"
                                          class="social-icon"
                                        />
                                      </a>
                                    </td>
                                    <td style="padding: 0 5px">
                                      <a
                                        href="https://www.linkedin.com/company/strikeo"
                                        target="_blank"
                                      >
                                        <img
                                          src="https://portal.strikeo.com/uploads/1728484946839-u3aka8pqj72golrbcwg7.png"
                                          alt="LinkedIn"
                                          class="social-icon"
                                        />
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                                <p class="footer-text">
                                  <a
                                    style="color: #111111"
                                    href="https://www.strikeo.com/legal/privacy-policy"
                                    target="_blank"
                                    >Privacy Policy</a
                                  >
                                  |
                                  <a
                                    style="color: #111111"
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
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="width: 100%; padding: 20px 0 5px">
                    <img
                      src="https://portal.strikeo.com/uploads/1729610341542-strikeo_logo.png"
                      alt="Light Logo"
                      class="logo"
                      style="width: 106px; height: auto; object-fit: cover"
                    />
                  </td>
                </tr>
              </table>
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
                      <table width="100%" cellpadding="20" cellspacing="0">
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
                                      alt="Facebook"
                                      class="social-icon"
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
                                      alt="Twitter"
                                      class="social-icon"
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
                                      alt="LinkedIn"
                                      class="social-icon"
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
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="width: 100%; padding: 20px 0 5px">
                    <img
                      src="https://portal.strikeo.com/uploads/1729610341542-strikeo_logo.png"
                      alt="Light Logo"
                      class="logo"
                      style="width: 106px; height: auto; object-fit: cover"
                    />
                  </td>
                </tr>
              </table>
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
                      <table width="100%" cellpadding="20" cellspacing="0">
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
                                      alt="Facebook"
                                      class="social-icon"
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
                                      alt="Twitter"
                                      class="social-icon"
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
                                      alt="LinkedIn"
                                      class="social-icon"
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
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="width: 100%; padding: 20px 0 5px">
                    <img
                      src="https://portal.strikeo.com/uploads/1729610341542-strikeo_logo.png"
                      alt="Light Logo"
                      class="logo"
                      style="width: 106px; height: auto; object-fit: cover"
                    />
                  </td>
                </tr>
              </table>
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
                      <table width="100%" cellpadding="20" cellspacing="0">
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
                                      alt="Facebook"
                                      class="social-icon"
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
                                      alt="Twitter"
                                      class="social-icon"
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
                                      alt="LinkedIn"
                                      class="social-icon"
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
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="width: 100%; padding: 20px 0 5px">
                    <img
                      src="https://portal.strikeo.com/uploads/1729610341542-strikeo_logo.png"
                      alt="Light Logo"
                      class="logo"
                      style="width: 106px; height: auto; object-fit: cover"
                    />
                  </td>
                </tr>
              </table>
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
                <table width="100%" cellpadding="20" cellspacing="0">
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
                                alt="Facebook"
                                class="social-icon"
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
                                alt="Twitter"
                                class="social-icon"
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
                                alt="LinkedIn"
                                class="social-icon"
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
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="width: 100%; padding: 20px 0 5px">
                    <img
                      src="https://portal.strikeo.com/uploads/1729610341542-strikeo_logo.png"
                      alt="Light Logo"
                      class="logo"
                      style="width: 106px; height: auto; object-fit: cover"
                    />
                  </td>
                </tr>
              </table>
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
                        You have been added to Strikeo as vendor. You can create
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
                      <table width="100%" cellpadding="20" cellspacing="0">
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
                                      alt="Facebook"
                                      class="social-icon"
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
                                      alt="Twitter"
                                      class="social-icon"
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
                                      alt="LinkedIn"
                                      class="social-icon"
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
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="width: 100%; padding: 20px 0 5px">
                    <img
                      src="https://portal.strikeo.com/uploads/1729610341542-strikeo_logo.png"
                      alt="Light Logo"
                      class="logo"
                      style="width: 106px; height: auto; object-fit: cover"
                    />
                  </td>
                </tr>
              </table>
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
                      <table width="100%" cellpadding="20" cellspacing="0">
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
                                      alt="Facebook"
                                      class="social-icon"
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
                                      alt="Twitter"
                                      class="social-icon"
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
                                      alt="LinkedIn"
                                      class="social-icon"
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
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="width: 100%; padding: 20px 0 5px">
                    <img
                      src="https://portal.strikeo.com/uploads/1729610341542-strikeo_logo.png"
                      alt="Light Logo"
                      class="logo"
                      style="width: 106px; height: auto; object-fit: cover"
                    />
                  </td>
                </tr>
              </table>
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
                      <table width="100%" cellpadding="20" cellspacing="0">
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
                                      alt="Facebook"
                                      class="social-icon"
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
                                      alt="Twitter"
                                      class="social-icon"
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
                                      alt="LinkedIn"
                                      class="social-icon"
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
const orderConfirmTemplate = (data, user, bill) => {
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
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="width: 100%; padding: 20px 0 5px">
                    <img
                      src="https://portal.strikeo.com/uploads/1729610341542-strikeo_logo.png"
                      alt="Light Logo"
                      class="logo"
                      style="width: 106px; height: auto; object-fit: cover"
                    />
                  </td>
                </tr>
              </table>
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
                        You recently placed an order of TK. ${bill} on Strikeo for
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
                           
                          </tr>
                        </thead>
                        <tbody>
                          ${data
                            .map(
                              (row) => `
                            <tr>
                              <td style="padding: 10px 0">${row.item}</td>
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
                             
                            </tr>
                          `
                            )
                            .join("")}
                        </tbody>
                      </table>
                      <!-- End order details table -->

                      <p  style="
                          font-weight: 600;
                          font-size: 12px;
                          color: #313d5b;
                          margin: 20px auto;
                          text-align: justify;
                        ">Please confirm your order by clicking on the button below:</p>
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
                      <table width="100%" cellpadding="20" cellspacing="0">
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
                                      alt="Facebook"
                                      class="social-icon"
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
                                      alt="Twitter"
                                      class="social-icon"
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
                                      alt="LinkedIn"
                                      class="social-icon"
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
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="width: 100%; padding: 20px 0 5px">
                    <img
                      src="https://portal.strikeo.com/uploads/1729610341542-strikeo_logo.png"
                      alt="Light Logo"
                      class="logo"
                      style="width: 106px; height: auto; object-fit: cover"
                    />
                  </td>
                </tr>
              </table>
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
                          text-align: justify;
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
                      <table width="100%" cellpadding="20" cellspacing="0">
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
                                      alt="Facebook"
                                      class="social-icon"
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
                                      alt="Twitter"
                                      class="social-icon"
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
                                      alt="LinkedIn"
                                      class="social-icon"
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
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="width: 100%; padding: 20px 0 5px">
                    <img
                      src="https://portal.strikeo.com/uploads/1729610341542-strikeo_logo.png"
                      alt="Light Logo"
                      class="logo"
                      style="width: 106px; height: auto; object-fit: cover"
                    />
                  </td>
                </tr>
              </table>
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
                      <table width="100%" cellpadding="20" cellspacing="0">
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
                                      alt="Facebook"
                                      class="social-icon"
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
                                      alt="Twitter"
                                      class="social-icon"
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
                                      alt="LinkedIn"
                                      class="social-icon"
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
};
