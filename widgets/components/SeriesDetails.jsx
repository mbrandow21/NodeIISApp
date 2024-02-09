import React, { useState, useEffect } from 'react';
import Loader from "./Loader.jsx";

import { FaArrowLeft, FaArrowRight  } from "react-icons/fa";

const SeriesDetails = ({ returnurl, targeturl, requestURL, setError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [series, setSeries] = useState({});
  const [messages, setMessages] = useState([]);
  
  const urlParams = new URLSearchParams(window.location.search);
  const seriesID = urlParams.get("series");

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-us', {month: 'short', day: 'numeric', year: 'numeric'})
  }

  const share = (title, text) => {
    if (navigator.share) {
      navigator.share({
      title: title,
      text: text,
      url: window.location,
      });
    } else {
      window.location = `mailto:?subject=${title}&body=${text}: ${window.location}`
    }
  }

  const getSeries = async (id) => {
    return fetch(`${requestURL}/api/widgets/series/${id}`)
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

  const getSermons = async (id) => {
    return fetch(`${requestURL}/api/widgets/sermon-series/${id}`)
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
  }
  
  useEffect(() => {
    if (!targeturl) return setError("Missing target URL");
    if (!returnurl) return setError("Missing return URL");
    if (!seriesID) return setError("Missing series ID");
    (async () => {
      await getSeries(seriesID).then((series) => {
        // console.log(series);
        setSeries(series);
  
      });
      await getSermons(seriesID).then((messages) => {
        // console.log(messages);
        setMessages(messages)
        setIsLoading(false);
      })

    })();
  }, [setIsLoading, setSeries]);

  if (isLoading) return <Loader />;

  return (
    <>
      <div className="back-btn-container">
        <a href={returnurl} className="back-btn"><FaArrowLeft/> Back to Series Finder</a>
      </div>
      <div className="series-details-container">
        <div className="series-head-row">
          <a href={`${returnurl}?id=99`}><FaArrowLeft/> Previous Series</a>
          <h1 className="series-title">{series.Title}</h1>
          <a href={`${returnurl}?id=99`}>Next Series <FaArrowRight/></a>
        </div>
        <div className="series-row">
          <div className="sermon-image-container">
            <img src={`https://my.pureheart.org/ministryplatformapi/files/${series.UniqueFileId}`} alt={series.Title} />
            <div className="series-info-row">
              <p><strong>{messages.length} week series</strong></p>
              <p>{formatDate(messages[0].Sermon_Date)} - {formatDate(messages.at(-1).Sermon_Date)}</p>
              <button id="shareBtn" onClick={() => share('Share Series', 'Check out this series from Pure Heart Church!')}>Share</button>
            </div>
          </div>
          <div className="sermon-content">
            {messages.map(message => {
              const { Sermon_ID, Series_ID, Title, UniqueFileId, Sermon_Date, Display_Name } = message;
              return <a className="messages" href={`${targeturl}?series=${Series_ID}&id=${Sermon_ID}`} key={Sermon_ID}>
                <img src={`https://my.pureheart.org/ministryplatformapi/files/${UniqueFileId ?? series.UniqueFileId}`} alt={Title} />
                <div className="sermon-info">
                  <p className="sermon-title">{Title}</p>
                  <p>{formatDate(Sermon_Date)} | {Display_Name}</p>
                </div>
              </a>
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default SeriesDetails;