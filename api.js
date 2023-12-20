import express, { response } from "express";
import * as database from "./projectdb.js";
import bodyParser from "body-parser";
import _ from "lodash";
import cors from "cors";


const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET,PUT,PATCH,POST,DELETE, OPTIONS"],
  preflightContinue: true,
  allowedHeaders: [],
  exposedHeaders: [],
  credentials: true,
};

const port = 3000;
//app.use(bodyParser.json());
app.use( cors());

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));



// let projectTree = [];
// let projectNodes = [];
let projArr = [];
let treeData;
let myProject;
let debug = false;

//-----------------------------------------------------------------------------------
async function refreshProject() {

  //console.log("refresh project")  
  let resp = await database.findDocument(null, database.PROJECT);
  if (resp !== null) {
    
    //xconsole.log("pppppppp", resp);
    let myProjArr = [];
    treeData = null;

    for( let i = 0; i < resp.docs.length; i++ ) {
        const val = await processChildren(resp.docs[i]);
        myProjArr = myProjArr.concat(val);
    }

    //console.log("xxxxxxx", myProjArr);
    let mytreeData = transformToTree(myProjArr);
    //console.log("yyyyyyy", JSON.stringify(mytreeData, null, 2));

    debugLogger(JSON.stringify(treeData, null, 2));
    treeData = mytreeData
    return mytreeData;

  } else {
    debugLogger("Database failed to load");
  }
}

//-----------------------------------------------------------------------------------
await database.createIndex();
console.log("Create Index");
await refreshProject();

//await database.closeDatabase();   move to exit app function

//-----------------------------------------------------------------------------------
// recursively loads the tree
async function processChildren(doc) {
   
    //console.log("\n-----------------------------------------------")
    //console.log("ProcessChildren: ", doc.name);
    let myProjArr = [];


  if (doc !== null) {
    let children = await database.getChildFolders(doc._id, null);
    let results = await database.getResultCount(doc);

    let newRow;
    if (doc.type == "project") {
      newRow = {
        id: doc._id,
        rev: doc._rev,
        parent: doc.parent,
        projectId: doc.projectId,
        name: doc.name,
        type: doc.type,
        ancestors: doc.ancestors,
        settings: doc.settings,
        numResults: results.docs.length,
      };
      myProjArr.push(newRow);
    }
    if (doc.type == "folder") {
      newRow = {
        id: doc._id,
        rev: doc._rev,
        parent: doc.parent,
        projectId: doc.projectId,
        name: doc.name,
        type: doc.type,
        ancestors: doc.ancestors,
        numResults: results.docs.length,
      };
      myProjArr.push(newRow);
    }
    if (children.docs.length == 0) {
      //debugLogger("no children to process");
      return myProjArr;
    }
    for (const element of children.docs) {
      myProjArr = myProjArr.concat(await processChildren(element));
    }
  } else {
    console.log("Database failed to load");
  }
  return myProjArr;
}

//-----------------------------------------------------------------------------------
function transformToTree(arr) {
  let nodes = {};

  return arr.filter(function (obj) {
    let id = obj["id"],
      parentId = obj["parent"];

    nodes[id] = _.defaults(obj, nodes[id], { children: [] });
    nodes[parentId] = nodes[parentId] || { children: [] };

    parentId && nodes[parentId]["children"].push(obj);

    return !parentId;
  });
}

//-----------------------------------------------------------------------------------
// Helper functions
//-----------------------------------------------------------------------------------
// validate project object name has no illegal characters and is within the max length req

//-----------------------------------------------------------------------------------
// API Endpoints
//-----------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------
// GENERAL
//-----------------------------------------------------------------------------------
// get a document ancestor path for breadcrumbs  - requires a document id, returns an array of objects  { id, name, alias, type}

// rename a document - requires a document id
// verify the name meets name requirement
// requires additional processing if the document is a project
// delete project document - requires document id
// database.deleteDoc( "76dc72be-8394-407e-943f-699f99f33356" );



//-----------------------------------------------------------------------------------
// Application Settings
//-----------------------------------------------------------------------------------
//  GET ALL PROJECTS
app.get("/api/v1/appsettings", cors(corsOptions), async (req, res) => { 

    debugLogger("get:/api/v1/appsettings");

    database
      .getDocumentId( database.APP_SETTINGS, res )
      .then((response) => {
        debugLogger("Received response getDocumentId: " + response);
      })
      .catch((response) => {
        console.log("Received Error getDocumentId: " + response);
      });

    
  });



  app.patch("/api/v1/appsettings", cors(corsOptions), (req, res) => {
    
    debugLogger(" patch:/api/v1/appsettings");

    let document = req.body;
    _.set(document, "_id", database.APP_SETTINGS );

    //console.log( document );

    database
    .updateDocument(document, res)
    .then((response) => {
        debugLogger("Received response updateDocument: " + response);
    })
    .catch((response) => {
        console.log("Received Error updateDocument: " + response);
    });

});



//-----------------------------------------------------------------------------------
// PROJECT
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
//  GET ALL PROJECTS
app.get("/api/v1/project", cors(corsOptions), async (req, res) => {
    
    debugLogger(" patch:/api/v1/project");
    // verify project name
    // use the name to get to the correct database
    await refreshProject();
    res.send(treeData);
  });
  

//-----------------------------------------------------------------------------------
  app.get("/api/v1/project/info/:id", cors(corsOptions), (req, res) => {
    // verify project name
    // use the name to get to the correct database
    debugLogger("create project called ",  req.body);
    
    database
      .getDocumentId(req.params.id, res)
      .then((response) => {
        debugLogger("Received response getDocumentId: " + response);
      })
      .catch((response) => {
        console.log("Received Error getDocumentId: " + response);
      });



  });




//-----------------------------------------------------------------------------------
//  ADD PROJECT - need name, parentId and projectId
//
// { 
//     "name"   : "project name"
// }
app.post("/api/v1/project", cors(corsOptions), (req, res) => {
    // verify project name
    // use the name to get to the correct database
    debugLogger("create project called ",  req.body);
    
    database
    .createProject(req.body.name, res)
    .then((response) => {
        debugLogger("Received response createProject:", response);
    })
    .catch((response) => {
        debugLogger("Received Error createproject:" , response);
    });



  });
  

//-----------------------------------------------------------------------------------
//  DELETE PROJECT - need id and rev
// { 
//     "name" : "My new Project C",
//     "_id" :  "bb97fde0-2f03-4dec-a9b2-253b272137e1",
//     "_rev" : "1-241149ee90c4ac95205bcceac5c631b4"
// }
app.delete("/api/v1/project", cors(corsOptions), (req, res) => {
    // verify project name
    // use the name to get to the correct database
    console.log("delete project called " , req.body.name, req.body._id);

    database.deleteDocId( req.body._id, req.body._rev, res  ).then((response) => {
        console.log("Received delete project: ",  response);
    })
    .catch((response) => {
        console.log("Received Error delete project: $(response)");
        // res.send(response);
    }) 
  });


//-----------------------------------------------------------------------------------
//  UPDATE PROJECT
app.patch("/api/v1/project/:name", cors(corsOptions), (req, res) => {
    debugLogger("rename project id  " + req.params.name);

  //get the old name from the paramters or body

  let resp = "Update Project: " + data.name;
  debugLogger(resp);
  debugLogger(req.body);
  res.send(resp);
});

//-----------------------------------------------------------------------------------
app.patch("/api/v1/update", cors(corsOptions), (req, res) => {
    
    debugLogger(" patch:/api/v1/update");
    let document = req.body;
    //_.set(document, "_id", database.APP_SETTINGS );
    
    console.log( "UPDATE", document );

    database
    .updateDocument(document, res)
    .then((response) => {
        debugLogger("Received response updateDocument: " + response);
    })
    .catch((response) => {
        console.log("Received Error updateDocument: " + response);
    });

});




//-----------------------------------------------------------------------------------
// FOLDER need projectId, ParentId, name
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
//  GET FOLDER
app.get("/api/v1/project/:name/folder/:folderId",
  cors(corsOptions),
  (req, res) => {
    // verify project name & folder
    
    let resp =
      "get project called " +
      req.params.name +
      " folder Id: " +
      req.params.folderId;
      debugLogger(resp);
    database
      .getDocumentId(req.params.folderId, res)
      .then((response) => {
        debugLogger("Received response getDocumentId: " + response);
      })
      .catch((response) => {
        console.log("Received Error getDocumentId: " + response);
      });
  }
);

//-----------------------------------------------------------------------------------
//  ADD FOLDER - need name, parentId, and projectId
//
// { 
//     "name" : "folderName",
//     "parentId" : "bc75be2f-bc1d-42b2-81dc-32fc41776a94",
//     "projectId" : "bc75be2f-bc1d-42b2-81dc-32fc41776a94"
// }
//
app.post("/api/v1/project/folder", cors(corsOptions), (req, res) => {
  // use the name to get to the correct database

  console.log( req.body );
  let data = req.body;
  let resp  =  "New Folder Created: " + data.name + " Parent " + data.parentId+ " in project " + data.projectId;
  debugLogger(resp);

  database
    .addProjectFolder(data.name, data.parentId, data.projectId, res)
    .then((response) => {
        debugLogger("Received response addProjectFolder: " + response);
    })
    .catch((response) => {
        console.log("Received Error addProjectFolder: " + response);
    });
});

//-----------------------------------------------------------------------------------
//  DELETE FOLDER - need id and rev
//{ 
//     "name" : "Job-005",
//     "parentId" : "bc75be2f-bc1d-42b2-81dc-32fc41776a94",
//     "_id" :  "bb97fde0-2f03-4dec-a9b2-253b272137e1",
//     "_rev" : "1-2cde1a9cf58babadfe91f5ca789751a7"
// }
app.delete("/api/v1/project/folder", cors(corsOptions), (req, res) => {
  

    debugLogger("delete project called " + req.body.name + "  " + req.body.id);

  database
    .deleteDocIdRev(req.body, res)
    .then((response) => {
        debugLogger("Received response: " + response);
    })
    .catch((response) => {
        console.log("Received Error: " + response);
    });
});

//-----------------------------------------------------------------------------------
// UPDATE FOLDER 
app.patch("/api/v1/project/:name/folder", cors(corsOptions), (req, res) => {
  let resp =
    "patch  folder:  " + req.body._id + " from project " + req.body._rev;
    debugLogger(resp);

  //get the old name from the paramters or body
  database
    .updateDocument(req.body, res)
    .then((response) => {
        debugLogger("Received response updateDocument: " + response);
    })
    .catch((response) => {
        console.log("Received Error updateDocument: " + response);
    });
 });

//-----------------------------------------------------------------------------------
// RESULTS
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
app.get( "/api/v1/project/results/list/:id",
  cors(corsOptions),
  (req, res) => {
    debugLogger(" get:/api/v1/project/results/list/:id");
    let children = database.getChildrenOfDocument( req.params.id, res)
      .then((response) => {
        debugLogger("getResults " +  response);
      })
      .catch((response) => {
        console.log("Received Error getDocument: " + response);
      });
  }
);

//-----------------------------------------------------------------------------------
app.get( "/api/v1/project/results/id/:id",
  cors(corsOptions),
  (req, res) => {

    debugLogger(" get:/api/v1/project/results/id/:id");
    let result = database.getDocumentId( req.params.id, res)
      .then((response) => {
        debugLogger("getResults " +  response);
      })
      .catch((response) => {
        console.log("Received Error getDocument: " + response);
      });
  }
);

//-----------------------------------------------------------------------------------
app.get( "/api/v1/project/results/grid/:id",
  cors(corsOptions),
  (req, res) => {

    console.log("getResultsGrid ", req.params.id);
    if( req.params.id == null ) {
        console.log("Bad Id ", req.params.id);
        res.send( "{}");
        return;
    }

    debugLogger(" /api/v1/project/results/grid/:id");
    let result = database.getResultsGrid( req.params.id, res)
      .then((response) => {
        debugLogger("getResults " +  response);
      })
      .catch((response) => {
        console.log("Received Error getDocument: " + response);
      });
  }
);



//-----------------------------------------------------------------------------------
app.post("/api/v1/project/results/import", cors(corsOptions), (req, res) => {
  // use the name to get to the correct database
  let data = req.body;

    database.getDocumentId( data.parentId, null ).then( (parent) => {

        database.addResultFile( data.name, data.projectId, parent, data.content, 'json', res )
        .then((response) => {
            debugLogger("getResults " + response);
            
          })
          .catch((response) => {
            console.log("Received Error getDocument: " + response);
          });
    }).catch(( err ) => {console.log("Error:  database.getDocumentId ", err)});


});

//-----------------------------------------------------------------------------------
app.delete(
  "/api/v1/project/:name/results/:resultId",
  cors(corsOptions),
  (req, res) => {
    // let resp =
    //   "delete  results:  " +
    //   req.params.resultId +
    //   " from folder " +
    //   req.params.folderId +
    //   " in project " +
    //   req.params.name;
    // debugLogger(resp);
    console.log( "Delete: ", req.params.resultId)
    database.deleteDocId( req.params.resultId, null, res ).then ((response) => {

        debugLogger( response );

    }).catch((response) => { console.log( "Error $repsonse ")});


    //res.send(resp);
  }
);




//PATCH api/v1 /project/<project name>/folder/<id>/results   ???? probably will not need this endpoint

//-----------------------------------------------------------------------------------
app.get(
  "/api/v1/project/:name/folder/:folderId/result/:resultId/attachments",
  cors(corsOptions),
  (req, res) => {
    // verify project name & folder
    // get a list of attachments
    let resp =
      "get attachment list from result " +
      req.params.name +
      " folder id " +
      req.params.folderId +
      " result id " +
      req.params.resultId;

      debugLogger(resp);
    res.send(resp);
  }
);

//GET api/v1 /project/<project name>/result/{resultId}/attachment/{index}
//POST api/v1 /project/<project name>/result/{resultId}/attachment
//DELETE api/v1 /project/<project name>/result/{resultId}/attachment/{index}

//-----------------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

//-----------------------------------------------------------------------------------
function getDatabase(name) {
  return database;
}

//-----------------------------------------------------------------------------------
function validateDocumentName(name) {
  return true;
}

function debugLogger(message) {
    if ( debug ) {
        console.log( message );
    }
}
