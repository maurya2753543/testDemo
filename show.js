import * as database from './projectdb.js';


await database.createIndex();

process.argv.forEach((value, index) => {
    if( index > 1) {
        console.log(index, value);
    }   
  });

  if( process.argv[2] == '-A') {
    database.getAllDocs();
  }

//database.getAllProjects();

// let id = 'fe2f7a31-cfb0-4bd8-aa85-3e5b98881494';

if( process.argv[2] == '--p') {
    let children = await database.findDocument( null, "project")
    console.log( children )
}



if( process.argv[2] == '--n') {
    let children = await database.findDocumentByName( process.argv[3], "project")
    console.log( JSON.stringify(children, null, 2) )
}

// if( process.argv[2] == 'all') {
//     database.getAllProjects()
    
// }

if( process.argv[2] == '--detail') {
    database.getAllDocs();
    
}


//await database.deleteDocId( "b5eb99dc-736b-4702-a744-3aaff6ea532d", "1-41fc881454592fd35b4e9bf6f1ca1e51", null );
// await database.deleteDocId( "My new Project X", "1-efb1ec303e5a4ebfdc624d3347972c6a", null );

if( process.argv[2] == 'update') {

    let doc = await database.getDocumentId( 'dbb34e02-5c29-4387-b9eb-ddc90ac44a2a', null);

    console.log( doc );

    doc.distanceUnits = "km";
    doc.levelUnits = 'dBm';

    let docUpdated = await database.updateDocumentX( doc );
    console.log( docUpdated );

    doc = await database.getDocumentId( 'dbb34e02-5c29-4387-b9eb-ddc90ac44a2a', null);
    console.log( doc );
}




// {
//     id: 'dbb34e02-5c29-4387-b9eb-ddc90ac44a2a',
//     key: 'dbb34e02-5c29-4387-b9eb-ddc90ac44a2a',
//     value: { rev: '1-dee9fb2b023ed82370bf5678bd5435ef' },
//     doc: {
//       ancestors: [],
//       parent: null,
//       name: 'Project-Beta',
//       type: 'project',
//       _id: 'dbb34e02-5c29-4387-b9eb-ddc90ac44a2a',
//       _rev: '1-dee9fb2b023ed82370bf5678bd5435ef'
//     }
//   },



// {
//     id: 'ac75e1f2-7135-477e-b8b7-de4bddfeac3e',
//     key: 'ac75e1f2-7135-477e-b8b7-de4bddfeac3e',
//     value: { rev: '1-18bc65854018c031fa13fbf537c6c142' },
//     doc: {
//       ancestors: [],
//       parent: null,
//       name: 'Project-Alpha',
//       type: 'project',
//       _id: 'ac75e1f2-7135-477e-b8b7-de4bddfeac3e',
//       _rev: '1-18bc65854018c031fa13fbf537c6c142'
//     }
//   }

// await database.createIndex();
// database.exportProject('ac75e1f2-7135-477e-b8b7-de4bddfeac3e', "xportTest" );