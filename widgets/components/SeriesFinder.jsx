import React, { useState, useEffect } from 'react';
import Loader from "./Loader.jsx";

const SeriesFinder = ({ requestURL, targeturl, setError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [seriesList, setSeriesList] = useState([]);

  const getSeries = async () => {
    return fetch(`${requestURL}/api/widgets/series`)
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
  
  useEffect(() => {
    if (!targeturl) setError("Missing target URL");
    getSeries().then((series) => {
      console.log(series);
      setSeriesList(series);

      setIsLoading(false);
    });
  }, [setIsLoading, setSeriesList]);


  return <div className="series-card-container">
    {seriesList.map((series, i) => {
      const { Sermon_Series_ID, UniqueFileId, Title } = series;
      return (
        <div className="series">
          {i === 0 && (
            <div className="series-banner">
              <p>Current Series</p>
              <a href={`${targeturl}?id=${Sermon_Series_ID}`}>Watch Latest Sermon</a>
            </div>
          )}
          <a className="series-image-container" tabIndex={-1} href={`${targeturl}?id=${Sermon_Series_ID}`}>
            <img src={`https://my.pureheart.org/ministryplatformapi/files/${UniqueFileId}`} alt={Title} />
          </a>
          <a className="view-more-link" href={`${targeturl}?id=${Sermon_Series_ID}`}>View More</a>
        </div>
      )
    })}
  </div>
    
}

export default SeriesFinder;