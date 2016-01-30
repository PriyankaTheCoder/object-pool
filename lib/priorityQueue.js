
var PriorityQueue = function() {
	    this.array = [];
	};
	PriorityQueue.prototype.push = function(data) {
	    this.array.push(data);
	    this.array.sort(function(prev, next) {
	        return prev.priority - next.priority;
	    });
	};

	PriorityQueue.prototype.pop = function() {
	    var obj = this.array.shift();
	    return obj;
	};

	PriorityQueue.prototype.getArray = function() {
	    return this.array;
	};

	var priorityQueue = new PriorityQueue();
	module.exports = priorityQueue;