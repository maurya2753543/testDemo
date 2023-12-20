import * as database from './projectdb.js';

import optical_power_1 from "./test/results/optical-power-01.json" assert { type: "json" };
let projName = "DeleteMe-project";

//---------------------------------------------------------------------------------
let folderNames = ["Job-01"];
let resultNames = [
  {
    name: "Result-X",
    attachId: "optical-power-01.json",
    attachFile: optical_power_1,
  }
];


// '1a330bf7-90b5-48fd-9c97-0c2f840b8756'
database.deleteProject('1a330bf7-90b5-48fd-9c97-0c2f840b8756');
// create a project with one folder and one result.
//await createDatabase(projName);



let  doc = await database.findDocumentByName(projName, database.PROJECT );



console.log( doc );







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

