const express = require('express');
const router = express.Router();

const MinistryPlatformAPI = require('ministry-platform-api-wrapper');

// router.get('/tickets', async (req, res) => {
//   try {
//     let count = 0;
//     let results = [];
//     let hasMoreData = true;
    
//     while (hasMoreData) {
//       const data = await MinistryPlatformAPI.request('get', '/tables/IT_Help_Tickets', {"$select":"IT_Help_Tickets.IT_Help_Ticket_ID, IT_Help_Tickets.Request_Date, IT_Ticket_Request_Method_ID_Table.Ticket_Request_Method, Tag_Table.Tag, IT_Help_Tickets.Status, IT_Help_Tickets.Resolve_Date, Status_Table.Status AS Status_Name, Agent_Table.First_Name AS Agent, Ticket_Requestor_Table.Display_Name AS Requestor, IT_Help_TIckets.Request_Title, IT_Help_TIckets.Description, Priority_Table.Priority","$filter":"IT_Help_Tickets.Status != 4 AND (IT_Help_Tickets.Request_Date > GETDATE() - 30 OR IT_Help_Tickets.Resolve_Date > GETDATE() - 30)","$orderby":"Request_Date DESC"}, {});
//       if (data.length < 1000) hasMoreData = false;
//       results = results.concat(data);
//       count += 1000;
//     }
//     res.send(results);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send('Internal server error');
//   }
// });
router.get('/tickets', async (req, res) => {
  try {    
    const [data] = await MinistryPlatformAPI.request('post', '/procs/api_Widget_HelpdeskTickets', {}, {});
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal server error');
  }
});

router.get('/ticket-tags', async (req, res) => {
  try {
    const data = await MinistryPlatformAPI.request('get', '/tables/Helpdesk_Tags', {}, {});
    res.send(data);
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

router.get('/ticket-methods', async (req, res) => {
  try {
    const data = await MinistryPlatformAPI.request('get', '/tables/IT_Ticket_Request_Methods', {}, {});
    res.send(data);
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

router.get('/tickets-by-team', async (req, res) => {
  try {
    const { daysBack = 30 } = req.query;
    const [data] = await MinistryPlatformAPI.request('post', '/procs/PHCGetMinistriesTickets', {}, {"@daysBack":daysBack});
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal server error');
  }
})

module.exports = router;