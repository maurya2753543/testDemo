import * as database from './projectdb.js';

//import optical_power_1 from "./test/results/optical-power-01.json" assert { type: "json" };
import ontdetect from "./test/results/2023-06-13T10-14-18.ont-20230727115046.json" assert { type: "json" };


// create databaseX with projectA with on project and one folder
// export projectA
// import projectA into databaseY

let projName = "Project-dup";
let filename = projName;


//---------------------------------------------------------------------------------
let folderNames = ["Job-01D"];
let resultNames = [
  {
    name: "Result-D",
    attachId: "2023-06-13T10-14-18.ont-20230727115046.json",
    attachFile: ontdetect,
  }
];


// await createDatabase(projName);
// let  doc = await database.findDocumentByName(projName, database.PROJECT );
// console.log( doc );


//database.checkForDuplicate( testTime, measType  );//
//console.log( ontdetect );
await database.checkForDuplicate('64569022-305f-4b63-a540-3a7c1e733136', '2023-06-13T10:14:18+02:00', 'ontdetection').then( (resp) => {
    console.log( resp );
})










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

