import { html } from "../util/preactCentral.js";
import Loader from "./Loader.js";

export default function Counter({ userData }) {
  if (userData === null) return html`<${Loader} />`;
  console.log(userData);
  // if (userData === null) return html`<p>Loading...</p>`;

  return !Object.keys(userData).length ? html`<p>User Not Logged In</p>` : html`<p>${userData.user.displayName}</p>`
}