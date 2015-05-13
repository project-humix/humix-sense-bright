var nats = require('nats').connect();
var log = require('logule').init(module, 'temp');

 
var child = require('child_process');
var proc;


function getSensorData(){

    proc = child.exec("sudo ./loldht  5", function(err,data){


        var str = data.toString(), lines = str.split(/(\r?\n)/g);
        for (var i=0; i<lines.length; i++) {
            
            if(lines[i].indexOf("Humidity") != -1){

                log.info('Parsed Data: '+ lines[i]);

                var s = lines[i];
                var hindex = s.indexOf('=');
                var pindex = s.indexOf('%');
                var humid_str = s.substring(hindex,pindex).trim();
                log.info("humid:"+humid_str);


                s = s.substring(pindex);

                hindex = s.indexOf('=');
                pindex = s.indexOf('*');

                var temp_str = s.substring(hindex,pindex).trim();
                log.info("temp:"+temp_str);

                var temp_data = {
                    "sensor" : "temp",
                    "value" : temp_str
                }

                
                var humid_data = {
                    "sensor" : "humid",
                    "value" : humid_str
                }

                
                
                nats.publish('humix.sense.temp.event',JSON.stringify(temp_data));
                nats.publish('humix.sense.humid.event',JSON.stringify(humid_data));
                
                
            }
        }        
    });
    
}



setInterval(function(){
    getSensorData();
    
},10000);

/*


nats.subscribe('humix.sense.cam.command', function(msg){

    log.info('received cam command:'+msg);

    var command = JSON.parse(msg);

    if(command && command.action === 'takePic'){

        // taking a picture..

        proc = child.exec("raspistill -w 640 -h 480 -o ./pics/image.jpg ",function(err,data){
            
	        if(!err){
                log.info('done taking picture');


                fs.readFile('./pics/image.jpg', function read(err, data) {

                    if (err) {
                        log.error("error reading cam image. abort.")
                        throw err;
                    }

                    var base64Image = new Buffer(data, 'binary').toString('base64');

	                var output_image = { 'image': base64Image};        
                    nats.publish('humix.sense.cam.event', JSON.stringify(output_image));
                });

                
            }
        })

        
    }
    
});


*/
