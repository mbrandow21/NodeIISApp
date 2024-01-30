const express = require("express");
const router = express.Router();

const MinistryPlatformAPI = require("ministry-platform-api-wrapper");

// SERMON SERIES/FINDER WIDGETS
router.get("/series", async (req, res) => {
  try {
    const data = await MinistryPlatformAPI.request(
      "get",
      "/tables/Pocket_Platform_Sermon_Series",
      {
        $select:
          'Sermon_Series_ID, Title, Display_Title, Subtitle, Position, Pocket_Platform_Sermon_Series.Sermon_Series_Type_ID, Sermon_Series_Type_ID_Table.Sermon_Series_Type, Series_UUID, Series_Start_Date, Pocket_Platform_Sermon_Series.Congregation_ID, Congregation_ID_Table.Congregation_Name, dp_fileUniqueId AS "UniqueFileId"',
        $filter: "Status_ID = 3",
        $orderby: "Position DESC",
        $top: "1000",
        $skip: "0",
      },
      {}
    );
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});
router.get("/series/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MinistryPlatformAPI.request(
      "get",
      `/tables/Pocket_Platform_Sermon_Series/${id}`,
      {
        $select:
          'Sermon_Series_ID, Title, Display_Title, Subtitle, Position, Pocket_Platform_Sermon_Series.Sermon_Series_Type_ID, Sermon_Series_Type_ID_Table.Sermon_Series_Type, Series_UUID, Series_Start_Date, Pocket_Platform_Sermon_Series.Congregation_ID, Congregation_ID_Table.Congregation_Name, dp_fileUniqueId AS "UniqueFileId"',
      },
      {}
    );
    res.send(data[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});
router.get("/sermon-series/:seriesId", async (req, res) => {
  try {
    const { seriesId } = req.params;
    const data = await MinistryPlatformAPI.request(
      "get",
      "/tables/Pocket_Platform_Sermons",
      {
        $select:
          'Sermon_ID, Series_ID, Pocket_Platform_Sermons.Congregation_ID, Congregation_ID_Table.Congregation_Name, Pocket_Platform_Sermons.Service_Type_ID, Service_Type_ID_Table.Service_Type, Title, Subtitle, Pocket_Platform_Sermons.Description, Sermon_Date, Pocket_Platform_Sermons.Speaker_ID, Speaker_ID_Table.Display_Name, Scripture_Links, Position, Status_ID, Notes_Form_ID, Sermon_UUID, dp_fileUniqueId AS "UniqueFileId"',
        $filter: `Status_ID = 3 AND Series_ID = ${seriesId}`,
        $orderby: "Position DESC",
      },
      {}
    );
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});
router.get("/sermon/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MinistryPlatformAPI.request(
      "get",
      `/tables/Pocket_Platform_Sermons/${id}`,
      {
        $select:
          'Sermon_ID, Series_ID, Pocket_Platform_Sermons.Congregation_ID, Congregation_ID_Table.Congregation_Name, Pocket_Platform_Sermons.Service_Type_ID, Service_Type_ID_Table.Service_Type, Title, Subtitle, Pocket_Platform_Sermons.Description, Sermon_Date, Pocket_Platform_Sermons.Speaker_ID, Speaker_ID_Table.Display_Name, Scripture_Links, Position, Status_ID, Notes_Form_ID, Sermon_UUID, dp_fileUniqueId AS "UniqueFileId"',
      },
      {}
    );
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});
router.get("/sermon-links/:sermonId", async (req, res) => {
  try {
    const { sermonId } = req.params;
    const data = await MinistryPlatformAPI.request(
      "get",
      "/tables/Pocket_Platform_Sermon_Links",
      {
        $select:
          "Sermon_Link_ID, Sermon_ID, Link_Type_ID_Table.Sermon_Link_Type, Link_Type_ID, Link_URL",
        $filter: `Status_ID = 3 AND Sermon_ID = ${sermonId}`,
      },
      {}
    );
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

// PHC ARTICLES WIDGETS
router.get("/articles", async (req, res) => {
  try {
    const data = await await await MinistryPlatformAPI.request(
      "get",
      "/tables/PHC_Articles",
      {
        $select:
          "PHC_Article_ID, Title, Publish_Date, PHC_Articles.[PHC_Article_Topic_ID], PHC_Article_Topic_ID_Table.[Topic], PHC_Articles.[PHC_Author_ID], PHC_Author_ID_Table_Contact_ID_Table.[Display_Name], Body, PHC_Article_GUID",
        $filter: "PHC_Articles.[Enabled] = 1",
      },
      {}
    );
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/articles/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) res.status(400).send("Missing article id");
  try {
    const [data] = await await await MinistryPlatformAPI.request(
      "get",
      "/tables/PHC_Articles",
      {
        $select:
          "PHC_Article_ID, Title, Publish_Date, PHC_Articles.[PHC_Article_Topic_ID], PHC_Article_Topic_ID_Table.[Topic], PHC_Articles.[PHC_Author_ID], PHC_Author_ID_Table_Contact_ID_Table.[Display_Name], Body, PHC_Article_GUID",
        $filter: `PHC_Articles.[Enabled] = 1 AND PHC_Article_ID=${id}`,
      },
      {}
    );
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/article-graphic/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) res.status(400).send("Missing article id");
  try {
    const [FileData] = await MinistryPlatformAPI.request(
      "get",
      `/files/PHC_Articles/${id}`,
      { $default: "true" },
      {}
    );
    return res.redirect(
      FileData && FileData.UniqueFileId
        ? `https://my.pureheart.org/ministryplatformapi/files/${FileData.UniqueFileId}`
        : "https://www.pureheart.org/wp-content/uploads/2023/03/Welcome-Page-Header-1-scaled.jpg"
    );
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
