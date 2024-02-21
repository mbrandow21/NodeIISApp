import React, { useState, useEffect } from 'react';
import MinistryPlatformAPI from '../util/MinistryPlatformAPI.js';
import Loader from "./Loader.jsx";

const FeaturedEvents = ({ requestURL, targeturl, setError }) => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!targeturl) return setError('Missing target url');

    const getFeaturedEvents = () => MinistryPlatformAPI.request(requestURL, 'get', '/tables/Events', {"$select":'Event_ID,Event_Title,Event_Start_Date,Featured_Event_Custom_URL,dp_fileUniqueId AS "UniqueFileId"',"$filter":"(Event_Start_Date >= GETDATE() AND Event_Start_Date < (GETDATE() + 90)) AND (Featured_On_Calendar=1 OR Force_Featured=1)","$orderby":"Event_Start_Date"}, {})
      .then(data => data)
      .catch(() => { throw new Error('Failed to load featured events') })
    
    getFeaturedEvents()
      .then(events => {
        if (!events.length) setError('No featured events found');
        const uniqueTitles = [...new Set(...[events.map(event => event.Event_Title.toLowerCase())])];
        const uniqueEvents = uniqueTitles.map(title => events.find(event => title === event.Event_Title.toLowerCase()));
        setFeaturedEvents(uniqueEvents.filter(event => event.UniqueFileId));
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.toString());
      })
  }, [])

  return isLoading
  ? <Loader />
  : (
    <div id='events-container'>
      {featuredEvents.map(event => {
        const { Event_ID, Event_Start_Date, Event_Title, Featured_Event_Custom_URL, UniqueFileId } = event;
        const eventMonth = new Date(Event_Start_Date).toLocaleDateString('en-us', {month:'short'});
        const eventDate = new Date(Event_Start_Date).getDate();
        return (
          <a className="event-card" href={Featured_Event_Custom_URL ?? `${targeturl}/?id=${Event_ID}`} key={Event_ID}>
            <div className="event-card-img-container">
              <img src={`https://my.pureheart.org/ministryplatformapi/files/${UniqueFileId}`} alt={Event_Title}/>
            </div>
            <div className="event-card-date-label">
              <p className="date-label-month">{eventMonth}</p>
              <p className="date-label-day">{eventDate}</p>  
            </div>
            <div className="event-card-title-label">
              <p className="event-card-title">{Event_Title}</p>
            </div>
          </a>
        )
      })}
    </div>  
  )
}

export default FeaturedEvents;