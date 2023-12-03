export interface ISaveCookie {
  cookie_token: "refresh_token";
  cookie_options: {
    httpOnly: boolean;
    secure: boolean;
    maxAge: number;
  };
}

export interface IClearCookie {
  cookie_token: "refresh_token";
  cookie_options: {
    httpOnly: boolean;
    secure: boolean;
  };
}
