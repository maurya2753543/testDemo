
import * as database from './projectdb.js';
import fs from 'fs';

handleExport();

function handleExport () {
    database.db.allDocs({include_docs: true}, (error, doc) => {
      if (error) console.error(error);
      else download(
        JSON.stringify(doc.rows.map(({doc}) => doc)),
        'tracker.db',
        'text/plain'
      );
    });
  }


  function download(data, filename, type) {

    //console.log( data )


    fs.writeFile('testExport.db', data, err => {
        if (err) {
          console.error(err);
        }
        console.log( "File write successful")
      });

    // var file = new Blob([data], {type: type});
    // if (window.navigator.msSaveOrOpenBlob) // IE10+
    //     window.navigator.msSaveOrOpenBlob(file, filename);
    // else { // Others
    //     var a = document.createElement("a"),
    //             url = URL.createObjectURL(file);
    //     a.href = url;
    //     a.download = filename;
    //     document.body.appendChild(a);
    //     a.click();
    //     setTimeout(function() {
    //         document.body.removeChild(a);
    //         window.URL.revokeObjectURL(url);  
    //     }, 0); 
    // }
}