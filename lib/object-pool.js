
	var EventEmitter = require('events').EventEmitter;
	var util = require('util');
	var priorityQueue = require("./priorityQueue");

	/*Object Pool*/
	var ObjectPool = function(nameOfPool, TypeOfObject, config, min, max, timeout,refreshObject) {
	    var obj;
	    this.nameOfPool = nameOfPool;
	    this.TypeOfObject = TypeOfObject;
	    this.config = config;
	    this.max = max || 1;
	    this.min = min || 0;
	    this.timeout = timeout || 30;
	    this.releasedObjects = [];
	    this.acquiredObjects = [];
	    this.numberOfObjects = 0;
	    this.refreshObject = refreshObject===void(0)?true:refreshObject;
	    this.client = 0;
	    while (this.releasedObjects.length < min) {
	        obj = this.createObject();
	        this.releasedObjects.push(obj);
	    }
	};

	/*Create an object if required*/
	ObjectPool.prototype.createObject = function() {
	    var obj;
	    function private_prop() {
	        return {
	            client: function(client) {
	                return client;
	            }
	        };
	    }
	    var c = private_prop();
	    this.client++;
	    var getClient = c.client(this.client);
	    obj = new this.TypeOfObject(this.config);
	    Object.defineProperty(obj, "client", {
	        value: getClient,
	        writable: false,
	        configurable: false,
	        enumerable: false
	    });
	    this.numberOfObjects++;
	    return obj;
	};
	
	/*acquire an object on demand*/
	ObjectPool.prototype.getObject = function(priority) {
	    var obj, ret, message, data;
	    var requestNumber = 0;
	    /* if an object exists in releasedObjects array i.e if an object is released acquire it */
	    if (this.releasedObjects && this.releasedObjects.length > 0) {
	        obj = this.releasedObjects.shift();
	        this.acquiredObjects.push(obj);
	        return {
	            data: obj
	        };
	    }
	    /*if the number of objects in the pool is less than maximum objects the pool can hold then create an object on demand*/
	    if (this.numberOfObjects < this.max) {
	        obj = this.createObject();
	        this.acquiredObjects.push(obj);
	        ret = {
	            data: obj
	        };
	    }
	    /* if number of objects in the pool exceeds maximum objects the pool can hold then push the request to a 
	     * Priority Queue which is sorted in such a way that it will process the high priority request first 
	     * whenever an object is released.
	     */
	    else {
	        message = "All objects are acquired for object pool " + this.nameOfPool + " .Your request is saved with Request Number " + requestNumber;
	        data = {
	            Request: requestNumber,
	            priority: priority
	        };
	        if (this.priorityQueue) {
	        	this.priorityQueue.push(data);
	        } else {
	            this.priorityQueue =  priorityQueue;
	            this.priorityQueue.push(data);
	        }
	        requestNumber++;
	        ret = {
	            data: {},
	            message: message
	        };
	    }
	    return ret;
	};

	/* Release an object on demand*/
	ObjectPool.prototype.releaseObject = function(object) {
	    var message, obj, ret, prioObj, priorityArray, index;
	    if (this.acquiredObjects && this.acquiredObjects.length === 0) {
	        message = "No objects found to be released";
	        return message;
	    }
	    for (var i = 0; i < this.acquiredObjects.length; i++) {
	        if (this.acquiredObjects[i].client === object.client) {
	            index = i;
	        }
	    }
	    obj = this.acquiredObjects.splice(index, 1)[0];
	    this.releasedObjects.push(obj);
	    ret = obj;
	    /* if any object is present in Priority Queue it will be acquired on priority*/
	    if (this.priorityQueue) {
	        priorityArray = this.priorityQueue.getArray();
	        if (priorityArray.length > 0) {
	            prioObj = this.priorityQueue.pop();
	            obj = this.releasedObjects.shift();
	            this.acquiredObjects.push(obj);
	            message = "Your previous request has been processed. Object " + JSON.stringify(obj) + " for Request Number " + prioObj.Request + " and priority " + prioObj.priority + " is acquired";
	            return {
	                data: obj,
	                message: message
	            };
	        }
	    }
	    return {
	        data: ret
	    };
	};

	/*free an object on demand or if an unused object is staying in queue for a long time(default 30seconds)*/
	ObjectPool.prototype.freeObject = function(object, idle) {
	    var found = false,acquired=false,index, obj, ret, i,message;
	    for (i = 0; i < this.releasedObjects.length; i++) {
	        if (this.releasedObjects[i].client === object.client) {
	            found = true;
	            index = i;
	            break;
	        }
	    }
	    if (found === true) {
	        obj = this.releasedObjects.splice(index, 1)[0];
	        message ="Idle object is freed";
	        ret = {data: obj,message: message};
	        if(idle === true){
	        	if(this.refreshObject === true){
		        	obj = this.createObject();
		 	        this.releasedObjects.push(obj);
		 	        return {data:obj,message:"Unused object is replaced by a new one",refreshed:true};
		        }
	        	else{
	        		return{data:obj,message:message,refreshed:true};
	        	}
	        }  
	   } else {
	        if (this.acquiredObjects.length > 0) {
	            for (i = 0; i < this.acquiredObjects.length; i++) {
	                if (this.acquiredObjects[i].client === object.client) {
	                	acquired = true;
	                    break;
	                }
	            }
	        }
	        if (acquired === true) {
	            ret = " The object asked to be freed is already acquired.";
	        } 
	        else if(!idle){
	        	ret = "Please provide a valid object";
	        }
	    }
	    
	    return ret;
	};

	/*drain all released Objects on demand*/
	ObjectPool.prototype.drainObjects = function() {
	    var num = 0, message;
	    if (this.acquiredObjects.length > 0) {
	        if (this.acquiredObjects.length === 1) {
	            message = this.acquiredObjects.length + " object is acquired,thus cannot be freed";
	        }else if(this.acquiredObjects.length === this.max){
	        	message = "All objects are acquired,thus cannot be freed";
	        }else {
	            message = this.acquiredObjects.length + " objects are acquired,thus cannot be freed";
	        }
	    }
	    if (this.releasedObjects.length > 0) {
	        while (this.releasedObjects.length > 0) {
	            this.freeObject(this.releasedObjects[0]);
	            num++;
	        }
	        message = "All Released objects are freed";
	    } 
	    if (num === 0) {
	        return message;
	    } else {
	        return {
	            data: num,
	            message: message
	        };
	    }
	};

	/*get all acquired objects*/
	ObjectPool.prototype.getAcquiredObjects = function() {
	    return this.acquiredObjects;
	};

	/*get all released objects*/
	ObjectPool.prototype.getReleasedObjects = function() {
	    return this.releasedObjects;
	};

	/*name of pool */
	ObjectPool.prototype.getNameOfPool = function() {
	    return this.nameOfPool;
	};
	
	/*timeout for released objects*/
	ObjectPool.prototype.getTimeout = function() {
	    return this.timeout;
	};

	/*Pool Client*/
	var PoolClient = function() {
		 this._refreshObjects = function(pool,object,callback){
			 Object.defineProperty(object,"idle",{value:true,writable:false,configurable:false,enumerable:false});
			 this.freeObject(pool,object,callback);
		 };
	};

	util.inherits(PoolClient, EventEmitter);

	PoolClient.prototype.createPool = function(nameOfPool, TypeOfObject, config, min, max, timeout,refreshObject) {
	    var create, newPool, message;
	    if (min > max) {
	        throw new Error("Minimum number of objects request is greater than Maximum");
	    }
	    create = function() {
	        return new ObjectPool(nameOfPool, TypeOfObject, config, min, max, timeout,refreshObject);
	    };
	    newPool = create();
	    if (newPool.getReleasedObjects().length === min) {
	    	if(min === 1){
	    		message = "Pool created with " + min + " object";
	    	}else{
	    		message = "Pool created with " + min + " objects";
	    	}
	        this.emit("objectCreated", null, message);
	    }
	    return newPool;
	};

	PoolClient.prototype.acquireObject = function(pool, priority, callback) {
		 function acquireAnObject() {
	        var returned;
	        returned = pool.getObject(priority);
	        if(returned){
	        if (typeof(returned) === "object") {
	            if (callback) {
	                callback(null, returned);
	            }else{
	            	this.emit("objectAcquired", null, returned);
	            }
	        } else {
	            if (callback) {
	                callback(returned);
	            }else{
	            	this.emit("objectAcquired", returned);
	            }
	        }
	    }
		}
	    setImmediate(acquireAnObject.bind(this));
	};

	PoolClient.prototype.releaseObject = function(pool, object, callback) {
	    function releaseAnObject() {
	        var returned, timeout;
	    
	        returned = pool.releaseObject(object);
	        if(returned){
	        if (typeof(returned) === "object") {
	            if (callback) {
	                callback(null, returned);
	            }else{
	            this.emit("objectReleased", null, returned);
	            }
	        } else {
	            if (callback) {
	                callback(returned);
	            }else{
	            this.emit("objectReleased", returned);
	            }
	        }
	        timeout = pool.getTimeout();
	        setTimeout(this._refreshObjects.bind(this), timeout, pool, returned.data, callback);
	    }
	    }
	    setImmediate(releaseAnObject.bind(this));
	};

	PoolClient.prototype.freeObject = function(pool, object, callback) {
	    function freeAnObject() {
	        var returned,obj,refreshed,idle;
	        if(object.hasOwnProperty("idle")){
	        	idle = object.idle;
	        	 delete object.idle;
	        }
	       
	        returned = pool.freeObject(object, idle);
	        if(returned){
	        if (typeof(returned) === "object") {
	        	refreshed  = returned.refreshed;
	        	delete returned.refreshed;
	        	if(refreshed !== void(0)){
	        		this.emit('objectRefreshed',null,returned);
	        	}
	        	else{
	        		if (callback) {
	        			callback(null, returned);
	        		}else{
	        		this.emit("objectFreed", null, returned);
	        		}
	        	}
	        } else {
	                 if (callback) {
	                    callback(returned);
	                }else{
	                this.emit("objectFreed", returned);
	                }
	        }
	    }
	    }
	    setImmediate(freeAnObject.bind(this));
	};

	PoolClient.prototype.drainObjects = function(pool, callback) {
	    function drainAllObjects() {
	        var returned;
	        returned = pool.drainObjects();
	        if(returned){
	        if (typeof(returned) === "object") {
	            if (callback) {
	                callback(null, returned);
	            }else{
	            this.emit("objectDrained", null, returned);
	            }
	        } else {
	            if (callback) {
	                callback(returned);
	            }
	            this.emit("objectDrained", returned);
	        }
	    }
	}
	    setImmediate(drainAllObjects.bind(this));
	};

	PoolClient.prototype.getAcquiredOjects = function(pool) {
	    return pool.getAcquiredObjects();
	};

	PoolClient.prototype.getReleasedObjects = function(pool) {
	    return pool.getReleasedObjects();
	};

	PoolClient.prototype.getNameofPool = function(pool) {
	    return pool.getNameOfPool();
	};

	var poolclient = new PoolClient();
	module.exports = poolclient;