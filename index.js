const express = require('express');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const app = express();
app.use(express.json());

const mongoUrl = "mongodb+srv://mertkocak2811:9902051013m@habitupc1.kruic.mongodb.net/?retryWrites=true&w=majority&appName=habitupc1"

mongoose.connect(mongoUrl)
    .then(() => { console.log('database connected...') }
    ).catch((e) => {
        console.log(e)
    });

require("./Habits");
const Habit = mongoose.model("HabitInfo")

app.get('/habit', async (req, res) => {
    const data = await Habit.find();
    res.json(data);
  });

app.post("/habit", async (req, res) => {
    const {habitTitle, habitDesc, habitDay} = req.body
    try {
        await Habit.create(
            {
                habitTitle,
                habitDesc,
                habitDay,
            }
        );
        res.send({ status: "ok", data: "habit created WELLDONE!" })
    } catch (error) {
        res.send({ status: "error", data: error })
    }
});

app.put("/habit/:id", async (req, res) => {
    //const habitId = req.params.id;
    const { habitTitle, habitDesc, habitDay, habitId } = req.body;
  
    try {
      const updatedHabit = await Habit.findByIdAndUpdate(
        habitId,
        {
          habitTitle,
          habitDesc,
          habitDay,
        },
        { new: true, runValidators: true }
      );
  
      if (!updatedHabit) {
        return res.status(404).json({ message: "Habit bulunamadı!" });
      }
  
      res.status(200).json(updatedHabit);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

/* app.delete("/habit/:id", async (req, res) => {
    const { id } = req.params;  // URL'den id alıyoruz

    try {
        // Mongoose'un findByIdAndDelete metodunu kullanarak veriyi siliyoruz
        const deletedHabit = await Habit.findByIdAndDelete(id);

        if (!deletedHabit) {
            // Eğer belirtilen id'ye sahip bir veri bulunamazsa
            return res.status(404).send({ status: "error", data: "Habit not found!" });
        }

        res.send({ status: "ok", data: "Habit deleted successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: "error", data: "Failed to delete habit!" });
    }
}); */

app.listen(3000, () => {
    console.log("server started...")
})
