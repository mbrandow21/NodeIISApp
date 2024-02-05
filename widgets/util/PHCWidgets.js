import { render, html, useState, useEffect } from "./preactCentral.js";
import widgetsRegistry from "../widgets/index.js";
import { setUser, subscribe, getUser } from "./globalUserState.js";

const requestURL = 'https://dev.phc.events';

const authComponent = ({ component, props }) => {
  const [user, setUserState] = useState(getUser());

  useEffect(() => {
    const unsubscribe = subscribe((newUser) => {
      setUserState(newUser);
    });

    return () => unsubscribe();
  }, []);

  const updateGlobalUser = (newUserData) => {
    setUser(newUserData);
  };

  return html`<${component}
    ...${props}
    userData=${user}
    setUserData=${updateGlobalUser}
    requestURL=${requestURL}
  />`;
};

(() => {
  widgetsRegistry.forEach((widget) => {
    const { name, component } = widget;

    document.querySelectorAll(name).forEach((elem) => {
      const props = {};
      for (const attribute of elem.attributes) {
        props[attribute.name] = attribute.value;
      }

      render(html`<${authComponent} component=${component} props=${props} />`, elem);
    });
  });
})();
