import * as database from "./projectdb.js";
//import * as configdb from "./configdb.js"

import optical_loss_1 from "./test/results/optical-loss-01.json" assert { type: "json" };
import optical_loss_2 from "./test/results/optical-loss-02.json" assert { type: "json" };
import optical_loss_3 from "./test/results/optical-loss-03.json" assert { type: "json" };

import optical_power_1 from "./test/results/optical-power-01.json" assert { type: "json" };
import optical_power_2 from "./test/results/optical-power-02.json" assert { type: "json" };
import optical_power_3 from "./test/results/optical-power-03.json" assert { type: "json" };
import optical_power_4 from "./test/results/optical-power-04.json" assert { type: "json" };

import ontdetect from "./test/results/2023-06-13T10-14-18.ont-20230727115046.json" assert { type: "json" };
//import fcomppro from "./test/results/FIB-A3.fcpro-20230727114749.json" assert { type: "json" };

import otdr from "./test/results/FIB-A9 9_1550_EO.sor.cdm.json" assert { type: "json" };
import truePON from "./test/results/truePON-gponA.json" assert { type: "json" };
import fiberInspection from "./test/results/fiber-inspection-01.json" assert { type: "json" };

import tier1 from "./test/results/Tier1-example.json" assert { type: "json"} ;
import tier1_mpo from "./test/results/Tier1-mpo-example.json" assert { type: "json"} ;
import inspection_mpo1 from "./test/results/FiberInspectionCorvus.json" assert { type: "json"} ;

import inspection_mpo2 from "./test/results/MPO 4-0-4_12.mic.json" assert { type: "json"} ;
import inspection_mpo3 from "./test/results/MPO 12_12.mic.json" assert { type: "json"} ;
import inspection_mpo4 from "./test/results/MPO 32_32.mic.json" assert { type: "json"} ;


//---------------------------------------------------------------------------------
let folderNames = ["Job-01", "Job-02", "Job-03"];
let resultNamesAlpha = [
  {
    name: "Result-X",
    attachId: "optical-power-01.json",
    attachFile: optical_power_1,
  },
  {
    name: "Result-Y",
    attachId: "optical-power-02.json",
    attachFile: optical_power_2,
  },
  {
    name: "Result-Z",
    attachId: "optical-power-03.json",
    attachFile: optical_power_3,
  },
];

let resultNamesBeta = [
    {
      name: "Result-X",
      attachId: "optical-loss-01.json",
      attachFile: optical_loss_1,
    },
    {
      name: "Result-Y",
      attachId: "optical-loss-02.json",
      attachFile: optical_loss_2,
    },
    {
      name: "Result-Z",
      attachId: "optical-loss-03.json",
      attachFile: optical_loss_3,
    },
  ];

//---------------------------------------------------------------------------------
let resultSamples = [
  {
    name: "Result-OpticalPower",
    attachId: "optical-power-01.json",
    attachFile: optical_power_1,
  },
  {
    name: "Result-OpticalLoss",
    attachId: "optical-loss-01.json",
    attachFile: optical_loss_1,
  },
  {
    name: "Result-OTDR",
    attachId: "otdr-01.json",
    attachFile: otdr,
  },
  {
    name: "Result-FiberInspection",
    attachId: "fiber-inspection-01.json",
    attachFile: fiberInspection,
  },
  {
    name: "Result-FiberInspection",
    attachId: "truePON.json",
    attachFile: truePON,
  },
  {
    name: "Result-ontDetect",
    attachId: "ontdetect.json",
    attachFile: ontdetect,
  },
//   {
//     name: "Result-FCompPro",
//     attachId: "fcomppro.json",
//     attachFile: fcomppro,
//   },
  {
    name: "Result-Tier1",
    attachId: "Tier1.json",
    attachFile: tier1,
  },
  {
    name: "Result-Tier1-MPO",
    attachId: "Tier1-mpo-example.json",
    attachFile: tier1_mpo,
  },
  {
    name: "Result-FiberInspectionMPO1",
    attachId: "FiberInspectionCorvus.json",
    attachFile: inspection_mpo1,
  },
  {
    name: "Result-FiberInspectionMPO2",
    attachId: "MPO 4-0-4_12.mic.json",
    attachFile: inspection_mpo2,
  },
  {
    name: "Result-FiberInspectionMPO3",
    attachId: "MPO 12_12.mic.json",
    attachFile: inspection_mpo3,
  },
  {
    name: "Result-FiberInspectionMPO4",
    attachId: "MPO 32_32.mic.json",
    attachFile: inspection_mpo4,
  },
];



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




//---------------------------------------------------------------------------------
await database.destroyDB();
await database.newDatabase();

await createSampleDatabase();
await createDatabase("Project-Alpha", resultNamesAlpha);
await createDatabase("Project-Beta", resultNamesBeta);
await createConfigDocument();

// await database.getAllDocs();
database.getAllDatabaseInfo();


export async function createConfigDocument(name) {

    
    
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
    

    database.createAppSetting( settings );

    
    }
    



//---------------------------------------------------------------------------------
async function createDatabase(projectName, resultNames) {
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

//---------------------------------------------------------------------------------
async function createSampleDatabase() {
  let project;

  //console.log("Create Sample Data Project ");
  project = await database.createProject("SampleData", null);

  if (project !== null) {
    //folderNames.forEach(async function (element) {
    //console.log("Create Folders " + element);
    let fldr = await database.addProjectFolder(
      "default",
      project.id,
      project.id,
      null
    );
    if (fldr !== null) {
      let folder = await database.getDocumentId(fldr.id, null);

      let result;
      resultSamples.forEach(async function (resultElement) {
        result = await database.addResultFile(
          resultElement.name,
          project.id,
          folder,
          resultElement.attachFile,
          "json"
        );
      });
    }
    //});
  } else {
    console.log("Something went wrong created the sample database");
  }
}
