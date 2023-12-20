import PouchDB from "pouchdb";
import PouchFind from "pouchdb-find";
import path from "path";


// let dbName = "settings";
// let dbPath = "/Users/gotwalmi/Documents/JDSU/StrataSync/V-Reporter/poc/v-reporter/v-reporter-proto/dist/settings";

// let projectPath = path.join(dbPath, dbName);

let dbName = "sample_projectdb";
let dbPath = "database";

let projectPath = path.join(dbPath, dbName);

let db = new PouchDB(projectPath);


    // default project profiles
    const TPA = {
        name: "TPA",
        levels: [ "Project", "Job", "Task", "", "" , "" , "" , "" , "" , "" ]
    };

    const DATACENTER = {
        name: "Data Center",
        levels: [ "Project", "Building", "Floor", "Room", "Rack" , "Panel" , "" , "" , "" , ""   ]
    };

    const DEFAULT = {
        name: "Default",
        levels: [ "Project", "Level 1", "Level 2", "Level 3", "Level 4" , "Level 5" , "Level 6" , "Level 7" , "Level 8" , "Level 9" ]
    }

    const strataSyncServers = [
        {
            name: "StrataSync US",
            url: "https://stratasync.viavisolutions.com"
        },
        {
            name: "StrataSync EU",
            url: "https://eu.stratasync.viavisolutions.com"
        },
        {
            name: "StrataSync Stage 1",
            url: "https://stage.stratasync.viavisolutions.com"
        }
        ,
        {
            name: "StrataSync Stage 2",
            url: "https://stage2.stratasync.viavisolutions.com"
        }
    ];

    const languageList = [ 'English', 'Spanish', 'French', 'German', 'Italian' ];

    const distanceUnitList = [ 'kilometers', 'meters', 'feet' ];
    const OpticalLevelUnitsList = [ 'dBm', 'Watts'];

 


  export async function createDocument(name) {

    let cfg = new PouchDB(projectPath);
    
    let settings = {
      _id: "appSettings",
      
      language: languageList[0],
      languageList: languageList,

      opticalLevelUnits : OpticalLevelUnitsList[0],
      distanceUnits : distanceUnitList[0],

      theme : "light",
      splitViewOrientation: 'horizontal',
      splitViewPositionExpanded: 80,
      splitViewPositionNormal: 50,
      projectProfiles: [ TPA, DEFAULT, DATACENTER ],

      strataSyncUsername : '',
      strataSyncPassword : '',
      strataSyncServerUrl : strataSyncServers[0],
      strataSyncServers : strataSyncServers,

    };
  
      try {
        let response = await db.post(settings);
        return response;
      } catch (err) {
        console.log(err);
        return err;
      }
  
  }


//console.log( await createDocument());
//await getAllDocs();

console.log(await getDocumentId("appSettings", null));




export async function newDatabase() {
    db = new PouchDB(projectPath);
}




//---------------------------------------------------------
export async function getDocumentId(id, func) {
    try {
      let response = await db.get(id, { attachments: true });
      if (func != null) {
        func.send(response);
      }
      return response;
    } catch (err) {
      console.log(err);
      return err;
    }t

}


  export async function getAllDocs() {

    let dbName = "settings";
    let dbPath = "/Users/gotwalmi/Documents/JDSU/StrataSync/V-Reporter/poc/v-reporter/v-reporter-proto/dist/settings";

    
    let projectPath = path.join(dbPath, dbName);

    console.log( projectPath );
    
    let cfg = new PouchDB(projectPath);


    await cfg.allDocs(
      { include_docs: true, descending: true },
      function (err, doc) {
        console.log("-- All Docs ------------------------------");
        console.log(doc);
        console.log("records: " + doc.total_rows);
        console.log(doc.rows);

      }
    );
  }
