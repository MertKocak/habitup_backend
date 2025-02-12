const mongoose = require('mongoose');

const HabitDetailSchema = new mongoose.Schema({
  habitTitle: String,
  habitDesc: String,
  habitDay: Number,
  habitIsDone: Boolean,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
},
{
    collection: "HabitInfo"
}

);

mongoose.model("HabitInfo", HabitDetailSchema);