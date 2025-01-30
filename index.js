const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ObjectId } = mongoose.Types;
const app = express();
app.use(express.json());
require('dotenv').config();

const mongoUrl = "mongodb+srv://mertkocak2811:9902051013m@habitupc1.kruic.mongodb.net/?retryWrites=true&w=majority&appName=habitupc1"

mongoose.connect(mongoUrl)
  .then(() => { console.log('database connected...') }
  ).catch((e) => {
    console.log(e)
  });

require("./Habits");
const Habit = mongoose.model("HabitInfo")

require("./User");
const User = mongoose.model("User")


// Kullanıcı Kaydı
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Kullanıcı zaten var mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email zaten kayıtlı' });

    // Yeni kullanıcı oluştur
    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ message: 'Kayıt başarılı' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/login', async (req, res) => {
  const data = await User.find();
  res.json(data);
});

app.get('/login/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Invalid user ID' });
  }
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






// JWT token doğrulama middleware'i
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: "Token gereklidir!" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Geçersiz token!" });
    }

    req.user = user;
    next();
  });
};

// Kullanıcı Bilgilerine Erişim Endpoint'i
app.get('/user', authenticateToken, async (req, res) => {
  try {
    // Kullanıcının ID'sine göre kullanıcıyı bul
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }

    res.json({ email: user.email, name: user.name }); // Kullanıcı bilgilerini döndür
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});









app.get('/habit', async (req, res) => {
  const data = await Habit.find();
  res.json(data);
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

app.post("/habit", async (req, res) => {
  const { habitTitle, habitDesc, habitDay } = req.body
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
