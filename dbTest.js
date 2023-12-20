import * as database from './projectdb.js';


await database.createIndex();


let projectAlphaId = "48881038-0a00-4293-ae65-02a2a12021f9"


let projectBetaId = "8ad30c36-fde7-49de-b4dd-cb64f7fb3582"
let projectBetaRev = "1-022b37708944d41e1844909bef6865da"

let resultxId = "7c62ffdc-cf09-4b41-a9de-d3b59bb637df"
let resultxParentId = "519f0eb3-850a-4243-a0ed-b83b2783846a"



let alphaResultX = "0573d96f-bdb1-4743-9c42-6549cf7a5d76"



let dest = ""



await database.getDocumentId( projectAlphaId, null ).then( (resp ) => {

    console.log( JSON.stringify( resp, null, 2) );
    dest = resp;

    let projectId;
    let parentId;
    let moveTarget;
    let newAncestors = dest.ancestors;
        newAncestors.push(dest._id )

    if( dest.type == 'project' ) {
        
         moveTarget = {
            _id : resultxId,
            projectId : resp._id,
            parent : resp._id,
            ancestors : newAncestors
         }
    } else {

        moveTarget = {
            _id : resultxId,
            projectId : resp.projectId,
            parent : resp._id,
            ancestors : newAncestors
         }
    }

    console.log("------------------------------------")
    console.log( JSON.stringify( moveTarget, null, 2) );

    console.log("------------------------------------")

    database.updateDocument( moveTarget, null );


   


});
