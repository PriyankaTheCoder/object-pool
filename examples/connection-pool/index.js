var poolclient = require('../..');
var connections = require('./connections');
poolclient.on("objectAcquired",acquired);
poolclient.on("objectCreated",created);
poolclient.on("objectReleased",released);
poolclient.on("objectRefreshed",refreshed);
poolclient.on("objectFreed",freed);
poolclient.on("objectDrained",drained);
var connectionpool = poolclient.createPool("ConnectionPool",connections.constructor,connections.configuration,1,3,20000,true);

function acquired(err,data){
	console.log("Acquired");
	if(err){
		console.log("Released");
		return;
	}
	console.log(data);
	poolclient.releaseObject(connectionpool,data.data);
	
}

function created(err,data){
	console.log("Created");
	if(err){
		console.log("Released");
		return;
	}
	console.log(data);
}

function released(err,data){
	console.log("Released");
	if(err){
		console.log(err);
		return;
	}
	console.log(data);
	
}
function refreshed(err,data){
	console.log("Refreshed");
	if(err){
		console.log(err);
		return;
	}
	console.log(data);
	
}

function freed(err,data){
	console.log("Freed");
	if(err){
		console.log(err);
		return;
	}
	console.log(data);
}
function drained(err,data){
	console.log("Drained");
	if(err){
		console.log(err);
		return;
	}
	console.log(data);
}
function connectionTest(){
	
	poolclient.acquireObject(connectionpool,3);
	poolclient.acquireObject(connectionpool,2);
	poolclient.acquireObject(connectionpool,3);
	poolclient.acquireObject(connectionpool,3);
	poolclient.acquireObject(connectionpool,3);
	poolclient.drainObjects(connectionpool);
}

connectionTest();