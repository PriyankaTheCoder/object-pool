var poolclient = require('..');
var assert = require('assert');

describe("poolclient",function(){
	
	it('should be an object',function(){
		assert.equal(typeof poolclient,'object');
	});
	it('should inherit from event emitter',function(done){
		poolclient.on('foo',done);
		poolclient.emit('foo');
	});
});


describe("#createpool",function(){
	var constructor = function(configuration){
		this.a = configuration.a;
		this.b = configuration.b;
	};
	var config = {a:"val1",b:"val2"};
  it('should throw an error if minimum is more than maximum',function(){
		assert.throws(poolclient.createPool.bind(this,"poolname",constructor,config,5,3,40,true), Error, "Minimum number of objects request is greater than Maximum");
	
	});
	
	it('should return an object if parameters are correct',function(){
		var pool = poolclient.createPool("poolname",constructor,config,1,3,40,true);
		assert.equal(typeof pool,'object');
	});
	
	it('should emit an event for eventtype "objectCreated" if minimum request of objects is passed',function(done){
		poolclient.on("objectCreated",done);
		var pool = poolclient.createPool("poolname",constructor,config,1,3,40,true);
	});
});

describe("#acquireObject",function(){
	var constructor = function(configuration){
		this.a = configuration.a;
		this.b = configuration.b;
	};
	var config = {a:"val1",b:"val2"};
	var pool = poolclient.createPool("poolname",constructor,config,1,3,40,true);
	
	it('should emit an event for eventtype "objectAcquired"',function(done){
		poolclient.on("objectAcquired",done);
		poolclient.acquireObject(pool,1);
	});
	
	
});

describe("#releaseObject",function(){
	var constructor = function(configuration){
		this.a = configuration.a;
		this.b = configuration.b;
	};
	var config = {a:"val1",b:"val2"};
	var pool = poolclient.createPool("poolname",constructor,config,1,3,40,true);
	it('should emit an event for eventtype "objectReleased"',function(done){
		function callback(err,obj){
			if(obj){
				poolclient.on("objectReleased",done);
				poolclient.releaseObject(pool,obj.data);
			}
		}
		poolclient.acquireObject(pool,1,callback);
	});
});

describe("#freeObject",function(){
	var Constructor = function(configuration){
		this.a = configuration.a;
		this.b = configuration.b;
	};
	var config = {a:"val1",b:"val2"};
	var pool = poolclient.createPool("poolname",Constructor,config,1,3,40,true);
	it('should emit an event "objectFreed"',function(done){
		function callback(err,obj){
			if(obj){
				poolclient.releaseObject(pool,obj,function(err,object){
					if(object){
						poolclient.on("objectFreed",done);
						poolclient.freeObject(pool,object.data);
					}
					
				});
			}
		}
		poolclient.acquireObject(pool,1,callback);
	});
	
});

describe("drainObjects",function(){
	var constructor = function(configuration){
		this.a = configuration.a;
		this.b = configuration.b;
	};
	var config = {a:"val1",b:"val2"};
	var pool = poolclient.createPool("poolname",constructor,config,1,3,40,true);
	it('should emit an event for eventtype "objectDrained"',function(done){
		function callback(err,obj){
			if(obj){
				poolclient.releaseObject(pool,obj,done);
			}
		}
		poolclient.acquireObject(pool,1,callback);
		poolclient.on("objectDrained",done);
		pool.drainObjects(pool);
	});
	
});

