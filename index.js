const express = require('express');
const app = express();
const mongoose = require('mongoose');
app.use(express.json());
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const { ObjectId } = mongoose.Types;

require('dotenv').config();
const { authenticateUser } = require("./middleware/auth");

const mongoUrl = "mongodb+srv://mertkocak2811:9902051013m@habitupc1.kruic.mongodb.net/?retryWrites=true&w=majority&appName=habitupc1"
const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe";

mongoose.connect(mongoUrl)
  .then(() => { console.log('database connected...') }
  ).catch((e) => {
    console.log(e)
  });



require("./models/Habits");
const Habit = mongoose.model("HabitInfo")

require("./models/User");
const User = mongoose.model("UserInfo")


// Kullanıcı Kaydı
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Kullanıcı zaten var mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email zaten kayıtlı' });

    // Yeni kullanıcı oluştur
    await User.create({
      username, email, password
    });
    res.status(201).json({ message: 'Kayıt başarılı' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/login', async (req, res) => {
  const data = await User.find();
  res.json(data);
});


// Kullanıcı Girişi
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Kullanıcı bulunamadı' });

    // Şifre doğrulama
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Geçersiz şifre' });

    // JWT oluştur
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Kullanıcı bulunamadı' });

    // Şifre doğrulama
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Geçersiz şifre' });

    res.status(200).json({ user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); */



/**-------------------------------------------------- */


// Habitleri çekme işlemi
app.get('/habit', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;  // Token'dan alınan userId
    const userHabits = await Habit.find({ user: userId }); // Kullanıcıya özel filtre
    res.status(200).json(userHabits);
  } catch (error) {
    console.error(error);  // Hata logu
    res.status(500).json({ error: "Could not fetch habits" });
  }
});

app.get('/habit/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json(habit);
  } catch (error) {
    res.status(400).json({ error: 'Invalid habit ID' });
  }
});

app.put('/habit/:id', async (req, res) => {
  const habitId = req.params.id;
  const { habitTitle, habitDesc, habitDay } = req.body;

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

app.post("/habit", authenticateUser, async (req, res) => {
  try {
    const { habitTitle, habitDesc, habitDay } = req.body
    const userId = req.user.id; // Kimlik doğrulama ile gelen kullanıcı ID'si

    const newHabit = new Habit({
      habitTitle,
      habitDesc,
      habitDay,
      user: userId, // Habit ile kullanıcıyı ilişkilendiriyoruz
    });

    /*  await Habit.create(
       {
         habitTitle,
         habitDesc,
         habitDay,
       }
     ); */

    await newHabit.save();

    res.send({ status: "ok", data: "habit created WELLDONE!" })
  } catch (error) {
    res.send({ status: "error", data: error })
  }
});

app.delete("/habit/:id", async (req, res) => {
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
});

app.listen(3000, () => {
  console.log("server started...")
})
