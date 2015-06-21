var log = require('logule').init(module, 'bright');
var workDir      = '/home/liuch/workspace/humix/humix-sense/controls/humix-sense-bright';
var pythonScript = workDir + '/bright.py';
var processing   = false;
var isClosed     = true;

var ps   = require('child_process');
var nats = require('nats').connect();//connect immediately


nats.subscribe('humix.sense.bright.status.ping', function(request,replyto){
    log.info('Sending Pong');
    nats.publish(replyto, 'humix.sense.bright.status.pong');
    
});

try {

    ps.exec('sudo python ' + pythonScript);
    isClosed = true;

} catch (e) {
    console.error('initial open failed' + e);
}
