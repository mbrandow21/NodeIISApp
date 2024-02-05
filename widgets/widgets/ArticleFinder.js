import { html, useState, useEffect } from "../util/preactCentral.js";
import Loader from "./Loader.js";

export default function ArticleFinder({ requestURL, targeturl }) {
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);

  if (!targeturl) setError("Missing target URL");

  const [articleTopics, setArticleTopics] = useState({});
  const [selectedTopicID, setSelectedTopicID] = useState(0);
  
  const [authors, setAuthors] = useState({});
  const [selectedAuthorGuid, setSelectedAuthorGuid] = useState(0);

  const [keywordSearch, setKeywordSearch] = useState('');

  const sortOptions = [
    {
      label: 'Newest to Oldest',
      sortFunc: (a,b) => new Date(b.Publish_Date) - new Date(a.Publish_Date)
    },
    {
      label: 'Oldest to Newest',
      sortFunc: (a,b) => new Date(a.Publish_Date) - new Date(b.Publish_Date)
    },
    {
      label: 'A-Z',
      sortFunc: (a,b) => a.Title < b.Title ? -1 : a.Title > b.Title ? 1 : 0
    },
    {
      label: 'Z-A',
      sortFunc: (a,b) => a.Title < b.Title ? 1 : a.Title > b.Title ? -1 : 0
    },
    {
      label: 'Random',
      sortFunc: () => Math.random() - 0.5
    }
  ];
  const [selectedSortOption, setSelectedSortOption] = useState(0);


  const getArticles = async () => {
    return fetch(`${requestURL}/api/widgets/articles`)
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
    getArticles().then((articles) => {
      // console.log(articles);
      setArticles(articles);

      // Save set of all article topics
      articles.forEach(article => {
        const { PHC_Article_Topic_ID: id, Topic } = article;
        if (!articleTopics[id]) setArticleTopics(x => ({...x, [id]: Topic}));

        const { Author_Contact_GUID: guid, Author_Name } = article;
        if (!authors[guid]) setAuthors(x => ({...x, [guid]: Author_Name}));
      });

      setIsLoading(false);
    });
  }, [setIsLoading, setArticles]);

  // useEffect(() => console.log(keywordSearch === ''), [keywordSearch]);

  if (error)
    return html`
      <div class="error-message">
        <h2 style="text-align:center; margin: .5rem 0;">Error</h2>
        <p style="text-align:center; margin: 0;">${error}</p>
      </div>
    `;
  
  return isLoading
    ? html`<${Loader} />`
    : html`
      <div class="article-filters">
        <div class="filter-option">
          <input type="text" id="keyword" value=${keywordSearch} onInput=${(e) => setKeywordSearch(e.target.value)}/>
          <label for="keyword">Keyword</label>
        </div>


        <div class="filter-option">
          <select id="topic" value=${selectedTopicID} onChange=${(e) => setSelectedTopicID(parseInt(e.target.value))}>
            <option value="0" selected>All Topics</option>
            ${Object.entries(articleTopics).map(([key, value]) => {
              return html`
                <option value=${key}>${value}</option>
              `
            })}
          </select>
          <label for="topic">Topic</label>
        </div>
          
        <div class="filter-option">
          <select class="author" defaultValue="0" value=${selectedAuthorGuid} onChange=${(e) => setSelectedAuthorGuid(e.target.value)}>
            <option value="0" selected>All Authors</option>
            ${Object.entries(authors).map(([key, value]) => {
              return html`
                <option value=${key}>${value}</option>
              `
            })}
          </select>
          <label for="author">Author</label>
        </div>

        <div class="filter-option">
          <select class="sort-order" value=${selectedSortOption} onChange=${(e) => setSelectedSortOption(parseInt(e.target.value))}>
            ${sortOptions.map((sortOption, i) => {
              return html`
                <option value=${i}>${sortOption.label}</option>
              `
            })}
          </select>
          <label for="sort-order">Sort Order</label>
        </div>
        



      </div>
      <div class="article-card-container">
        ${articles
          .filter(article => (selectedTopicID == 0 || article.PHC_Article_Topic_ID === selectedTopicID) && (selectedAuthorGuid == 0 || article.Author_Contact_GUID === selectedAuthorGuid) && (article.Title.toLowerCase().includes(keywordSearch.toLowerCase())))
          .sort(sortOptions[selectedSortOption].sortFunc)
          .map((article) => {
            const { PHC_Article_ID, Title, Author_Name, Topic, Body } = article;
            const plainTextBody = HTMLToText(Body);
            const wordCount = plainTextBody.split(/\s+|[\r\n]+/).length;
            const averageWPM = 238;
            const readTime = Math.ceil(wordCount / averageWPM);
            return html`
              <a class="article-card" href="${targeturl}?id=${PHC_Article_ID}">
                <div class="background-image-container">
                  <img
                    src="${requestURL}/api/widgets/article-graphic/${PHC_Article_ID}"
                    alt="${Title}"
                  />
                </div>
                <div class="article-card-content">
                  <p>${Topic}</p>
                  <h1>${Title}</h1>
                  <p>${Author_Name}</p>
                  <p class="read-time">${readTime} Mins</p>
                </div>
              </a>
            `;
          })
        }
      </div>
    `
}
