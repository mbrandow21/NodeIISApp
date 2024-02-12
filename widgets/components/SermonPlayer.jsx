import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import Loader from "./Loader.jsx";
import { FaPlay, FaArrowLeft } from "react-icons/fa";

const SermonPlayer = ({ returnurl, requestURL, setError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sermonLinks, setSermonLinks] = useState([]);
  const [sermon, setSermon] = useState({});
  const [seriesSermons, setSeriesSermons] = useState([]);
  const [watchURL, setWatchURL] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const sermonID = urlParams.get("id");
  const seriesID = urlParams.get("series");

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
  const getSermon = async (id) => {
    return fetch(`${requestURL}/api/widgets/sermon/${id}`)
      .then((response) => {
        if (!response.ok) {
          setError(response.json())
          return null;
        }
        return response.json()
      })
      .catch((err) => {
        console.log(err);
        setError("Something terrible happened, please try again or reach out to support.");
      });
  };
  const getSermonLinks = async (id) => {
    return fetch(`${requestURL}/api/widgets/sermon-links/${id}`)
      .then((response) => {
        if (!response.ok) {
          setError(response.json())
          return null;
        }
        return response.json()
      })
      .catch((err) => {
        console.log(err);
        setError("Something terrible happened, please try again or reach out to support.");
      });
  };
  
  useEffect(() => {
    if (!sermonID) return setError("Missing sermon ID");
    if (!seriesID) return setError("Missing series ID");
    if (!returnurl) return setError("Missing return URL");
    (async () => {
      await getSermonLinks(sermonID).then((links) => {
        // console.log(links);
        setSermonLinks(links);
        const watchLink = links.find(link => link.Link_Type_ID === 1);
        setWatchURL(watchLink ? watchLink.Link_URL : null)
      });
      await getSermon(sermonID).then((sermon) => {
        // console.log(sermon); 
        setSermon(sermon); 
      });
      await getSermons(seriesID).then((seriesList) => {
        // setSeriesSermons(seriesList)
        setSeriesSermons(seriesList.sort((a,b) => new Date(b.Sermon_Date) - new Date(a.Sermon_Date)).filter(sermon => sermon.Sermon_ID != sermonID))
        setIsLoading(false);
      })
    })();
  }, [setIsLoading]);
  
  if (isLoading) return <Loader />;

  return <>
    <div className="video-player-container">
      <ReactPlayer
          url={watchURL}
          className='video-player'
          playing={true}
          controls={true}
          light={<img src={`https://my.pureheart.org/ministryplatformapi/files/${sermon.UniqueFileId}`} alt={sermon.Title} />}
          playIcon={<FaPlay />}
        />
        {!watchURL && <h1 style={{position:"absolute",color:"#FFF",fontSize:"clamp(1rem,3vw,2rem)",textAlign:"center"}}>Video Not Yet Available. Try Again Later</h1>}
    </div>
    <div className="back-btn-container">
      <a href={`${returnurl}?series=${seriesID}`} className="back-btn"><FaArrowLeft/> Back to Series</a>
    </div>
    <div className="sermon-details">
      <div className="title-row">
        <h1>{sermon.Title === sermon.Series_Title ? sermon.Title : `${sermon.Series_Title} - ${sermon.Title}`}</h1>
        <div className="sermon-links-container">
          {sermonLinks
            .filter(link => link.Link_Type_ID !== 1)
            .sort((a,b) => a.Sermon_Link_Type < b.Sermon_Link_Type ? -1 : a.Sermon_Link_Type > b.Sermon_Link_Type ? 1 : 0)
            .map((link, i) => 
              <a href={link.Link_URL} target="_blank" key={i}>{link.Sermon_Link_Type}</a>
            )}
          <a href={null} onClick={() => share('Share Series', 'Check out this sermon from Pure Heart Church!')}>Share</a>
        </div>
      </div>
      <p>{sermon.Display_Name} - {formatDate(sermon.Sermon_Date)}</p>
      {sermon.Description && <p>{HTMLToText(sermon.Description)}</p>}
      {seriesSermons && seriesSermons.length > 0 && <>
        <h3>Other sermons from this series:</h3>
        <div className="other-sermons" style={seriesSermons.length >= 3 ? {justifyContent:"center"} : null}>
          {seriesSermons.map((sermon,i) => 
            <a href={`?series=${sermon.Series_ID}&id=${sermon.Sermon_ID}`} key={i}>
              <img src={`https://my.pureheart.org/ministryplatformapi/files/${sermon.UniqueFileId}`} alt={sermon.Title} />
              <div className="sermon-image-overlay">
                  <h1>{sermon.Title}</h1>
                  <p>{sermon.Display_Name}</p>
                  <p>{formatDate(sermon.Sermon_Date)}</p>
              </div>
            </a>
          )}
        </div>
      </>}
    </div>
  </>
}

export default SermonPlayer;