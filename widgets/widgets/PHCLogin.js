import { html, useState, useEffect } from "../util/preactCentral.js";

export default function PHCLogin({ userData, setUserData }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const localStoragePrefix = "mpp-widgets";

  const phcGetAppRoot = () => {
    return "https://my.pureheart.org/widgets";
  };

  const phcGetAuthConfiguration = () => {
    const root = phcGetAppRoot();
    // https://{platform domain}/widgets/Api/Auth --- This is the same on every instance of MP (as far as I know)
    const configURL = "".concat(root, "/Api/Auth");
    return fetch(configURL).then(
      (configData) => configData.json(),
      () => {
        throw console.error("Unable to retrieve auth info!");
      }
    );
  };

  const phcGetAuthToken = async (cacheKey) => {
    const root = phcGetAppRoot();
    const tokenURL = "".concat(root, `/Home/Tokens?cacheKey=${cacheKey}`);

    return fetch(tokenURL)
      .then((tokenData) => tokenData.json())
      .catch((error) => {
        throw (
          (console.error("Unable to retrieve auth token!"),
          console.error(error))
        );
      });
  };

  const phcGetCSRFToken = async () => {
    const root = phcGetAppRoot();
    const CSRFTokenURL = "".concat(root, `/Home/CSRFToken`);

    return fetch(CSRFTokenURL)
      .then((tokenData) => tokenData.json())
      .catch((error) => {
        throw (
          (console.error("Unable to retrieve auth token!"),
          console.error(error))
        );
      });
  };

  const phcRefreshTokens = async () =>
    phcGetAuthConfiguration().then(async (data) => {
      const refreshURLString =
        "".concat(data.signInUrl, "?") +
        "response_type=".concat(data.responseType) +
        "&scope=".concat(data.scope) +
        "&client_id=".concat(data.clientId) +
        "&redirect_uri=".concat(data.redirectUrl) +
        "&nonce=".concat(data.nonce) +
        "&state=REAUTH";
      return fetch(refreshURLString)
        .then((response) => {
          phcSaveTokens(response.json());
        })
        .then(phcSaveCSRFToken)
        .catch((error) => {
          throw (
            (console.error("Unable to retrieve auth token!"),
            console.error(error))
          );
        });
    });

  const phcGetRequest = async (path, includeAuth = true) => {
    const authToken = window.localStorage.getItem(
      `${localStoragePrefix}_AuthToken`
    );
    const expiresAfterDate = window.localStorage.getItem(
      `${localStoragePrefix}_ExpiresAfter`
    );

    const CSRFToken =
      JSON.parse(
        window.sessionStorage.getItem(`${localStoragePrefix}_CSRFToken`)
      ) || {};
    const CSRFExpiresAfterDate = new Date(CSRFToken.expiresAfterUtc || 0);

    const isTokenExpired =
      new Date() > new Date(expiresAfterDate) ||
      new Date() > CSRFExpiresAfterDate;
    if (isTokenExpired) await phcRefreshTokens();

    return fetch(path, {
      headers: {
        // 'Content-Type': 'Application/JSON',
        Authorization: includeAuth ? `Bearer ${authToken}` : null,
        "x-csrf-token": includeAuth ? CSRFToken.token : null,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.text().then((text) => {
            try {
              return text ? JSON.parse(text) : {};
            } catch (error) {
              console.error(
                `Failed to parse JSON response from ${path}`,
                error
              );
              return {};
            }
          });
        } else {
          return {};
          // return response.status === 401 ? phcSignIn() : {}
        }
      })
      .catch((error) => {
        console.error(`Unable to make request to ${path}`),
          console.error(error);
        return {};
      });
  };

  const getCurrentUser = async () => {
    const root = phcGetAppRoot();
    const userURL = "".concat(root, `/Api/Auth/User`);

    return phcGetRequest(userURL)
      .then((userData) => userData)
      .catch((error) => {
        throw (
          (console.error("Unable to retrieve current user!"),
          console.error(error))
        );
      });
  };

  const phcSaveTokens = (tokenData) => {
    const { accessToken, idToken, expiresIn } = tokenData;
    const expireDate = new Date();
    expireDate.setSeconds(expireDate.getSeconds() + expiresIn - 60);
    const tokenStorageData = {
      AuthToken: accessToken,
      ExpiresAfter: expireDate,
      IdToken: idToken,
    };
    Object.entries(tokenStorageData).forEach(([key, value]) => {
      window.localStorage.setItem(`${localStoragePrefix}_${key}`, value);
    });
  };

  const phcSaveCSRFToken = () =>
    phcGetCSRFToken().then((csrfTokenData) => {
      window.sessionStorage.setItem(
        `${localStoragePrefix}_CSRFToken`,
        JSON.stringify(csrfTokenData)
      );
    });

  const phcClearTokens = () => {
    Object.keys(window.localStorage).forEach((key) => {
      // if (key.startsWith('phc-widgets')) {
      if (key.toLowerCase().includes("token")) {
        window.localStorage.removeItem(key);
      }
    });
  };

  const phcSignIn = () =>
    phcGetAuthConfiguration().then((data) => {
      const loginURLString =
        "".concat(data.signInUrl, "?") +
        "response_type=".concat(data.responseType) +
        "&scope=".concat(data.scope) +
        "&client_id=".concat(data.clientId) +
        "&redirect_uri=".concat(data.redirectUrl) +
        "&nonce=".concat(data.nonce) +
        "&state=".concat(encodeURIComponent(window.location));
      window.location.replace(loginURLString);
    });

  const phcSignOut = () =>
    phcGetAuthConfiguration().then((data) => {
      // const idToken = window.localStorage.getItem('phc-widgets_IdToken');
      const idToken = window.localStorage.getItem(
        `${localStoragePrefix}_IdToken`
      );
      const logoutURLString =
        "".concat(data.signOutUrl, "?") +
        "id_token_hint=".concat(idToken) +
        "&post_logout_redirect_uri=".concat(data.postLogoutRedirectUrl) +
        "&state=".concat(encodeURI(window.location));

      phcClearTokens();
      window.location.replace(logoutURLString);
    });

  const authenticateUser = () =>
    getCurrentUser().then((userData) => {
      if (!userData || !Object.keys(userData).length) {
        setUserData({});
      };

      setUserData(userData);
      setIsAuthenticated(true);
    });

  useEffect(() => {
    const cacheKey = sessionStorage.getItem("cachedKey");
    if (cacheKey) {
      phcGetAuthToken(cacheKey).then((tokenData) => {
        phcSaveTokens(tokenData);
        phcSaveCSRFToken();
        authenticateUser();
        sessionStorage.removeItem("cachedKey");
      });
      window.history.replaceState(
        null,
        null,
        window.location.origin.toString()
      );
    } else {
      authenticateUser();
    }
  }, []);

  // return html`
  //   <div class="phc-user-login-container">
  //     ${!isAuthenticated &&
  //     html`<button class="phc-btn" id="phc-loginButton" onClick=${phcSignIn}>
  //       Log In
  //     </button>`}
  //     ${isAuthenticated &&
  //     html`<button class="phc-btn" id="phc-logoutButton" onClick=${phcSignOut}>
  //       Log Out
  //     </button>`}
  //   </div>
  // `;

  if (userData === null) return;
  
  return html`
  <div class="phc-user-login-container">
    ${!Object.keys(userData).length
      ? html`<button class="phc-btn" id="phc-loginButton" onClick=${phcSignIn}>Log In</button>`
      : html`<button class="phc-btn" id="phc-logoutButton" onClick=${phcSignOut}>Log Out</button>`
    }
    </div>
  `;
}
