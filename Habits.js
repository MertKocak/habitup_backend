const mongoose = require('mongoose');

const HabitDetailSchema = new mongoose.Schema({
  habitTitle: String,
  habitDesc: String,
  habitDay: Number,
},
{
    collection: "HabitInfo"
}

);

mongoose.model("HabitInfo", HabitDetailSchema);