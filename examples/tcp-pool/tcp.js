var tcp = function(configuration){
	this.subnet_mask = configuration.subnet_mask;
	this.connection_timeout = configuration.connection_timeout;
	this.protocol_version = configuration.protocol_version;
};


var configuration = {subnet_mask:'255.255.0.0',connection_timeout:30000,protocol_version:'IPV4'};

exports.constructor = tcp;
exports.configuration = configuration;
