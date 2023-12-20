
import * as database from '../projectdb.js';
import _ from 'lodash';

await database.createIndex();

//database.getAllDocs();


let columns = {
    standard : 
        [        
            { enabled : true,  name : "timestamp", header : "Timestamp", type : "ISOdateTime", category: "common", cdmPath : "tests[0].results.testTime"  },
            { enabled : true,  name : "testType",  header : "Test",      type : "string",      category: "common", cdmPath : "tests[0].label"  },
            { enabled : false, name : "locaion",   header : "ID",        type : "string",      category: "common", cdmPath : "tests[0].testLocations.label"  },
            { enabled : true,  name : "status",    header : "Status",    type : "status",      category: "common", cdmPath : "tests[0].results.status"  },
            { enabled : true,  name : "device",    header : "Device",    type : "string",      category: "common", cdmPath : "assetInfo.model"  }
        ],
    opticalLoss :
        [
            { enabled : true, name: "wavelength",    header : "Wavelength",     type: "number", category: "measurement", cdmPath : "tests[0].results.data.measuredResults[0].wavelength" },
            { enabled : true, name: "insertionLoss", header : "Insertion Loss", type: "string", category: "measurement", cdmPath : "tests[0].results.data.measuredResults[0].signalStatus" },
            { enabled : true, name: "reference",     header : "Reference",      type: "string", category: "measurement", cdmPath : "tests[0].results.data.measuredResults[0].testStatus" }
        ],
    powermeter :
        [       // todo: figure out a way to represent the 2nd and 3rd wavelength measurements
            { enabled : true, name: "wavelength",         header : "Wavelength",  type: "string", category: "measurement", cdmPath : "tests[0].results.data.measuredResults[0].wavelengthNm" },
            { enabled : true, name: "absolutePowerdBm",   header : "Power (dBm)", type: "number", category: "measurement", cdmPath : "tests[0].results.data.measuredResults[0].absolutePowerdBm" },
            { enabled : true, name: "absolutePowerpW",    header : "Power (pW)",  type: "number", category: "measurement", cdmPath : "tests[0].results.data.measuredResults[0].absolutePowerpW" },
            { enabled : true, name: "measuredLevel",      header : "Level",       type: "number", category: "measurement", cdmPath : "tests[0].results.data.measuredResults[0].measuredLevel" },
            { enabled : true, name: "absoluteTestStatus", header : "Status",      type: "string", category: "measurement", cdmPath : "tests[0].results.data.measuredResults[0].absoluteTestStatus" },
            { enabled : true, name: "autoLambdaDetect",   header : "Auto Lambda", type: "string", category: "measurement", cdmPath : "tests[0].results.data.measuredResults[0].autoLambdaDetect" },
            { enabled : true, name: "modulation",         header : "Modulation",  type: "string", category: "measurement", cdmPath : "tests[0].results.data.measuredResults[0].modulation" }
        ],
    otdr: [
            { name: "wavelength",           header : "Wavelength",             type: "string",   category: "measurement", cdmPath : "tests[0].results.data.wavelength" },
            { name: "wavelengthTestStatus", header : "Wavelength Test Status", type: "string",   category: "measurement", cdmPath : "tests[0].results.data.wavelength" },
            { name: "acqusisionTime",       header : "Acqusision Time",        type: "datetime", category: "measurement", cdmPath : "tests[0].results.data.wavelength" },
            { name: "length",               header : "Length",                 type: "number",   category: "measurement", cdmPath : "tests[0].results.data.wavelength" },
            { name: "linkLoss",             header : "Link Loss",              type: "number",   category: "measurement", cdmPath : "tests[0].results.data.wavelength" },
            { name: "linkOrl",              header : "Return Loss",            type: "number",   category: "measurement", cdmPath : "tests[0].results.data.wavelength" },
            { name: "maxConnector",         header : "Max Connector",          type: "number",   category: "measurement", cdmPath : "tests[0].results.data.wavelength" },
            { name: "maxReflectance",       header : "Max Reflectance",        type: "number",   category: "measurement", cdmPath : "tests[0].results.data.wavelength" },
            { name: "numEvents",            header : "Number of Events",       type: "number",   category: "measurement", cdmPath : "tests[0].results.data.wavelength" }
    ],
    fiberInspection: [
            { name: "ZoneA",             header : "Zone A",              type: "status", category: "measurement", cdmPath : "tests[0].results.data.status" },
            { name: "ZoneB",             header : "Zone B",              type: "status", category: "measurement", cdmPath : "tests[0].results.data.status" },
            { name: "ZoneC",             header : "Zone C",              type: "status", category: "measurement", cdmPath : "tests[0].results.data.status" },
            { name: "ZoneD",             header : "Zone D",              type: "status", category: "measurement", cdmPath : "tests[0].results.data.status" },
            { name: "ZoneE",             header : "Zone E",              type: "status", category: "measurement", cdmPath : "tests[0].results.data.status" },
            { name: "ZoneF",             header : "Zone F",              type: "status", category: "measurement", cdmPath : "tests[0].results.data.status" },
            { name: "ZonePassAll",       header : "passAll",             type: "status", category: "measurement", cdmPath : "tests[0].results.data.status" },
            { name: "ZonePassDefects",   header : "Zone Pass Defects",   type: "status", category: "measurement", cdmPath : "tests[0].results.data.status" },
            { name: "ZonePassScratches", header : "Zone Pass Scratches", type: "status", category: "measurement", cdmPath : "tests[0].results.data.status" }
    ],
    truPon: [],
    tier1: [],
    tier1mpo: []
    
}

//-----------------------------------------------------------------------------
// Query the results for the selected parent
//-----------------------------------------------------------------------------



let doc = await database.findDocumentByName("Project-Alpha" , "project");
//let doc = await database.findDocumentByName("Job-01" , "folder");
let document = doc.docs[0];
console.log( document._id );
let children = await database.getChildrenOfDocument( document._id, null);

//-----------------------------------------------------------------------------
// Walk thru the children and extract the enabled columns based in test type
// and number of measurements
//-----------------------------------------------------------------------------
children.docs.forEach( async function (element) {

        // get the document with the attachement
        let result = await database.getDocumentId( element._id, null);


        //Parse the attachment after converting Base64 to ascii
        let cdm = JSON.parse(Buffer.from(result._attachments.json.data, 'base64').toString('ascii'));

        //console.log( cdm.assetInfo.assetType,  cdm.assetInfo.serialNo, cdm.tests[0].label,  cdm.tests[0].results.testTime );
        let row = "";
        columns.standard.forEach( async function (col) {
        if( col.enabled ) {
                row = row.concat( _.get( cdm, col.cdmPath) );
                row = row.concat( ", ");
            }
        } );


        switch ( cdm.tests[0].type ) {
             case "powermeter":
                //console.log( "Number of measurments: " , cdm.tests[0].results.data.measuredResults.length );
                columns.powermeter.forEach( async function (col) {
                    if( col.enabled ) {
                            row = row.concat( _.get( cdm, col.cdmPath) );
                            row = row.concat( ", ");
                        }
                    } );
                break;

            case "opticalloss":
                columns.opticalloss.forEach( async function (col) {
                    if( col.enabled ) {
                            row = row.concat( _.get( cdm, col.cdmPath) );
                            row = row.concat( ", ");
                        }
                    } );
            break;
            default:
                console.log( "Unknown test type");
                break;

        };

        console.log( row );
    });
 
