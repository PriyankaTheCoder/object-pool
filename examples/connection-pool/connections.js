var Connection = function(configuration){
	this.dbConnection = configuration.dbConnection;
	this.user = configuration.user;
	this.password = configuration.password;
	this.host = configuration.host;
	this.instance = configuration.instance;
};


var configuration = {dbConnection:'hdb',user:'scott',password:'tiger',host:'localhost',instance:'00'};

exports.constructor = Connection;
exports.configuration = configuration;
