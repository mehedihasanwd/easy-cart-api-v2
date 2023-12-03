import { IClearCookie, ISaveCookie } from "../types/cookie_config_type";

export const save_cookie_data: ISaveCookie = {
  cookie_token: "refresh_token",
  cookie_options: {
    httpOnly: true,
    secure: false,
    maxAge: 7 * 20 * 60 * 60 * 1000,
  },
};

export const clear_cookie_data: IClearCookie = {
  cookie_token: "refresh_token",
  cookie_options: {
    httpOnly: true,
    secure: false,
  },
};
