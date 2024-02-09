import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import Loader from "./Loader.jsx";

const SermonPlayer = ({ requestURL, setError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sermonLinks, setSermonLinks] = useState([]);
  const [sermon, setSermon] = useState({});
  const [watchURL, setWatchURL] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const sermonID = urlParams.get("id");

  const getSermon = async (id) => {
    return fetch(`${requestURL}/api/widgets/sermon/${id}`)
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
  const getSermonLinks = async (id) => {
    return fetch(`${requestURL}/api/widgets/sermon-links/${id}`)
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
    (async () => {
      await getSermonLinks(sermonID).then((links) => {
        console.log(links);
        setSermonLinks(links);
        setWatchURL(links.find(link => link.Link_Type_ID === 1).Link_URL)
      });
      await getSermon(sermonID).then((sermon) => {
        console.log(sermon); 
        setSermon(sermon); 
        setIsLoading(false);
      });
    })();
  }, [setIsLoading]);

  if (isLoading) return <Loader />;

  console.log(sermonLinks.find(link => link.Link_Type_ID === 1).Link_URL)
  return <>
    {watchURL && <ReactPlayer
        url={watchURL}
        className='react-player'
        // playing={true}
        controls={true}
        width='100%'
        height='100%'
      />}
  </>
    
  const url = 'https://pocketplatform-media.s3.amazonaws.com/Pure+Heart+Church/Tasks/2e2c327c-b209-4954-b743-2de963cde56f/hls/master.m3u8';
  return (
    <div className='player-wrapper'>
      <ReactPlayer
        url={url}
        className='react-player'
        playing={fjal}
        controls={true}
        width='100%'
        height='100%'
      />
    </div>
  );
}

export default SermonPlayer;