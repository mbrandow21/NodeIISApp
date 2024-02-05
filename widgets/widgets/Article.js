import { html, useState, useEffect } from "../util/preactCentral.js";
import Loader from "./Loader.js";

export default function Article({ requestURL }) {
  const [isLoading, setIsLoading] = useState(true);
  const [article, setArticle] = useState({});
  const [error, setError] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const articleID = urlParams.get("id");

  const getArticle = async (id) => {
    if (!id) {
      setError("Missing Aritcle ID")
      return null;
    };
    return fetch(`${requestURL}/api/widgets/articles/${articleID}`)
      .then((response) => {
        if (!response.ok) {
          setError(response.json())
          return null;
        }
        return response.json()
      })
      .catch(() => {
        setError(
          "Something terrible happened, please try again or reach out to support."
        );
      });
  };

  const HTMLToText = (html) => {
    if (!html) return '';
    html = html.replace(/<style([\s\S]*?)<\/style>/gi, '');
    html = html.replace(/<script([\s\S]*?)<\/script>/gi, '');
    html = html.replace(/<\/div>/ig, '\n');
    html = html.replace(/<\/li>/ig, '\n');
    html = html.replace(/<li>/ig, '  *  ');
    html = html.replace(/<\/ul>/ig, '\n');
    html = html.replace(/<\/p>/ig, '\n');
    html = html.replace(/<br\s*[\/]?>/gi, "\n");
    html = html.replace(/<[^>]+>/ig, '');
    return html;
  }

  useEffect(() => {
    getArticle(articleID).then((article) => {
      setArticle(article);
      setIsLoading(false);
    });
  }, []);

  if (error)
    return html`
      <div class="error-message">
        <h2 style="text-align:center; margin: .5rem 0;">Error</h2>
        <p style="text-align:center; margin: 0;">${error}</p>
      </div>
    `;

  const {
    PHC_Article_ID,
    Title,
    Author_Name,
    Author_Bio,
    Body,
    Topic,
    Publish_Date,
    Author_Contact_GUID,
    Author_Facebook_Account,
    Author_Instagram_Account,
    Author_Twitter_Account
  } = article;
  const readTime = Math.ceil(HTMLToText(Body).split(/\s+|[\r\n]+/).length / 238);
  return isLoading
    ? html`<${Loader} />`
    : article &&
        html`
          <div class="article-card large">
            <div class="background-image-container">
              <img
                src="${requestURL}/api/widgets/article-graphic/${PHC_Article_ID}"
                alt="${Title}"
              />
            </div>
            <div class="article-card-content">
              <h1>${Title}</h1>
              <p class="left">${Topic}</p>
              <p class="right">${new Date(Publish_Date).toLocaleDateString('en-us', {month: 'short', day: 'numeric', year: 'numeric'})}</p>
              <p class="read-time">${readTime} Mins</p>
            </div>
          </div>
          <div
            class="article-content"
            dangerouslySetInnerHTML=${{ __html: Body }}
          ></div>
          <div class="author-container">
            <div class="author-content">
              <img
                class="author-pfp"
                src="${requestURL}/api/widgets/author-graphic/${Author_Contact_GUID}"
              />
              <h2 class="author-name">${Author_Name}</h2>
            </div>
            <div class="author-bio">
              <p dangerouslySetInnerHTML=${{ __html: Author_Bio }}></p>
              <div class="author-socials">
                ${Author_Facebook_Account && html`<a href="#" target="_blank" style="color: #1877F2;"><i class="fa fa-facebook-square"></i></a>`}
                ${Author_Instagram_Account && html`<a href="#" target="_blank"><i class="fa fa-instagram" style="color: #d62976;"></i></a>`}
                ${Author_Twitter_Account && html`<a href="#" target="_blank"><i class="fa fa-twitter-square" style="color: #1DA1F2;"></i></a>`}
              </div>
            </div>
          </div>
        `;
}
