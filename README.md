#OBJECT POOL

`Object Pool will give you the facility to create objects at your will and use them whenever required.`


## Features

* Hold single type of objects.
* Objects are created and placed in the pool, which can be used whenever required.
* Objects can be acquired and released on demand
* Objects can be destroyed on demand
* After a certain timeout the unused objects will get refreshed. There is a parameter named `refeshObject` which will decide whether to recreate these objects or destroy them.
* Each object pool has a priority queue. Whenever the number of request for objects exceeds the maximum number of objects and it is not possible to create any more objects, the request is saved in a priority queue and whenever an object is released the high priority request is processed first from the queue.


## Installation


>$ npm install node-object-pool


##Pool Information

####PoolClient

Used to create an object pool and access

######Methods:

**1. createPool(nameOfPool,TypeOfObject,config,min?,max?,timeout?,refreshObject?)**

Creates an Object Pool

Parameters:
>{string}    `nameOfPool`*Name of the Pool being created*

>{function}  `TypeOfObject`*Constructor for the objects to be placed in the pool*

>{object}    `config`*Parameters for the constructor*

>{number}    `min?`*optional. Minimum number of objects the pool can hold. Default : 0*

>{number}    `max?`*optional. Maximum number of objects the pool can hold. Default : 1*

>{number}    `timeout?`*optional. A time limit after which released objects will be automatically freed.*     
					*Measured in milliseconds. Default : 30000*
								
>{boolean}   `refreshObject?`*optional. Specifies whether the idle objects will be recreated/destroyed after timeout*
				*Default:true*		
								


**2. acquireObject(pool,priority,callback?)**

This function is used to acquire an object from the pool.

Parameters:
>{object}    `pool`*Object Pool instance*

>{number}    `priority`*This is usually required when the number of requests exceeds maximum number of objects a* 						*pool can hold and the pool can not create new object. Then all the requests will be*
			*stored in a priority Queue*
							
>{function}  `callback?`*optional. The function to be called, when the event occurs.*



**3. releaseObject(pool,object,callback?)**

This function is used to release an object to the pool.

Parameters:
>{object}    `pool`*Object Pool instance*

>{object}    `object`*The object that has to be released*

>{function}  `callback?`*optional. The function to be called, when the event occurs.*



**4. freeObject(pool,object,callback?)**

This function is used to free an object when not in use.Only released object can be removed from the pool.

Parameters:
>{object}    `pool`*Object Pool instance*

>{object}    `object`*The object that has to be freed.*

>{function}  `callback?`*optional. The function to be called, when the event occurs.*



**5. drainObjects(pool,callback?)**

This function in used to drain/free all the released objects when not in use. This function will remove only released objects from the pool.

Parameters:
>{object}    `pool`*Object Pool instance*

>{function}  `callback?`*optional. The function to be called, when the event occurs.*



**6. getAcquiredOjects(pool)**

Get all acquired objects.

Parameters:
>{object}    `pool`*Object Pool instance*



**7. getReleasedObjects(pool)**

Get all released objects

Parameters:
>{object}    `pool`*Object Pool instance*



**8. getNameofPool(pool)**

Get the name of the pool

Parameters:
>{object}    `pool`*Object Pool instance*



######Events:

If you are not using any callback function while acquiring,releasing or draining the objects. Then you should add an eventListener to these event types to get back response once you complete the operation.

>`objectCreated` *This event is emitted when you create the minimum number of objects while creating the object*						  *pool for the first time*

>`objectAcquired` *This event is emitted when you acquire an object*

>`objectReleased` *This event is emitted when you release an object*

>`objectFreed`*This event is emitted when you free/remove an object*

>`objectDrained`*This event is emitted when you free/remove all released objects*

>`objectRefreshed`*This event is emitted when idle resources are refreshed( destroyed/recreated )*
