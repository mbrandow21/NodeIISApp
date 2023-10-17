const express = require('express');
const router = express.Router();
const socketSingleton = require('../middleware/socketSingleton.js');
const io = socketSingleton.getIo();
const MinistryPlatformAPI = require('ministry-platform-api-wrapper');

const { authorizeWebsocket } = require('../middleware/keyAuth.js');

//home page
router.post('/update', authorizeWebsocket, async (req, res) => {
  const { id } = req.body;
  const [ticket] = await MinistryPlatformAPI.request('get', `/tables/IT_Help_Tickets/${id}`, {"$select":"IT_Help_Tickets.IT_Help_Ticket_ID, IT_Help_Tickets.Request_Date, IT_Ticket_Request_Method_ID_Table.Ticket_Request_Method, Tag_Table.Tag, IT_Help_Tickets.Status, IT_Help_Tickets.Resolve_Date, Status_Table.Status AS Status_Name, Agent_Table.First_Name AS Agent, Ticket_Requestor_Table.Display_Name AS Requestor, IT_Help_TIckets.Request_Title, IT_Help_TIckets.Description, Priority_Table.Priority"}, {});

  // Emit the message to all clients connected to the '/tickets' namespace
  io.of('/tickets').emit('ticketUpdate', ticket);

  res.send('Message sent to ticketUpdate!');
})

module.exports = router;