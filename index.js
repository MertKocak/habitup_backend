const express = require('express');
const app = express();
const mongoose = require('mongoose');
app.use(express.json());
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cors = require('cors');

const { ObjectId } = mongoose.Types;

require('dotenv').config();
/* const { authenticateUser } = require("./middleware/auth"); */

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

app.use(cors({
  origin: 'http://localhost:3000', // Frontend'in adresi
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

//register user
app.post('/register', async (req, res) => {
  console.log("1")
  const { username, email, password } = req.body;

  // Eksik alan kontrolü
  if (!username || !email || !password) {
    console.log("2")
    return res.status(400).json({ message: 'Lütfen tüm alanları doldurun!' });
  }

  console.log("3")

  try {
    console.log("4")
    // Kullanıcı zaten var mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("5")
      return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı!' });
    }

    console.log("6")

    // Yeni kullanıcı oluştur
    await User.create({
      username,
      email,
      password
    });

    console.log("7")

    res.status(201).json({ message: 'Kayıt başarılı' });
  } catch (err) {
    console.log("8")
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası oluştu!' });
  }
});



app.get('/login', async (req, res) => {
  const data = await User.find();
  res.json(data);
});


//login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await User.findOne({ email: email });

    if (!oldUser) {
      return res.status(404).send({ status: "userNotFound", error: "Kullanıcı bulunamadı!" });
    }

    const isPasswordValid = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordValid) {
      return res.status(401).send({ status: "userNotFound", error: "Hatalı şifre!" });
    }

    const token = jwt.sign({ email: oldUser.email }, JWT_SECRET);

    return res.status(200).send({
      status: "ok",
      data: token,
      userType: oldUser.userType,
    });

  } catch (error) {
    console.error("Sunucu hatası:", error);
    return res.status(500).send({ status: "error", error: "Sunucu hatası oluştu!" });
  }
});


app.post("/userdata", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    const useremail = user.email;

    User.findOne({ email: useremail }).then((data) => {
      return res.send({ status: "Ok", data: data });
    });
  } catch (error) {
    return res.send({ error: error });
  }
});

//password sıfırlama
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  console.log(email);

  if (!user) {
    console.log("1");
    return res.status(404).json({ success: false, message: 'E-posta adresi bulunamadı.' });
  }

  // Şifre sıfırlama tokeni oluştur
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 saat geçerli
  await user.save();

  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'mertkocak.2811@gmail.com',
      pass: 'tqut qezh cydc qfsb',
    },
  });

  const mailOptions = {
    to: user.email,
    from: 'mertkocak.2811@gmail.com',
    subject: 'Şifre Sıfırlama',
    text: `Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:\n\n
    ${resetLink}\n\n
    Bu bağlantı 1 saat sonra geçersiz olacaktır.`,
  };

  await transporter.sendMail(mailOptions);
  res.json({ success: true, message: 'Şifre sıfırlama e-postası gönderildi.' });
});

// reset password
app.post("/reset-password", async (req, res) => {
  console.log("içeri girdim");

  const { token, password } = req.body;

  console.log(token);
  console.log(password);

  // Token ile kullanıcıyı bul
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }, // Token süresi geçmemiş olmalı
  });

  if (!user) {
    return res.status(400).json({ success: false, message: "Geçersiz veya süresi dolmuş token." });
  }

  // Kullanıcının şifresini güncellemeden önce yeni şifreyi hashleyelim
  const hashedPassword = await bcrypt.hash(password, 10); // bcrypt ile şifreyi hashle

  try {
    // Şifreyi güncellemek için kullanıcıyı bulup sadece şifreyi değiştiriyoruz
    const updatedUser = await User.findByIdAndUpdate(
      user._id, // Kullanıcıyı ID ile bul
      { password: hashedPassword }, // Sadece şifreyi güncelle
      { new: true, runValidators: true }
    );

    // Güncellenmiş kullanıcıyı döndür
    res.status(200).json({ success: true, message: "Şifreniz başarıyla güncellendi. Şimdi giriş yapabilirsiniz." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
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


//get all habits
app.get('/habit', async (req, res) => {
  const data = await Habit.find();
  res.json(data);
});

app.get('/habitDone/:id', async (req, res) => {

  const { userId, habitIsDone } = req.query;

  try {

    let filter = { userId };

    if (habitIsDone !== undefined) {
      filter.habitIsDone = habitIsDone;
    }

    const habit = await Habit.find(filter);
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json(habit);
  } catch (error) {
    res.status(400).json({ error: 'Invalid habit ID' });
  }
});

app.get('/habitAll/:id', async (req, res) => {
  try {
    const habit = await Habit.find({ userId: req.params.id });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json(habit);
  } catch (error) {
    res.status(400).json({ error: 'Invalid habit ID' });
  }
});

//update habit
app.put('/habit/:id', async (req, res) => {
  const habitId = req.params.id;
  const { habitTitle, habitDesc, habitDay, habitIsDone } = req.body;

  try {
    const updatedHabit = await Habit.findByIdAndUpdate(
      habitId,
      {
        habitTitle,
        habitDesc,
        habitDay,
        habitIsDone,
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

//create habit
app.post("/habit", async (req, res) => {
  const { habitTitle, habitDesc, habitDay, habitIsDone, userId } = req.body
  try {
    await Habit.create(
      {
        habitTitle,
        habitDesc,
        habitDay,
        habitIsDone,
        userId,

      }
    );
    res.send({ status: "ok", data: "habit created WELLDONE!" })
  } catch (error) {
    res.send({ status: "error", data: error })
  }
});

//delete habit
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
