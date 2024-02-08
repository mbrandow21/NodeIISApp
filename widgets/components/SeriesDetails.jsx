import React, { useState, useEffect } from 'react';
import Loader from "./Loader.jsx";

import { FaArrowLeft, FaArrowRight  } from "react-icons/fa";

const SeriesDetails = ({ requestURL, targeturl, setError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [series, setSeries] = useState({});
  
  const urlParams = new URLSearchParams(window.location.search);
  const seriesID = urlParams.get("id");

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
  
  useEffect(() => {
    if (!targeturl) setError("Missing target URL");
    if (!seriesID) setError("Missing series ID");
    getSeries(seriesID).then((series) => {
      console.log(series);
      setSeries(series);

      setIsLoading(false);
    });
  }, [setIsLoading, setSeries]);

  if (isLoading) return <Loader />;

  return (
    <>
      <div id="back-btn-container">
        <a href="/seriesfinder" className="back-btn"><FaArrowLeft/> Back to Series Finder</a>
      </div>
      <div id="widget-card-container">
        <div id="series-head-row">
          <a href="/seriesdetails?id=99"><FaArrowLeft/> Previous Series</a>
        <h1 id="series-title">Attitude Adjustment</h1>
        <a href="/seriesdetails?id=101">Next Series <FaArrowRight/></a>
      </div>
      <div id="series-row">
        <div id="sermon-image-container">
          <img src="https://my.pureheart.org/ministryplatformapi/files/294c8f8a-bc2a-47ef-a76d-5cd98a661d5c" alt="Attitude Adjustment" />
          <div id="series-info-row">
            <p><strong>4 week series</strong></p>
            <p>Nov 5, 2022 - Nov 26, 2022</p>
            <button id="shareBtn" onclick="share('Share Series', 'Check out this series from Pure Heart Church!')">Share</button>
          </div>
        </div>
          <div id="sermon-content">
            <a className="messages" href="/sermondetails?series=100&amp;id=332">
              <img src="https://my.pureheart.org/ministryplatformapi/files/ffb73672-297d-4ba6-85d2-4080f065ee74" alt="What Good Could Come From This?" />
              <div className="sermon-info">
                <p className="sermon-title">What Good Could Come From This?</p>
                <p>Nov 5, 2022 | Dan Steffen</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default SeriesDetails;