// Utils/tokenExpiry.utils.js

export const getTokenExpiryDate = (expiry) => {
  const now = new Date();

  const value = parseInt(expiry, 10);
  const unit = expiry.replace(value, "").toLowerCase();

  switch (unit) {
    case "m":
      now.setMinutes(now.getMinutes() + value);
      break;

    case "h":
      now.setHours(now.getHours() + value);
      break;

    case "d":
      now.setDate(now.getDate() + value);
      break;

    default:
      throw new Error(`Unsupported expiry format: ${expiry}`);
  }

  return now;
};

export const getAccessTokenExpiryDate = () =>
  getTokenExpiryDate(process.env.ACCESS_TOKEN_EXPIRY);

export const getRefreshTokenExpiryDate = () =>
  getTokenExpiryDate(process.env.REFRESH_TOKEN_EXPIRY);
