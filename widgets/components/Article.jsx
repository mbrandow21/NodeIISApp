import React, { useState, useEffect } from 'react';
import Loader from "./Loader.jsx";

import { FaFacebookSquare, FaInstagramSquare, FaTwitterSquare } from "react-icons/fa";

const Article = ({ requestURL, setError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [article, setArticle] = useState({});

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
    ? <Loader />
    : article && (
      <>
        <div className="article-card large">
          <div className="background-image-container">
            <img
              src={`${requestURL}/api/widgets/article-graphic/${PHC_Article_ID}`}
              alt={Title}
            />
          </div>
          <div className="article-card-content">
            <h1>{Title}</h1>
            <p className="left">{Topic}</p>
            <p className="right">{new Date(Publish_Date).toLocaleDateString('en-us', {month: 'short', day: 'numeric', year: 'numeric'})}</p>
            <p className="read-time">{readTime} Mins</p>
          </div>
        </div>
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: Body }}
        ></div>
        <div className="author-container">
          <div className="author-content">
            {Author_Contact_GUID && <div className="author-pfp-container" style={{backgroundImage:`URL(${requestURL}/api/widgets/author-graphic/${Author_Contact_GUID})`}}></div>}
            <h2 className="author-name">{Author_Name}</h2>
          </div>
          <div className="author-bio">
            <p dangerouslySetInnerHTML={{ __html: Author_Bio }}></p>
            <div className="author-socials">
              {Author_Facebook_Account && <a href={`${Author_Facebook_Account}`} target="_blank" style={{color: "#1877F2"}}><FaFacebookSquare /></a>}
              {Author_Instagram_Account && <a href={`${Author_Instagram_Account}`} target="_blank" style={{color: "#d62976"}}><FaInstagramSquare /></a>}
              {Author_Twitter_Account && <a href={`${Author_Twitter_Account}`} target="_blank" style={{color: "#1DA1F2"}}><FaTwitterSquare /></a>}
            </div>
          </div>
        </div>
      </>
    );
}
export default Article;