import * as database from './projectdb.js';

import optical_power_1 from "./test/results/optical-power-01.json" assert { type: "json" };


// create databaseX with projectA with on project and one folder
// export projectA
// import projectA into databaseY

let projName = "Exported-Project";
let filename = projName;



doTheCreateAndExport();

//deleteProject();

//delProject( '619a574b-4739-46ac-928e-415533a8edf2', '1-eac6852ede8933819c4143a3c429c8f8');

//await database.compact()

//doExport()



async function doExport() {

    let doc  = await database.findDocumentByName(projName, database.PROJECT );
    console.log( doc);

    // export the project
    database.exportProject(doc.docs[0]._id , filename) ;

}



async function doTheCreateAndExport() {

    // create a project with one folder and one result.
    await createDatabase(projName);

    let doc  = await database.findDocumentByName(projName, database.PROJECT );



    // export the project
    database.exportProject2(doc.docs[0]._id , filename) ;
}

// remove the project from init
async function deleteProject() {

    let doc  = await database.findDocumentByName(projName, database.PROJECT );
    console.log( doc);


    let resp = await database.deleteDocId( doc.docs[0]._id, doc.docs[0]._rev, null);
    console.log( resp );

}


async function delProject( id, rev ) {

    let resp = await database.deleteDocId( id, rev, null);
    console.log( resp );

}


//---------------------------------------------------------------------------------
let folderNames = ["Job-01"];
let resultNames = [
  {
    name: "Result-X",
    attachId: "optical-power-01.json",
    attachFile: optical_power_1,
  }
];


//---------------------------------------------------------------------------------
async function createDatabase(projectName) {
    // add a project
  
    let project;
  
    console.log("Create Project ");
    project = await database.createProject(projectName, null);
  
    console.log(project);
    if (project !== null) {
      console.log(project);
  
      folderNames.forEach(async function (element) {
        //console.log("Create Folders " + element);
        let fldr = await database.addProjectFolder(
          element,
          project.id,
          project.id,
          null
        );
        if (fldr !== null) {
          //console.log(fldr);
          let folder = await database.getDocumentId(fldr.id, null);
  
          let result;
          resultNames.forEach(async function (resultElement) {
            result = await database.addResultFile(
              resultElement.name,
              project.id,
              folder,
              resultElement.attachFile,
              "json"
            );
          });
        }
      });
    } else {
      console.log("Something went wrong created the database");
    }
  }
