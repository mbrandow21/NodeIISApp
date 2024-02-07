import React, { useState, useEffect } from 'react';
import Loader from "./Loader.jsx";

const ArticleFinder = ({ requestURL, targeturl, setError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  // const [error, setError] = useState(null);

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
      label: 'Most Popular',
      sortFunc: (a,b) => b.Views - a.Views
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
        setError("Something terrible happened, please try again or reach out to support.");
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
    if (!targeturl) setError("Missing target URL");
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
  
  return isLoading
    ? <Loader />
    : (
      <>
        <div className="article-filters">
          <div className="filter-option">
            <input type="text" id="keyword" value={keywordSearch} onInput={(e) => setKeywordSearch(e.target.value)}/>
            <label htmlFor="keyword">Keyword</label>
          </div>


          <div className="filter-option">
            <select id="topic" value={selectedTopicID} onChange={(e) => setSelectedTopicID(parseInt(e.target.value))}>
              <option value="0">All Topics</option>
              {Object.entries(articleTopics).map(([key, value], i) => {
                return <option value={key} key={i}>{value}</option>
              })}
            </select>
            <label htmlFor="topic">Topic</label>
          </div>
            
          <div className="filter-option">
            <select className="author" value={selectedAuthorGuid} onChange={(e) => setSelectedAuthorGuid(e.target.value)}>
              <option value="0">All Authors</option>
              {Object.entries(authors).map(([key, value], i) => {
                return <option value={key} key={i}>{value}</option>
              })}
            </select>
            <label htmlFor="author">Author</label>
          </div>

          <div className="filter-option">
            <select className="sort-order" value={selectedSortOption} onChange={(e) => setSelectedSortOption(parseInt(e.target.value))}>
              {sortOptions.map((sortOption, i) => {
                return <option value={i} key={i}>{sortOption.label}</option>
              })}
            </select>
            <label htmlFor="sort-order">Sort Order</label>
          </div>
        </div>
        <div className="article-card-container">
          {articles
            .filter(article => (selectedTopicID == 0 || article.PHC_Article_Topic_ID === selectedTopicID) && (selectedAuthorGuid == 0 || article.Author_Contact_GUID === selectedAuthorGuid) && (article.Title.toLowerCase().includes(keywordSearch.toLowerCase())))
            .sort(sortOptions[selectedSortOption].sortFunc)
            .map((article) => {
              const { PHC_Article_ID, Title, Author_Name, Topic, Body } = article;
              const plainTextBody = HTMLToText(Body);
              const wordCount = plainTextBody.split(/\s+|[\r\n]+/).length;
              const averageWPM = 238;
              const readTime = Math.ceil(wordCount / averageWPM);
              return (
                <a className="article-card" href={`${targeturl}?id=${PHC_Article_ID}`} key={PHC_Article_ID}>
                  <div className="background-image-container">
                    <img
                      src={`${requestURL}/api/widgets/article-graphic/${PHC_Article_ID}`}
                      alt={Title}
                    />
                  </div>
                  <div className="article-card-content">
                    <p>{Topic}</p>
                    <h1>{Title}</h1>
                    <p>{Author_Name}</p>
                    <p className="read-time">{readTime} Mins</p>
                  </div>
                </a>
              )
            })
          }
        </div>
      </>
    )
    
}

export default ArticleFinder;