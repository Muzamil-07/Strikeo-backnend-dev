const pathaoService = require("../../utils/pathaoService");
const PathaoToken = require("../../models/PathaoToken");

exports.ensureToken = async () => {
  const client_id = process.env.PATHAO_CLIENT_ID;
  const client_secret = process.env.PATHAO_CLIENT_SECRET;

  try {
    let token = await PathaoToken.findOne({ client_id, client_secret });

    const currentTime = Date.now();
    if (token) {
      // Token exists, check if it is expired
      const tokenExpiryTime =
        token.issued_at.getTime() + token.expires_in * 1000;
      if (currentTime >= tokenExpiryTime) {
        console.warn("Token expired, refreshing...");
        const response = await pathaoService.issueRefreshToken(
          token.refresh_token
        );

        // Update the token in DB
        const { access_token, refresh_token, expires_in } = response;
        token.access_token = access_token;
        token.refresh_token = refresh_token;
        token.expires_in = expires_in;
        token.issued_at = currentTime;

        await token.save();
        console.log("Token refreshed successfully.");
      } else {
        console.info("Token is still valid.");
      }
    } else {
      // Token doesn't exist, issue a new one
      console.error(
        "No token found in the database for this client. Issuing new token..."
      );
      const response = await pathaoService.issueAccessToken();

      const { access_token, refresh_token, expires_in } = response;

      // Create a new token document and save it to DB
      token = new PathaoToken({
        client_id,
        client_secret,
        access_token,
        refresh_token,
        expires_in,
        issued_at: currentTime,
      });

      await token.save();
      console.log("New token issued and saved to database.");
    }
  } catch (error) {
    console.error("Error ensuring token:", error);
  }
};
