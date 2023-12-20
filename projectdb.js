import PouchDB from "pouchdb";
import PouchFind from "pouchdb-find";
import path from "path";
import fs from "fs";
import _ from "lodash";
import { columnsData } from './columns-data.js'

import JSZip from "jszip";
import Cryptr from 'cryptr'

PouchDB.plugin(PouchFind);

export const PROJECT = "project";
export const FOLDER = "folder";
export const RESULT = "result";
export const APP_SETTINGS = "appSettings";

let debug = false;
let dbName = "sample_projectdb";
let dbPath = "database";
const columns = columnsData;

let projectPath = path.join(dbPath, dbName);

let db = new PouchDB(projectPath);

export async function newDatabase() {
  db = new PouchDB(projectPath, {auto_compaction: true});
}

//---------------------------------------------------------
export async function closeDatabase() {
  console.log("Closing databases");
  await db.close();
  await cfg.close();

  console.log("Database Closed");
}

//---------------------------------------------------------
export async function getAllDatabaseInfo() {
  await db
    .info()
    .then(function (result) {
      console.log("-- Project Info -----------------------------------------");
      console.log(result);
    })
    .catch((err) => errorLog);
}

//---------------------------------------------------------
export async function destroyDB(myDb) {
  //   try {
  //     let response = await db.destroy();
  //     debugLogger("DB-destroyed: " + response); // success
  //   } catch (err) {
  //     console.log(err);
  //   }

  await db
    .destroy()
    .then(function (response) {
      debugLogger("DB-destroyed: " + response); // success
    })
    .catch((err) => errorLog);
}

//---------------------------------------------------------
export async function deleteDocIdRev(folder, func) {
  //   try {
  //     let response = await db.remove(folder._id, folder._rev);
  //     if (func != null) {
  //       func.send(response);
  //     }
  //     debugLogger(response);
  //   } catch (err) {
  //     console.log("remove failed " + err);
  //   }

  await db
    .remove(folder._id, folder._rev)
    .then(function (response) {
      if (func != null) {
        func.send(response);
      }
      debugLogger(response);
    })
    .catch((err) => errorLog);
}

//---------------------------------------------------------
export async function deleteDocId(id, rev, func) {

    await db.get(id).then((doc) => {

        db.remove(doc).then((resp) => {
            if (func != null) {
                func.send(resp);
              }
        })

    }).catch((err) => {
        console.log( "delete", err)
    });



//   let response;
//   try {
//     if (rev !== undefined) {
//       response = await db.remove(id, rev);
//     } else {
//       response = await db.remove(id);
//     }
//     if (func != null) {
//       func.send(response);
//     }
//     debugLogger(response);
//   } catch (err) {
//     console.log("remove failed " + err);
//   }
}

//---------------------------------------------------------
export async function updateDocument(doc, func) {
  try {
    let document = await db.get(doc._id);

    console.log( "update document", document );
    // todo limit what can be changed
    // apply the updates here
    _.each(doc, (val, key) => {
      _.set(document, key, val);
    });

    console.log("updated doc", document);
    // then put the doucment back in the database

    let response = await db.put(document);
    
    if (func != null) {
      func.send(response);
    }
  } catch (err) {
    console.log(err);
  }

  
}

//---------------------------------------------------------
export async function createIndex() {
    
  await db
    .createIndex({
      index: { fields: ['name'] },
    })
    .then(function (doc) {
      console.log(doc);
    });

  await db
    .createIndex({
      index: { fields: ["projectId"] },
    })
    .then(function (doc) {
        console.log(doc);
    });
}


//---------------------------------------------------------
export async function compact() {
    
    await db
      .compact()
      .then(function (doc) {
        console.log(doc);
      });
  
  }


//---------------------------------------------------------
export async function getChildren(id, func) {
  try {
    let response = await db.find({
      selector: {
        parent: { $eq: id },
      },
    });
    if (func != null) {
      func.send(response);
    } else {
      return response;
    }
  } catch (err) {
    console.log(err);
  }

}


//---------------------------------------------------------
export async function getChildFolders(id, func) {
  try {
    let response = await db.find({
      selector: {
        parent: { $eq: id },
        type: { $eq: "folder"},
      },
    });
    if (func != null) {
      func.send(response);
    } else {
      return response;
    }
  } catch (err) {
    console.log(err);
  }

}


//---------------------------------------------------------
export async function getChildrenSelector(func, selector) {
  try {
    let response = await db.find(selector);
    if (func != null) {
      func.send(response);
    } else {
      return response;
    }
  } catch (err) {
    console.log(err);
  }
}

//---------------------------------------------------------
export async function getChildrenOfDocument(id, func) {
  let document = await getDocumentId(id, null);

  let projectId;
  let dataSelect;

  // based on the document type create a selector object
  if (document.type == "project") {
    projectId = document._id;
    dataSelect = {
      selector: {
        projectId: { $eq: projectId },
        type: { $eq: "result" },
      },
      fields: ["name", "measType", "_id"],
    };
  } else {
    projectId = document.projectId;

    let id = document._id;
    dataSelect = {
      selector: {
        projectId: { $eq: projectId },
        parent: { $eq: id },
        type: { $eq: "result" },
      },
      fields: ["name", "measType", "_id"],
    };
  }

  // run the query
  try {
    let response = await db.find(dataSelect);
    if (func != null) {
      func.send(response);
    } else {
      return response;
    }
  } catch (err) {
    console.log(err);
  }
}

//---------------------------------------------------------
export async function getResultCount( document ) {

    let projectId;
    let dataSelect;

// based on the document type create a selector object
if (document.type == "project") {
    projectId = document._id;
    dataSelect = {
      selector: {
        projectId: { $eq: projectId },
        type: { $eq: "result" },
        //name: {$exists : true },
      },
      fields: ["_id"],
    };
  } else {
    projectId = document.projectId;

    let id = document._id;
    dataSelect = {
      selector: {
        projectId: { $eq: projectId },
        parent: { $eq: id },
        type: { $eq: "result" },
      },
      fields: ["_id"],
    };
  }

  // run the query
  try {
      let response = await db.find(dataSelect);      
      return response;
    
  } catch (err) {
    console.log(err);   
    return err;
  }



}

//---------------------------------------------------------
export async function getAllResults(id, func) {

  await db
    .find({
      selector: {
        parent: { $eq: id },
        type: { $eq: "result" },
      },
    })
    .then(function (response) {
      if (func != null) {
        func.send(response);
      } else {
        return response;
      }
    })
    .catch((err) => errorLog);
}

//---------------------------------------------------------
export async function findDocument(name, type) {
  try {
    let response = await db.find({
      selector: {
        name: { $exists: true },
        type: { $eq: type },
      },
      sort: ['name']
    });
    return response;
  } catch (err) {
    console.log(err);
  }
}

//---------------------------------------------------------
export async function findDocumentByName(name, type) {
  try {
    let response = await db.find({
      selector: {
        name: { $eq: name },
        type: { $eq: type },
      },
    });
    return response;
  } catch (err) {
    console.log(err);
  }
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
  }
  t;
}

//---------------------------------------------------------
export async function updateDocumentX(doc) {
  try {
    let response = await db.put(doc);
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}

//---------------------------------------------------------
export async function createProject(name, func) {
  // validate the projec name  - Needs to be string that can be used to create a filename
  // open the config database and create an entry
  // use the name to create a database for the project

  debugLogger("API call create Project " + name);

  let settings = {

        levelUnits: 'dBm',
        distanceUnits: 'km',
        profile : { 
                name: 'tpa', 
                levels: ['Project', 'Job' ]
            },
        reportInformation:  {
            title: "Title",
            company: "Company",
            technican: "Operator",
            streetAddress: "Street Address",
            city: "city",
            postalCode: "123456",
            phone: "888-555-1212",
            email: "operator@company.com"
        },
        columns: columnsData
    }

  let project = {
    ancestors: [],
    parent: null,
    projectId: null,
    name: name,
    settings,
    type: PROJECT,
  };

  try {
    let response = await db.post(project);
    if (func != null) {
      func.send(response);
    }
    return response;
  } catch (err) {
    console.log(err);
    return err;
  }
}

//---------------------------------------------------------
export async function addProjectFolder(name, parentId, projectId, func) {
  //get the parent_id
  debugLogger("Add folder " + name + " | " + parentId);
  let folder = {
    name: name,
    projectId: projectId,
    ancestors: [parentId],
    parent: parentId,
    type: FOLDER,
  };

  try {
    let response = await db.post(folder);
    if (func != null) {
      func.send(response);
    }
    return response;
  } catch (err) {
    console.log(err);
    return err;
  }
}

//---------------------------------------------------------
export async function addResultFile(
  name,
  projectId,
  parent,
  content,
  type,
  func
) {
  let myAncestors = [...parent.ancestors];
  myAncestors.push(parent._id);

  //   if( type == 'json'  ) {

  //         // process thie content as CDM
  //         // verify a test block is present
  //         if( content.tests == null) {
  //             console.log( "ERROR: Invalid CDM");
  //         }

  //   }
  //   else if( type == 'sor' ) {
  //     // process as sor
  //   }
  //   else {
  //     console.log("ERROR: Unknown file type")
  //   }

  let location = "none";
  
  
  if (content.tests[0].testLocations != undefined) {
    
    location = content.tests[0].testLocations[0].label;
  }

  let myResult = {
    name: name,
    projectId: projectId,
    ancestors: myAncestors,
    parent: parent._id,
    type: RESULT,
    measType: content.tests[0].type,
    measTypeLabel: content.tests[0].label,
    testTime: content.tests[0].results.testTime,
    status: content.tests[0].results.status,
    location: location,
    device: content.assetInfo.assetType,
    serialNo: content.assetInfo.uniqueId,
  };

  let contentBase64 = Buffer.from(JSON.stringify(content)).toString("base64");

  try {
    let result = await db.post(myResult);
    //debugLogger(result);
    let attach = await addAttachment(
      result.id,
      result.rev,
      type,
      contentBase64,
      "text/plain"
    );
    if (func != null) {
      func.send(attach);
    }
    //console.log( attach );
    return result;
  } catch (err) {
    console.log("log-1", err);
  }
}


//-----------------------------------------------------------------------------------
export async function getResultsGrid(id, func) {

    //.log("DBx: getResultsGrid ", id)
    if( id == null ) {
        if (func != null) {
            func.send([]);
            return;
          }
          else {
            return null;
          }
    }

  let children = await getChildrenOfDocument(id, null);

  //-----------------------------------------------------------------------------
  // Walk thru the children and extract the enabled columns based in test type
  // and number of measurements
  //-----------------------------------------------------------------------------
  var rowData = [];
  for (let i = 0; i < children.docs.length; i++) {
    // get the document with the attachement
    let result = await getDocumentId(children.docs[i]._id, null);

    //Parse the attachment after converting Base64 to ascii
    let cdm = JSON.parse(
      Buffer.from(result._attachments.json.data, "base64").toString("ascii")
    );

    let operator = "";
    if( result.operator ) {
        operator = result.operator;
    }

    //let row = processCDM(cdm, children.docs[i]._id );

    let row = {
      Timestamp: cdm.tests[0].results.testTime,
      Test: cdm.tests[0].label,
      TestId: cdm.tests[0].type,
      Location: result.location,
      Status: cdm.tests[0].results.status.toUpperCase(),
      Limit: "limit",
      device: cdm.assetInfo.assetType,
      id: children.docs[i]._id,
      technician: operator,
    };

    let testType = cdm.tests[0].type;
    // calculate the path to the measurement columns based on the test type
    var measArray = _.get(columns, testType + ".measurements");

    if (measArray != undefined) {
      measArray.forEach((element) => {
        let value = _.get(cdm, element.cdmPath);
        _.set(row, element.name, value);
      });
    }

    // calculate the path to the configuration columns based on the test type
    var cfgArray = _.get(columns, testType + ".configuration");
    
    if (cfgArray != undefined) {
        cfgArray.forEach((element) => {
        let value = _.get(cdm, element.cdmPath);
         
        _.set(row, element.name, value);
      });
    }

    rowData.push(row);
  }

  if (func != null) {
    func.send(rowData);
  }
  return rowData;
}

//---------------------------------------------------------
export async function addAttachment(id, rev, attachmentId, attachment, format) {
  // application/json

  try {
    let result = await db.putAttachment(
      id,
      attachmentId,
      rev,
      attachment,
      "application/json"
    );
    return result;
  } catch (err) {
    console.log("log-2", err);
  }
}


//---------------------------------------------------------
export async function deleteProject( projectId) {

    let response;

    //get the project
    await db
    .get(projectId)
    .then(function (resp) {
      response = resp;
    })
    .catch(function (err) {
      console.log(err);
      return err;
    });

    // find all children that has this projectId
    // need id and rev 
    await db.find(
        {
          selector: {
            projectId: { $eq: projectId },
          },
          fields: ["_id", "_rev"],
        },
        (error, doc) => {
          if (error) console.error(error);
          else {

  
            // for each child doc  remove (id, rev)
            // compact database
            doc.docs.forEach( d => {

                db.remove( d._id, d._rev).then((resp) => {
                    console.log(resp) 
                }); 
            })
  
            db.remove( response._id, response._rev).then((resp) => {
                console.log(resp) 
            }); 

            db.compact()
            
          }
        }
      );





}



//---------------------------------------------------------
export async function checkForDuplicate( projectId, timestamp, type) {

    await db.find(
        {
          selector: {
            projectId: { $eq: projectId },
            testTime:  { $eq: timestamp },
            measType:  { $eq: type }
          },
          fields: ["_id", "_rev", "timestamp"],
        },
        (error, doc) => {
          if (error) console.error(error);
          else {

            console.log( doc );
            return  (doc.docs.length > 0)
            
          }
        }
      );
}



//---------------------------------------------------------
//  EXPORT and IMPORT functions
//---------------------------------------------------------
export async function exportProject2(projectId, filename) {
    let response;
  
    //   try {
    //     response = await db.get(projectId);
    //     console.log(response);
    //   } catch (err) {
    //     console.log(err);
    //     return err;
    //   }
  
    await db
      .get(projectId)
      .then(function (resp) {
        response = resp;
      })
      .catch(function (err) {
        console.log(err);
        return err;
      });
  
    await db.find(
      {
        selector: {
          projectId: { $eq: projectId },
        },
        fields: ["_id", "_rev"],
        // include_docs: true,
        // attachments: true,
      },
      (error, doc) => {
        if (error) console.error(error);
        else {
          
          const proj = { id : response._id, rev : response._rev};


          var map = {
            _id : "id",
            _rev : "rev",
        }
        


          doc.docs.forEach( d => {
            _.each(d, function(value, key) {
                key = map[key] || key;
                d[key] = value;
            });
            _.unset( d, "_id");
            _.unset( d, "_rev");
            
          })


          doc.docs.unshift(proj);

          //console.log(doc.docs);

          //const docArray = { docs : doc.docs, attachments: true};
          
          db.bulkGet( { docs: doc.docs, 
                        attachments : true } ).then ( (resp) => {

            //console.log("---------");
            

            let out = [];
            
            resp.results.forEach( rec => {
                out.push( rec.docs[0].ok )
            })
            //console.log( out );



            //console.log( JSON.stringify( out, null, 2 ) );
            download(JSON.stringify(out), filename + ".rpp");

          })
  
          
        }
      }
    );
  
    //   await db.remove(folder._id, folder._rev)
    //   .then( function (response) {} )
    //   .catch( function (err) {} );
  }


// //---------------------------------------------------------
// //  EXPORT and IMPORT functions
// //---------------------------------------------------------
// export async function exportProject(projectId, filename) {
//   let response;

//   //   try {
//   //     response = await db.get(projectId);
//   //     console.log(response);
//   //   } catch (err) {
//   //     console.log(err);
//   //     return err;
//   //   }

//   await db
//     .get(projectId)
//     .then(function (resp) {
//       response = resp;
//     })
//     .catch(function (err) {
//       console.log(err);
//       return err;
//     });

//   await db.find(
//     {
//       selector: {
//         projectId: { $eq: projectId },
//       },
//       include_docs: true,
//       attachments: true,
//     },
//     (error, doc) => {
//       if (error) console.error(error);
//       else {
//         doc.docs.unshift(response);
//         console.log(doc.docs);

//         download(JSON.stringify(doc.docs), filename + ".zip");
//       }
//     }
//   );

//   //   await db.remove(folder._id, folder._rev)
//   //   .then( function (response) {} )
//   //   .catch( function (err) {} );
// }

//---------------------------------------------------------
async function download(data, filename) {

    let zip = new JSZip

    const cryptr = new Cryptr('myTotallySecretKey');

    const edata = cryptr.encrypt(data);

    zip.file("project", edata);
    const content = await zip.generateAsync({type:"uint8array", compression: "DEFLATE", compressionOptions: { level: 9  }})
       // zip.generateAsync({type:"uint8array"}).then( (content) => {
    
        fs.writeFile(filename, content, (err) => {
            if (err) {
            console.error(err);
            }
            console.log("File write successful");
        });

 // })

  
}

//---------------------------------------------------------
// export function importProject({
//   target: {
//     files: [file],
//   },
// }) 
export function importProject( file )
{
  if (file) {
    //const reader = new FileReader();
    fs.readFile( file, 'utf8', (err, data) => {


        let proj = JSON.parse(data);

        proj.forEach( doc => {
            _.unset(doc, "_rev");
        })
        
        console.log( JSON.stringify( proj, null, 2));



        db.bulkDocs(
            JSON.parse(proj),
            { new_edits: true }, // not change revision
            (...args) => console.log("DONE", args)
          );


    } ) 

  }
}

export async function importProjectZip(file) {
  if (file) {
    //const reader = new FileReader();

    const zip = new JSZip();
    const cryptr = new Cryptr('myTotallySecretKey');
    fs.readFile(file, (err, data) => {
      
        //var zip = new JSZip();
        zip.loadAsync(data).then( function(contents) {
            Object.keys(contents.files).forEach( function(filename) {
                zip.file(filename).async('nodebuffer').then(function(content) {
                    const dest = path + filename;
                    //console.log(dest, content);
                    const econtent = String.fromCharCode.apply(null, content)
                
                    const projContent = cryptr.decrypt(econtent);

                    const proj = JSON.parse(projContent);

                    proj.forEach( doc => {
                        _.unset(doc, "_rev");
                    })

                
                    console.log( JSON.stringify( proj, null, 2));

                        // db.bulkDocs(
                        //     JSON.parse(proj),
                        //     { new_edits: true }, // not change revision
                        //     (...args) => console.log("DONE", args)
                        //   );


                });
            });
        });

    });
  }
}



//---------------------------------------------------------
export async function createAppSetting( settings ) {

      try {
        let response = await db.post(settings);
        return response;
      } catch (err) {
        console.log(err);
        return err;
      }
}


//---------------------------------------------------------
export async function setAppSettings(settings  ) {

    let document = settings;
    _.set(document, "_id", APP_SETTINGS );

    //console.log( document );

    updateDocument(document)
    .then((response) => {
        debugLogger("Received response updateDocument: " + response);
        return response
    })
    .catch((response) => {
        console.log("Received Error updateDocument: " + response);
        return response;
    });

}

//---------------------------------------------------------
function debugLogger(message) {
  if (debug) {
    console.log(message);
  }
}

//---------------------------------------------------------
function errorLog(err) {
  console.log(err);
}

//--- TEST FUNCTION ------------------------------------------------------
export async function getAllDocs(limit) {
  let t1 = new Date();
  await db.allDocs(
    { include_docs: true, descending: true },
    function (err, doc) {
      let t2 = new Date();
      console.log("-- All Docs ------------------------------");
      //console.log(JSON.stringify( doc, null, 4));
      console.log( doc );
      console.log("records: " + doc.total_rows);
      console.log(doc.rows);
      console.log("Elapsed Time: " + (t2 - t1) + " mS");
    }
  );
}
