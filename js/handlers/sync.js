var SyncHandler=function(){
	this.ptr = 0;
	this.command = "";
};
SyncHandler.prototype={
	_process: function (inputString, cb) {
		'use strict';
		var tokens = inputString.split(" ");
		if (this.ptr === 0) {
			if (tokens.length < 2) {
				return {result: "<br />You may setup an account with Parse so that you can backup and restore your data on Parse.com."+
				"<p><br />Commands:<br />"+
				"<br />sync backup - backup now. <br />"+
				"<br />sync restore - restore now. <br />"+
				"<br />sync disable - disable sync. <br />"+
				"<br />sync enable - enable sync. <br />"+
				"<br />sync only - do not use local storage. <br />"+
				"<br />sync link - link account with Parse (password required).<br /></p>"};
			} else {
				if(this[tokens[1]]){
					return this[tokens[1]](tokens,inputString);
				}else{
					return {result:"Command not found."};
				}
			}
		}else{
			return this[this.command](tokens, inputString);
		}
	},
	restore:function(tokens,inputString){

	},
	link:function (tokens,inputString){
		var here=this;
		if(!handler.subHandlers.user){
			return {result:"Please login first before you can link an account."};	
		}
		if(Parse.User.current()){
			return {result:"You have already logged into your Parse account."};
		}else{
			if(this.ptr==0){
				this.command = "link";
				this.ptr = 1;
				return {result: "Password:", stack: 1, more: true, command: "sync", promptType: "password"};
			}else{
				if(this.ptr==1 && this.command=="link"){
					var user = new Parse.User();
					user.set("username", handler.subHandlers.user.current_user.name);
					user.set("password", inputString);
					user.signUp(null, {
						success: function(user) {
							here.ptr=0;
							here.command=null;
							handler.postProcessInput(inputString, {result: "Sign up complete."});	
						},
						error: function(user, error) {
							here.ptr=0;
							here.command=null;
							handler.postProcessInput(inputString, {result: "Error: " + error.code + " " + error.message});
						}
					});
				}
			}
		}
	}
};
//Required to export.
handler.subHandlers["sync"]=new SyncHandler();
if(!handler.subHandlersNames.include("sync")){
	handler.subHandlersNames.push("sync");
}