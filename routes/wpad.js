const express = require('express');
const router = express.Router();

const MinistryPlatformAPI = require('ministry-platform-api-wrapper');

router.get('/getSchedules', async (req, res) => {
  await MinistryPlatformAPI.request('get', '/tables/Prayer_Schedules', {"$select":"Prayer_Schedule_ID, Prayer_Schedules.[Start_Date], Prayer_Schedules.[End_Date], Prayer_Schedules.[WPAD_Community_ID], WPAD_Community_ID_Table.[Community_Name]","$filter":`Prayer_Schedules.[Start_Date] BETWEEN '${startDate}' AND '${endDate}' AND Cancelled=0`,"$orderby":"Start_Date"}, {})
})

module.exports = router;