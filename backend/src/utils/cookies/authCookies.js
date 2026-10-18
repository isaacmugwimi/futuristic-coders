const isProduction = process.env.NODE_ENV === "production";

// Same-site on localhost (ports don't matter), so "lax" works in dev.
// In production with a separate frontend domain, "none" requires secure: true.
const baseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

// Keep these equal to JWT_ACCESS_EXPIRES_IN / JWT_REFRESH_EXPIRES_IN.
const ACCESS_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day

export const ACCESS_COOKIE_OPTIONS = { ...baseOptions, maxAge: ACCESS_MAX_AGE };
export const REFRESH_COOKIE_OPTIONS = { ...baseOptions, maxAge: REFRESH_MAX_AGE };

// For res.clearCookie: same options, but without maxAge.
export const CLEAR_COOKIE_OPTIONS = baseOptions;