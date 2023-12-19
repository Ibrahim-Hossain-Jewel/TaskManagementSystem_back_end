var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;


var NoteSchema   = new Schema({
	email: {
		type: String,
		default: null
	},
	title: {
    	type : String,
	 	default : null
    },
    description:  {
   	 	type: String,
   	 	default : null	
  	},
	dueDate: {
		type: String,
		default: null
	},
	priorityLevel: {
		type: String,
		default: null
	}, 
	category:{
		type: String,
		default: null
	}
})



module.exports = mongoose.model('Note', NoteSchema);	