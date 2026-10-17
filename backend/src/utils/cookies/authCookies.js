const isProduction = process.env.NODE_ENV === "production";

export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 15 * 60 * 1000,
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
   maxAge:  60 * 60 * 1000, // 1 hour
};

// const isProduction = process.env.NODE_ENV === "production";

// export const ACCESS_COOKIE_OPTIONS = {
//   httpOnly: true,
//   secure: isProduction,
//   sameSite: "lax",
//   path: "/",
//   maxAge: 15 * 60 * 1000,
// };

// export const REFRESH_COOKIE_OPTIONS = {
//   httpOnly: true,
//   secure: isProduction,
//   sameSite: "lax",
//   path: "/",
//   // maxAge: 30 * 24 * 60 * 60 * 1000,
//   maxAge:  60 * 60 * 1000, // 1 hour
// };


// // 24 hours × 60 minutes × 60 seconds × 1000 milliseconds