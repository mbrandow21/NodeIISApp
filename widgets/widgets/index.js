import Counter from "./Counter.js";
import PHCLogin from "./PHCLogin.js";
import ArticleFinder from "./ArticleFinder.js";
import Article from "./Article.js";

export default [
  {
    name: "counter",
    component: Counter,
  },
  {
    name: "phc-user-login",
    component: PHCLogin,
  },
  {
    name: "phc-article-finder",
    component: ArticleFinder,
  },
  {
    name: "phc-article",
    component: Article,
  },
];
