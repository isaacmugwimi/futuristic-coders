
export const getTokenExpiryDate = (expiry) => {
  if (typeof expiry !== "string") {
    throw new Error(
      "Token expiry is missing. Check your environment variables.",
    );
  }

  const match = /^(\d+)(m|h|d)$/i.exec(expiry.trim());

  if (!match || Number(match[1]) <= 0) {
    throw new Error(`Unsupported expiry format: ${expiry}`);
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const now = new Date();

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
  }

  return now;
};

export const getAccessTokenExpiryDate = () =>
  getTokenExpiryDate(process.env.JWT_ACCESS_EXPIRES_IN || "15m");

export const getRefreshTokenExpiryDate = () =>
  getTokenExpiryDate(process.env.JWT_REFRESH_EXPIRES_IN || "1d");
