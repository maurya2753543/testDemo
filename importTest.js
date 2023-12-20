import * as database from './projectdb.js';

//let projName = "./test/results/sor/Blueberry_230830152657"   ///"Exported-Project";
let projName = "Exported-Project";
let filename = projName;

//doTheImport()
doTheImportZip()

// import the project
async function doTheImport() {

    database.importProject(  filename + ".json"   );

    let doc  = await database.findDocumentByName(projName, database.PROJECT );
    console.log( doc);
    

}

async function doTheImportZip() {

    database.importProjectZip(  filename + ".rpp"   );

    // let doc  = await database.findDocumentByName(projName, database.PROJECT );
    // console.log( doc);
    

}