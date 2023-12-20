//import { usb, getDeviceList, findByIds, webusb } from 'usb';
//import { usb, getDeviceList } from 'usb';
import { SerialPort, ReadlineParser, InterByteTimeoutParser, DelimiterParser } from 'serialport'
import { autoDetect } from '@serialport/bindings-cpp'
import { SerialPortStream } from '@serialport/stream'
import { Transform } from 'stream'



let usbVendorId;
let usbProductId;
let baudRate = 115200;
let filename = "pon/2022-11-02T14-08-48.pon";



let port;
let parser;

let info = '{"method":"GET","transactionId":1,"resource":"/info"}'
let wo =  '{"method":"GET","transactionId":1,"resource":"/api/workflow/v2/list"}';  
let getJob = '{"method":"GET","transactionId":1,"resource":"/api/filemgr/v2/metadata/Job-001"}';
let getFile2 = '{"method":"GET","transactionId":1,"resource":"/api/filemgr/v2/metadata/Job-002/Fiber-005-02_11_2023_14_27_02.mic.json"}'
let getFile = '{"method":"GET","transactionId":1,"resource":"/api/filemgr/v2/userfiles/'
let syncFiles = '{"method":"GET","transactionId":1,"resource":"/api/syncfiles/v1/pendingfiles"}';  
const userFileList = '{"method":"GET","transactionId":1,"resource":"/api/filemgr/v2/userfiles"}';

function showMenu() {
    console.log( "\n0: Display Help ");
    console.log( "1: GET Serial number");
    console.log( "2: GET Challenge code");
}

SerialPort.list().then( (resp) => {
    console.log( resp );
});


let msgCtr = 0;
let retries = 3;
let lastMsg = ""
let timeout;
let totalRetries = 0


function myCallback( data ) {
    stopTimer();
    const jdata = JSON.parse( data );
    console.log( "Recevied", data.length, );
    console.log("-------------------------------", msgCtr );
    msgCtr++;
    if( msgCtr <= 1000 ) {
        sendMessage();
    } else {
        console.log( "Total retries: ", totalRetries)
    }
  }


  function messageTimeout() {
    
    console.log( "Message Timeout!!!")
    resendMessage();

  }
  
  function stopTimer() {
    clearTimeout(timeout);
  }
    

  

  function sendMessage() {

        console.log( "\n\nget File:")
        const link = getFile + "Job-002/Fiber-005-02_11_2023_14_27_02.mic.json" + "\"}";
        const link2 = getFile + "Job-002/Fiber-007-24_11_2023_21_10_23.mic.json" + "\"}";
        console.log( link );
        console.log( "Request", msgCtr, );
        port.flush();
        if ((msgCtr % 2) == 0 ) {
            port.write(link + "\n\r");
            lastMsg = link;
        } else {
            port.write(link2 + "\n\r");
            lastMsg = link2;
        }
        port.drain();
        timeout = setTimeout(messageTimeout, 200);
        retries = 3;
        
  }

  function resendMessage() {
    totalRetries++;
    retries--;
    if( retries <= 0 ) {
        console.log("Error exausted 3 retries")
        return;
    }
    port.flush();
    console.log( lastMsg  );
    port.write(lastMsg + "\n\r");
    port.drain();
    timeout = setTimeout(messageTimeout, 5);
  }


let path = '';
const listPorts = async () => {
    const ports = await binding.list()

    for (const xport of ports) {
      console.log(`${xport.path}\t${xport.pnpId || ''}\t${xport.manufacturer || ''}`)
      if( (xport.vendorId == '158e' ) && (xport.productId =='2005')) {

        path = xport.path;
        console.log( "Corvus found on ", path);



        const openOptions = {
            path,
            binding,
            baudRate,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
            rtscts: false,
            xon: false,
            xoff: false,
          }
        
        
          port = new SerialPortStream(openOptions)
          const output = new OutputTranslator()
          output.messageReceivedCallback( myCallback )
        //   output.pipe(process.stdout)
          port.pipe(output)
       
           // parser = port.pipe(new DelimiterParser({ delimiter: frameEnd }))
           // parser = port.pipe(new ReadlineParser({ delimiter: frameEnd }))
           // parser = port.pipe(new InterByteTimeoutParser({ interval: 300 }))
           // parser.on('data', console.log)
           //port.flush()

            port.on( 'open', onPortOpen);
            //parser.on('data', onPortData );
            port.on('close', onPortClose);
            port.on('error', onPortError);

      }
    }
  }


//const path = '/dev/tty.usbmodem301';
const binding = autoDetect()

listPorts();

// const unlock = new  Uint8Array( [ 85, 76, 75, 10 ]);   //("ULK\n\l");
// const serialNo = 0x2B1C3052;


// const devices = getDeviceList();
// console.log( ">>>>", devices)



    //  port = new SerialPort({ path: path, baudRate: 115200 })            
    //  parser = new ReadlineParser()
    //  port.pipe(parser);

    export class OutputTranslator extends Transform {
        
         accumulator = "";
         chunkLen = 0;
         str = ""
         callbackFunc = null

        _transform(chunk, _encoding, cb) {
          
          if( (chunk[0] == 0x4a) && ( chunk[1] == 0x84 ))  {
            //console.log( chunk )
            this.chunkLen = ((chunk[2]*0x1000000 +  chunk[3]*0x10000 + chunk[4]*0x100 + chunk[5]));
            console.log( "\nChunk Length", this.chunkLen);
            chunk[2] = 0x00;
            chunk[3] = 0x00;
            chunk[4] = 0x00;
            chunk[5] = 0x00;
            this.str = chunk.toString().substring(6);
            this.accumulator = "";
            
          } 
          else {
            this.str = chunk.toString()
          }
          

          for (let index = 0; index < chunk.length; index++) {
           
            const byte = chunk[index]
            if (byte === 0x0d) {
              chunk[index] = 0x0a
            }
          }
          

          this.accumulator = this.accumulator.concat( this.str );
          //console.log(this.chunkLen, this.accumulator.length, chunk.length);

          if( this.accumulator.length == this.chunkLen ) {
                console.log("Done" )
                //console.log( JSON.stringify(JSON.parse(this.accumulator), null, 2))
                //console.log( JSON.parse(this.accumulator))
                if( this.callbackFunc ) {
                    this.callbackFunc( this.accumulator );
                }
                
          }
          
          //this.push(chunk)
          cb()
        }

        messageReceivedCallback( callback ) {

            this.callbackFunc = callback;

        }

      }
 
  
     
      




    
    process.stdin.setRawMode(true)
    process.stdin.on('data', input => {
      for (const byte of input) {
        // ctrl+c
        if (byte === 0x03) {
          port.close()
          process.exit(0)
        }
        if (byte === 0x30) {
            showMenu();
        }
        if (byte === 0x31) {
            console.log( "\n\nget Jobs:");
            port.write( wo );
            port.write( "\n\r");
            port.flush();
            
        }
        if (byte === 0x32) {

            console.log( "\n\nget user Files:")
            port.write( userFileList );
            port.write("\n\r");
            port.flush()
            
        }
        if (byte === 0x33) {
            console.log( "\n\nget Info:")
            port.write(info);
            port.write("\n\r");
            port.flush()
            
        }
        if (byte === 0x34) {
            console.log( "\n\nget File:")
            const link = getFile + "Job-002/Fiber-005-02_11_2023_14_27_02.mic.json" + "\"}";
            const link2 = getFile + "Job-002/Fiber-007-24_11_2023_21_10_23.mic.json" + "\"}";
            console.log( link );
            //console.log( userFiles );
            for( let i = 0; i < 20; i++ ) {
                console.log( "Request", i, i % 2);
                port.flush();
                if ((i % 2) == 0 ) {
                    port.write(link + "\n\r");
                } else {
                    port.write(link2 + "\n\r");
                }
                port.drain();
            }

            
            
        }
        if (byte === 0x35) {
            console.log( "\n\nget Sync File:")
            port.write(getFile);
            port.write("\n\r");
            port.flush()
            
        }

        if (byte === 0x36) {
            msgCtr = 0;
            sendMessage();  
        }


      }
      
    //  port.write(cmd)
    //   if (true) {
    //      output.write(cmd)
    //   }
    })
    process.stdin.resume()
  
    process.stdin.on('end', () => {
      port.close()
      process.exit(0)
    })


    //------------------------------------------------------------------------------------------- 
function onPortOpen() {
    console.log( "Port is open");
}

//-------------------------------------------------------------------------------------------
function onPortClose() {
    console.log( "Port is closed");
   
}

//-------------------------------------------------------------------------------------------
function onPortError(error) {
    console.log( "Port Error: ", error)
}

//-------------------------------------------------------------------------------------------
function onPortData(data) {

    console.log("<-", data);
}


function sendCommand( cmd ) {

    for(let i=0; i < cmd.length; i++ ) {

        port.write(cmd[i]);

        //add intercharacter delay
        // let intervalID = setTimeout(() => {
        //         port.write(cmd[i]);
        //    }, 1);
        

    }
    port.write(cmd);
    port.write("\n\r");
    port.flush()
}



//const devices = getDeviceList();
//console.log( devices );

// for (const device of devices) {
//     console.log(device); // Legacy device
// }

//const device = findByIds(0x0525, 0xA4A2);
//console.log( device );

// const sleep = async (milliseconds) => {
//     await new Promise(resolve => {
//         return setTimeout(resolve, milliseconds)
//     });
// };

//let port;

// usb.on('open', function (data) {
//     console.log('Open:', data)
//   })



//-------------------------------------------------------------------------------------------
// DEVICE ATTACHED 
//-------------------------------------------------------------------------------------------

// usb.on('attach', function(device) { 

//     lastDevice = {vendorId: device.deviceDescriptor.idVendor,  productId:  device.deviceDescriptor.idProduct};
//     console.log("Device Connected!  vendorId: ", lastDevice);
//     console.log( device )
//     responseChannel = 'deviceAttachedMsg'

//     SerialPort.list().then( (devicelist) => {

//         devicelist.forEach( (dev) => {

//             if(parseInt( dev.vendorId, 16) ==  device.deviceDescriptor.idVendor) {

//                 const vid = parseInt( dev.vendorId, 16);
//                 const pid = parseInt( dev.productId, 16);
//                 console.log( "Manufacturer: ", dev.manufacturer, "Port: ",dev.path,  "vid: ", vid, "  pid: ", pid);


//                 // if( pid == inxProductId) {

//                 //     INXMode = true
//                 //     streamPort = new SerialPortStream({ binding, path: dev.path, baudRate: 115200, xon: false, xoff:false, rtscts:false });
//                 //     output = new OutputTranslator();
//                 //     output.setMessageReceivedCallback(onPortDataINX700 );
//                 //     streamPort.pipe(output);
//                 //     streamPort.on('open', onPortOpen);
//                 //     streamPort.on('close', onPortClose);
//                 //     streamPort.on('error', onPortError); 
//                 //     //streamPort.on('drain', onDrain );
//                 //     //streamPort.on('data', onData) ;
                    
//                 // } else {
//                 //     INXMode = false
//                 //     port = new SerialPort({ path: dev.path, baudRate: 115200 });
//                 //     port.open();
//                 //     parser = new ReadlineParser()
//                 //     port.pipe(parser);
//                 //     port.on('open', onPortOpen);
//                 //     port.on('close', onPortClose);
//                 //     port.on('error', onPortError);
//                 // }

                

//                 // viaviDevices.forEach( (element: { vendorId: number; productId: number; assetId: any; handler: any; dataHandler:any }) => {
                    
//                 //     if( (element.vendorId == vid ) && (element.productId== pid) ) {
//                 //         console.log( element.assetId, vid, pid );
//                 //         activeDeviceType = element.assetId;

//                 //         if( INXMode ) {
//                 //             delay(10, element.handler, streamPort);
//                 //             //element.handler(port);

//                 //         }
//                 //         else {
//                 //             parser.on('data', element.dataHandler)
//                 //             element.handler(port);
//                 //         }

                       
//                 //     }
//                 // });


//             }
//         }) 
//     });  
//  });



// //  await 
// //  sleep( 20000 );
// //getIDN();


// //-------------------------------------------------------------------------------------------
// usb.on('detach', function(device) { 

//     console.log("Device Disconnected vendorId: ", device.deviceDescriptor.idVendor, "productId: ", device.deviceDescriptor.idProduct);
//     activeDeviceType = noDevice;
//     const response = {vendorId: device.deviceDescriptor.idVendor,  productId:  device.deviceDescriptor.idProduct};
//     //mainWindow.webContents.send('deviceDetachedMsg', response );

//  });





//---------------------------------------------------------------
  // GET IDN
  //---------------------------------------------------------------
  async function getIDN() {
    let cmdStr = "*IDN?\n";
    let resp = await getData(cmdStr);
    console.log( resp );
  }

  //---------------------------------------------------------------
  // GET File list
  //---------------------------------------------------------------
  async function getFileList() {

    let cmdStr = "STOR:LIST?\n"
    await getData(cmdStr).then ( (resp) => {

        const myfiles = resp.split(",");
        myfiles.forEach((file) => {
          console.log("Result:", file);
        });
    });

  }


  //---------------------------------------------------------------
  // GET a file
  //---------------------------------------------------------------
  async function getDataFile( ) {

    let cmdStr = 'STOR:READ? "' + filename + '",1\n';
     let resp = await getData(cmdStr);
     console.log( "getFile", resp );
  }

  //---------------------------------------------------------------
  // GET data from instrument
  //---------------------------------------------------------------
  async function getData( cmdStr ) {

    // const usbVendorId = parseInt(vendorId);
    // const usbProductId = parseInt(productId);
    ////let navigator = webusb.getWebUsb();

    //---------------
    // get the serial port
    let port = await navigator.serial.requestPort({
      filters: [{ usbVendorId, usbProductId }],
    });

    //---------------
    // open the serial port
    await port.open({ baudRate: baudRate }); // for the MPOLP-85

    //---------------
    // Send  command
    const encoder = new TextEncoder();
    const writer = port.writable.getWriter();
    await writer.ready;
    await writer.write(encoder.encode(cmdStr));
    await writer.close();
    writer.releaseLock();

    //---------------
    // setup for the read
    const reader = port.readable.getReader();

    let textContent = "";
    let inProgress = true;

    // read loop
    while (inProgress) {
      let t1 = new Date();
      await readWithTimeout(reader, 300)
        .then((resp) => {
          let t2 = new Date();
          let delta= t2 - t1;
          console.log("response time ", delta);
          if (resp.value) {
            textContent += new TextDecoder("utf-8").decode(resp.value);
          }
          if (resp.done) {
            console.log("[readLoop] DONE", resp.done);
            inProgress = false;
          }
        })
        .catch(async (err) => {
          //console.log("Final content:", textContent);
          inProgress = false;
          await port.close();
          return textContent;
        });
    }
    return textContent;

  }

  //----------------------------------------------------------------
  async function readWithTimeout(reader, timeout) {
    const timer = setTimeout(() => {
      reader.releaseLock();
    }, timeout);
    const result = await reader.read();
    clearTimeout(timer);
    return result;
  }

              // for(let i=0; i < cmd.length; i++ ) {

            //     let intervalID = setTimeout(() => {
            //         // this code runs every second
            //             port.write(cmd[i]);
            //        }, 10);
               
