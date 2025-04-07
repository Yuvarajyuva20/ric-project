const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { google } = require('googleapis');
global.punycode = require('punycode');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

//hello Grace 


// Replace with your OAuth2 credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN; // You can generate this using OAuth2 playground

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Set credentials
oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
});

// Get access token
const accessToken = async () => {
  const { token } = await oauth2Client.getAccessToken();
  return token;
};

app.use(express.json());
app.use(cors());

// Database connection with MongoDB
mongoose.connect("mongodb+srv://root:root123@cluster0.u3zo0.mongodb.net/CNRIRIC");

// API creation
app.get("/", (req, res) => {
  res.send("Express app is Running");
});

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: 'cnriric123@gmail.com',
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    refreshToken: REFRESH_TOKEN,
    accessToken: accessToken(),
  },
});

// Image storage engine (for uploading images)
const imageStorage = multer.diskStorage({
  destination: './upload/images', // Folder where images will be uploaded
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

// PDF storage engine (for uploading guide approval letters)
const pdfStorage = multer.diskStorage({
  destination: './upload/guide_approval', // Folder where PDFs will be uploaded
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

// PDF storage engine (for instrument approval)
const instrumentApprovalStorage = multer.diskStorage({
  destination: './upload/instrument_approval',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Report storage engine
const reportStorage = multer.diskStorage({
  destination: './upload/reports',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Payment proof storage engine
const paymentproofStorage = multer.diskStorage({
  destination: './upload/payment_proof',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Initialize multer upload instances
const uploadImage = multer({storage: imageStorage});
const uploadPdf = multer({ storage: pdfStorage });
const uploadInstrumentApproval = multer({ storage: instrumentApprovalStorage });
const uploadReport = multer({ storage: reportStorage });
const uploadPaymentProof = multer({ storage: paymentproofStorage });

// Serving static files (images and PDFs)
app.use('/images', express.static('upload/images'));
app.use('/guide_approval', express.static('upload/guide_approval'));
app.use('/instrument_approval', express.static('upload/instrument_approval'));
app.use('/reports', express.static('upload/reports'));
app.use('/payment_proof', express.static('upload/payment_proof'));

// Image upload route
app.post("/upload/images", uploadImage.single('inst_image'), (req, res) => {
  if (req.file) {
    res.json({
      success: 1,
      image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
  } else {
    res.status(400).json({ success: 0, message: "No image file uploaded." });
  }
});

// Guide approval letter (PDF) upload route
app.post("/upload/guide_approval", uploadPdf.single('approval'), (req, res) => {
  if (req.file) {
    res.json({
      success: 1,
      pdf_url: `http://localhost:${port}/guide_approval/${req.file.filename}`
    });
  } else {
    res.status(400).json({ success: 0, message: "No PDF file uploaded." });
  }
});


// Instrument approval file upload route
app.post("/upload/instrument_approval", uploadInstrumentApproval.single('instrument_approval'), (req, res) => {
  if (req.file) {
    res.json({
      success: 1,
      file_url: `http://localhost:${port}/instrument_approval/${req.file.filename}`
    });
  } else {
    res.status(400).json({ success: 0, message: "No instrument approval file uploaded." });
  }
});

// Reports file upload route
app.post("/upload/reports", uploadReport.single('report'), (req, res) => {
  if (req.file) {
    res.json({
      success: 1,
      report_url: `http://localhost:${port}/reports/${req.file.filename}`
    });
  } else {
    res.status(400).json({ success: 0, message: "No report file uploaded." });
  }
}); 

// Payment_proof file upload route
app.post("/upload/payment_proof", uploadPaymentProof.single('payment_proof'), (req, res) => {
  if (req.file) {
    res.json({
      success: 1,
      report_url: `http://localhost:${port}/payment_proof/${req.file.filename}`
    });
  } else {
    res.status(400).json({ success: 0, message: "No payment_proof file uploaded." });
  }
});

// Mongoose model for member
const RegformSchema = new mongoose.Schema({
    id:{type:Number,required:true},
    initials: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    designation: { type: String, required: true },
    guideApprovalLetter: { type: String, default: null },
    department: { type: String, required: true },
    institution: { type: String, required: true },
    riccoin:{type:Number,default:0},
    memberId: { type: String, default: null },
    approve:{type:Boolean, default:false}
  }, { timestamps: true });
  
  const Regform = mongoose.model("Regform", RegformSchema);
  

// Add user route
app.post('/adduser', async (req, res) => {
    let regforms =await Regform.find({});
    let id;
    if(regforms.length>0)
    {
       let last_regform_array=regforms.slice(-1);
       let last_regform=last_regform_array[0];
       id=last_regform.id+1; 
    }
    else{
        id=1;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const regform = new Regform({
      id:id,
      initials: req.body.initials,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
      designation: req.body.designation,
      guideApprovalLetter: req.body.guideApprovalLetter,
      department: req.body.department,
      institution: req.body.institution,
      riccoin:req.body.riccoin,
      memberId: req.body.memberId,
      approve: req.body.approve,
    });
  
    console.log(regform);  // Log the regform object to check its structure
  
    try {
      await regform.save();
      console.log("saved");
      res.json({
        success: true,
        name: req.body.name,
      });
    } catch (err) {
      console.log("Error saving data:", err);
      res.status(500).json({ error: "Failed to save user" });
    }
  });

// Creating APT for Deleting User
app.post('/removeuser',async(req,res)=>{
    await Regform .findOneAndDelete({email:req.body.email});
    console.log("Remove");
    res.json({
        success: true,
        name: req.body.name,
    });
})

// Creating API for getting all users where approve is false
app.get('/allrequestuser', async (req, res) => {
  try {
    let users = await Regform.find({approve : false });
    res.send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ error: "Failed to fetch users" });
  }
});

// Creating API for getting all MEMBER
app.get('/allmember', async (req, res) => {
  try {
    let users = await Regform.find({approve : true });
    res.send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ error: "Failed to fetch users" });
  }
});


// Accept user route
app.post('/acceptuser', async (req, res) => {
  try {
    const { email } = req.body;

    // Get the current year in YY format
    const currentYear = new Date().getFullYear().toString().slice(-2);

    // Find the latest user with an approved memberId to determine the next number
    const latestUser = await Regform.findOne({ approve: true })
      .sort({ memberId: -1 })
      .exec();

    // Extract and increment the number part of the memberId
    let newNumber = "001"; // Default for the first user
    if (latestUser && latestUser.memberId) {
      const lastNumber = parseInt(latestUser.memberId.slice(-3), 10);
      newNumber = String(lastNumber + 1).padStart(3, "0");
    }

    const newMemberId = `CNRIRIC${currentYear}${newNumber}`;

    // Update the user with the new values
    const updatedUser = await Regform.findOneAndUpdate(
      { email },
      {
        $set: {
          riccoin: 100,
          memberId: newMemberId,
          approve: true,
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: `User ${updatedUser.name} accepted successfully`,
      memberId: newMemberId,
    });
  } catch (error) {
    console.error("Error accepting user:", error);
    res.status(500).json({ success: false, message: "Failed to accept user" });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { memberId, password } = req.body;

  try {
    const user = await Regform.findOne({ memberId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, message: "Login successful",memberId: user.memberId, token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Send email route
app.post("/sendemail", async (req, res) => {
  const { email, memberId } = req.body;

  try {
    // Email message details
    const mailOptions = {
      from: "cnriric123@gmail.com", // Sender email address
      to: email, // Recipient email address
      subject: "Membership Accepted",
      text: `Congratulations! You have been accepted as a member. Your Member ID is: ${memberId}`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ success: false, message: "Failed to send email" });
      }

      console.log("Email sent: " + info.response);
      res.json({ success: true, message: "Email sent successfully" });
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

app.get('/user/:memberId', async (req, res) => {
  const { memberId } = req.params;
  try {
    const user = await Regform.findOne({ memberId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, riccoin: user.riccoin });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API Endpoint to fetch member details by memberId
app.get('/member/:memberId', async (req, res) => {
  const { memberId } = req.params; // Get memberId from the URL params

  try {
    // Find the member by memberId (not the default _id)
    const member = await Regform.findOne({ memberId: memberId });

    if (!member) {
      return res.status(404).send({ message: 'Member not found' });
    }
    // Send the member details in the response
    res.json(member);
  } catch (error) {
    console.error("Error fetching member details:", error);
    res.status(500).send({ message: "Failed to fetch member details" });
  }
});

// Assuming the file is on the server or hosted somewhere
app.get('/download/:filename', (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, 'guide_approval', fileName); // Change this to your file path

  // Check if the file exists and send it as a download response
  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Error downloading file.");
    }
  });
}); 

// API to update RIC coins for a user by memberId
app.post('/updateRicCoin', async (req, res) => {
  const { memberId, ricCoinDelta } = req.body;

  try {
    // Find the user by memberId and update the riccoin value
    const updatedUser = await Regform.findOneAndUpdate(
      { memberId },
      { $inc: { riccoin: ricCoinDelta } }, // Increment riccoin by the delta value
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: `RIC coins updated successfully for user ${updatedUser.name}`,
      riccoin: updatedUser.riccoin,
    });
  } catch (error) {
    console.error("Error updating RIC coins:", error);
    res.status(500).json({ success: false, message: "Failed to update RIC coins" });
  }
});


////////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////


// Create OTP model schema (add this before your routes)
const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: '5m' } } // OTP expires after 5 minutes
});

// Change this line to use a different variable name if needed
const OTPModel = mongoose.model('OTP', OTPSchema);

// Generate OTP and send email
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    // Check if user exists
    const user = await Regform.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate OTP (6-digit number)
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Save OTP to database
    await OTPModel.create({ email, otp, expiresAt });

    // Send email with OTP
    const mailOptions = {
      from: 'cnriric123@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. This OTP is valid for 5 minutes.`,
      html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>This OTP is valid for 5 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    // Find the most recent OTP for this email
    const otpRecord = await OTPModel.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Trim OTP before comparing to avoid spaces mismatch
    if (otpRecord.otp.trim() !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Check OTP expiry
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    res.json({ success: true, message: 'OTP verified' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
});


// Reset password
app.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  try {
    // Verify OTP first
    const otpRecord = await OTPModel.findOne({ email }).sort({ createdAt: -1 });
    
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }
    
    // Update user password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Regform.findOneAndUpdate({ email }, { password: hashedPassword });
    
    // Delete the used OTP
    await OTPModel.deleteMany({ email });
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

//////////////////////////////////////
///////////////////////////////////////
//////////////////////////////////////

const InstrumentSchema = new mongoose.Schema(
  {
    ins_id: { type: String, required: true, unique: true },
    instrumentName: { type: String, required: true },
    inst_image: { type: String, required: true },

    // Instrument Types with their own amount types (default: null)
    instrumentTypes: {
      type: [
        {
          name: { type: String, required: true }, // e.g., Acoustic, Electric
          amountTypes: [
            {
              name: { type: String, required: true }, // e.g., "Student", "Outsider"
              amount: { type: Number, required: true } // e.g., 500, 700
            }
          ]
        }
      ],
      default: null, // ✅ Can be null
    },

    // Elements with their own amount types (default: null)
    elements: {
      type: [
        {
          name: { type: String, required: true }, // e.g., Strings, Body
          amountTypes: [
            {
              name: { type: String, required: true }, // e.g., "Repair", "Replacement"
              amount: { type: Number, required: true } // e.g., 100, 200
            }
          ]
        }
      ],
      default: null, // ✅ Can be null
    },

    // GST values
    gst: {
      sgst: { type: Number, required: true }, // SGST percentage
      cgst: { type: Number, required: true }, // CGST percentage
    },

    features: { type: String, required: true },

    // General availability of the instrument
    generalAvailability: { type: Boolean, required: true },

 // Default slots available every day
 defaultSlots: {
  type: [String], // e.g., ["9:30 AM - 10:30 AM", "11:00 AM - 12:00 PM"]
  required: true,
},

// Slot-based availability (only stores booked slots)
bookedSlots: {
  type: [
    {
      date: { type: String, required: true }, // e.g., "2025-02-20"
      slot: { type: String, required: true }, // e.g., "9:30 AM - 10:30 AM"
      isBooked: { type: Boolean, required: true, default: true }, // ✅ Marks the slot as booked
    }
  ],
  default: [],
},
    // Dynamic amount types (default: null)
    d_amountTypes: {
      type: [
        {
          name: { type: String, required: true }, // e.g., "Student", "Outsider"
          amount: { type: Number, required: true } // e.g., 500, 700
        }
      ],
      default: null, // ✅ Can be null
    },
    hour_basis: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const Instrument = mongoose.model("Instrument", InstrumentSchema);
  

// 🟢 Add a New Instrument
app.post('/add_instrument', async (req, res) => {
  try {
    let instruments = await Instrument.find({});
    let ins_id;

    // Generate a unique instrument ID
    if (instruments.length > 0) {
      let lastInstrument = instruments.slice(-1)[0];
      let lastInsNumber = parseInt(lastInstrument.ins_id.replace('ins', ''));
      ins_id = `ins${lastInsNumber + 1}`;
    } else {
      ins_id = 'ins1';
    }

    // Create new instrument
    const instrument = new Instrument({
      ins_id: ins_id,
      instrumentName: req.body.instrumentName,
      inst_image: req.body.inst_image,
      gst: req.body.gst || { sgst: 0, cgst: 0 }, // Default GST if not provided
      features: req.body.features,
      generalAvailability: req.body.generalAvailability ?? true, // Default true if not provided

      // Optional Fields (can be null)
      instrumentTypes: req.body.instrumentTypes ?? null,
      elements: req.body.elements ?? null,
      defaultSlots: req.body.defaultSlots ?? [], 
      d_amountTypes: req.body.d_amountTypes ?? null,
      hour_basis: req.body.hour_basis ?? false,
    });

    console.log("Instrument to be saved:", instrument);

    // Save the instrument to the database
    await instrument.save();
    console.log("Instrument saved successfully");

    res.json({
      success: true,
      message: "Instrument added successfully",
      instrument: instrument,
    });
  } catch (err) {
    console.error("Error saving instrument:", err);
    res.status(500).json({ error: "Failed to save instrument" });
  }
});

// 🟢 Update an Existing Instrument
app.put('/updateinstrument/:ins_id', async (req, res) => {
  try {
    const { ins_id } = req.params;

    // Find the instrument by ins_id
    let instrument = await Instrument.findOne({ ins_id });
    if (!instrument) {
      return res.status(404).json({ success: false, message: "Instrument not found" });
    }

    // Update fields if provided in the request body
    instrument.instrumentName = req.body.instrumentName ?? instrument.instrumentName;
    instrument.inst_image = req.body.inst_image ?? instrument.inst_image;
    instrument.gst = req.body.gst ?? instrument.gst;
    instrument.features = req.body.features ?? instrument.features;
    instrument.generalAvailability = req.body.generalAvailability ?? instrument.generalAvailability;
    instrument.instrumentTypes = req.body.instrumentTypes ?? instrument.instrumentTypes;
    instrument.elements = req.body.elements ?? instrument.elements;
    instrument.defaultSlots = req.body.defaultSlots ?? instrument.defaultSlots;
    instrument.d_amountTypes = req.body.d_amountTypes ?? instrument.d_amountTypes;
// ✅ Update booked slots if provided in the request body
if (req.body.bookedSlots) {
  const newBookedSlots = req.body.bookedSlots;

  // Merge existing booked slots with new ones, avoiding duplicates
  instrument.bookedSlots = [
    ...instrument.bookedSlots,
    ...newBookedSlots.filter(
      (newSlot) =>
        !instrument.bookedSlots.some(
          (existingSlot) =>
            existingSlot.date === newSlot.date && existingSlot.slot === newSlot.slot
        )
    ),
];    
}
instrument.hour_basis = req.body.hour_basis ?? instrument.hour_basis;
    console.log("Instrument to be updated:", instrument);

    // Save the updated instrument to the database
    await instrument.save();
    console.log("Instrument updated successfully");

    res.json({
      success: true,
      message: "Instrument updated successfully",
      instrument,
    });
  } catch (err) {
    console.error("Error updating instrument:", err);
    res.status(500).json({ success: false, error: "Failed to update instrument" });
  }
});

// 🟢 Book a Slot
app.post('/book-slot', async (req, res) => {
  try {
    const { ins_id, date, slot } = req.body;

    if (!ins_id || !date || !slot) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const instrument = await Instrument.findOne({ ins_id });

    if (!instrument) {
      return res.status(404).json({ success: false, message: "Instrument not found" });
    }

    // ✅ Ensure date format matches existing records
    const dateKey = new Date(date).toISOString().split('T')[0];

    // ✅ Check if slot is already booked
    const isAlreadyBooked = instrument.bookedSlots.some(
      (booked) => booked.date === dateKey && booked.slot === slot
    );

    if (isAlreadyBooked) {
      return res.status(400).json({ success: false, message: "Slot already booked" });
    }

    // ✅ Add the new booked slot
    instrument.bookedSlots.push({ date: dateKey, slot, isBooked: true });

    // ✅ Save the updated instrument
    await instrument.save();

    res.status(200).json({ success: true, message: "Slot booked successfully", bookedSlots: instrument.bookedSlots });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({ success: false, message: "Failed to book slot" });
  }
});


app.get("/booked-slots", async (req, res) => {
  try {
    const { instrumentId, date } = req.query;

    if (!instrumentId) {
      return res.status(400).json({ success: false, message: "Instrument ID is required" });
    }

    // Find by `ins_id` instead of `_id`
    const instrument = await Instrument.findOne({ ins_id: instrumentId });

    if (!instrument) {
      return res.status(404).json({ success: false, message: "Instrument not found" });
    }

    // Get booked slots for the selected date
    const bookedSlots = instrument.bookedSlots.filter(slot => slot.date === date);

    res.json({ success: true, bookedSlots });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// 🟢 Get Availability for a Specific Date
app.get('/availability/:ins_id/:date', async (req, res) => {
  try {
    const { ins_id, date } = req.params;
    const instrument = await Instrument.findOne({ ins_id });

    if (!instrument) {
      return res.status(404).json({ success: false, message: "Instrument not found" });
    }

    // ✅ Change: Format the date properly to match the key in availability map
    const dateKey = new Date(date).toISOString().split('T')[0];
    const bookedSlots = instrument.availability.get(dateKey) || [];  // ✅ Change: default to an empty array if not found

    res.status(200).json({ success: true, availability: bookedSlots });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ success: false, message: "Failed to fetch availability" });
  }
});


// 🟢 Delete Instrument by ID
app.post('/remove_instrument', async (req, res) => {
  try {
    const deletedInstrument = await Instrument.findOneAndDelete({ ins_id: req.body.ins_id });

    if (!deletedInstrument) {
      return res.status(404).json({
        success: false,
        message: "Instrument not found",
      });
    }

    console.log("Instrument removed:", deletedInstrument.instrumentName);
    res.json({
      success: true,
      message: "Instrument removed successfully",
      instrumentName: deletedInstrument.instrumentName,
    });
  } catch (error) {
    console.error("Error removing instrument:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove instrument",
    });
  }
});

// 🟢 Get All Instruments
app.get('/allinstrument', async (req, res) => {
  try {
    let instruments = await Instrument.find({}, { _id: 0, __v: 0 }); // ✅ Better projection
    res.send(instruments);
  } catch (error) {
    console.error("Error fetching instrument:", error);
    res.status(500).send({ error: "Failed to fetch instrument" });
  }
});

// 🟢 Get Single Instrument by ID
app.get('/instrument/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const instrument = await Instrument.findOne({ ins_id: id });
    if (!instrument) {
      return res.status(404).json({ success: false, message: 'Instrument not found' });
    }
    res.json({ success: true, instrument });
  } catch (error) {
    console.error('Error fetching instrument details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////



const BookingSchema = new mongoose.Schema(
  {
    booking_id: { type: String, required: true, unique: true }, // Unique Booking ID
    instrument_id: { type: String, required: true }, // Reference to Instrument
    instrument_name: { type: String, required: true }, // Instrument Name
    
    slots: {
      type: [String], // Selected slots (e.g., ["9:30 AM - 10:30 AM"])
      required: true,
    },

    date: { type: String, required: true }, // Booking Date (e.g., "2025-03-10")

    no_of_hours: { type: Number, default: null }, // Number of Hours
    no_of_samples: { type: Number, default: null }, // Number of Samples
    
    instrument_type: { type: String,  default: null}, // Selected Instrument Type
    element_type: {
      type: [
        {
          elementName: { type: String, required: true }, // Element Name (e.g., "Alkalinity")
          samples: { type: Number, required: true } // Number of samples for this element
        }
      ],
      default: null, // Default is null instead of an empty array
    },
     // Selected Element Type

    amount: { type: Number, required: true }, // Base Amount
    gst: {
      sgst: { type: Number, required: true }, // SGST Amount
      cgst: { type: Number, required: true }, // CGST Amount
    },
    total_amount: { type: Number, required: true }, // Total Amount after GST

    member_id: { type: String, default: null }, // Reference to Registered Member
    name: { type: String, required: true }, // Member's Name
    designation: { type: String, required: true }, // Designation
    department: { type: String, required: true }, // Department
    mobile_number: { type: String, required: true }, // Mobile Number
    email: { type: String, required: true }, // Email
    guide_name: { type: String, required: true }, // Guide Name
    guide_email: { type: String, required: true }, // Guide Email
    guide_approval_letter: { type: String, default: null }, // Guide Approval Letter
    discount: { type: Number, default: null },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Completed"],
      default: "Pending",
    }, // Booking Status
    report: { type: String, default: null }, // Report (if applicable)
    staff_incharge: { type: String, default: null }, // Staff Incharge
    
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", BookingSchema);


// 🟢 Book an Instrument
app.post("/book_instrument", async (req, res) => {
  try {
    // Get current date components
    const now = new Date();
    const yearShort = now.getFullYear().toString().slice(-2); // Last 2 digits of year
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthShort = monthNames[now.getMonth()]; // Current month abbreviation
    
    // Find the latest booking with the current month/year prefix
    const currentPrefix = `CNRI${yearShort}${monthShort}`;
    const latestBooking = await Booking.findOne({
      booking_id: new RegExp(`^${currentPrefix}`)
    }).sort({ booking_id: -1 });
    
    let sequenceNumber;
    if (latestBooking) {
      // Extract the numeric part and increment
      const lastNumber = parseInt(latestBooking.booking_id.replace(currentPrefix, ""));
      sequenceNumber = (lastNumber + 1).toString().padStart(3, '0');
    } else {
      // First booking of this month/year
      sequenceNumber = '001';
    }

    const booking_id = `${currentPrefix}${sequenceNumber}`;

    // Create new booking
    const booking = new Booking({
      booking_id: booking_id,
      instrument_id: req.body.instrument_id,
      instrument_name: req.body.instrument_name,
      slots: req.body.slots ?? [],
      date: req.body.date,
      no_of_hours: req.body.no_of_hours ?? null,
      no_of_samples: req.body.no_of_samples ?? 0,
      instrument_type: req.body.instrument_type,
      element_type: req.body.element_type,
      amount: req.body.amount,
      gst: req.body.gst ?? { sgst: 0, cgst: 0 },
      total_amount: req.body.total_amount,
      member_id: req.body.member_id,
      name: req.body.name,
      designation: req.body.designation,
      department: req.body.department,
      mobile_number: req.body.mobile_number,
      email: req.body.email,
      guide_name: req.body.guide_name,
      guide_email: req.body.guide_email,
      guide_approval_letter: req.body.guide_approval_letter ?? null,
      status: req.body.status ?? "pending",
      report: req.body.report ?? null,
      staff_incharge: req.body.staff_incharge,
    });

    console.log("Booking to be saved:", booking);

    // Save booking to the database
    await booking.save();
    console.log("Booking saved successfully");

    // Send Booking ID to the user via email
    const mailOptions = {
      from: "cnriric123@gmail.com",
      to: booking.email,
      subject: "Booking Confirmation",
      text: `Your booking has been successfully created. Your Booking ID is: ${booking.booking_id}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.json({
      success: true,
      message: "Instrument booked successfully",
      booking: booking,
    });
  } catch (err) {
    console.error("Error saving booking:", err);
    res.status(500).json({ error: "Failed to book instrument" });
  }
});

// 🟢 Get All Bookings
app.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json({
      success: true,
      message: "All bookings fetched successfully",
      bookings: bookings,
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});


// 🟢 Get Single Booking by ID
app.get("/booking/:id", async (req, res) => {
  try {
    const booking = await Booking.findOne({ booking_id: req.params.id });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({
      success: true,
      message: "Booking fetched successfully",
      booking: booking,
    });
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});


// 🟢 Update Booking by ID
app.put("/booking/:id", async (req, res) => {
  try {
    const updatedBooking = await Booking.findOneAndUpdate(
      { booking_id: req.params.id },
      { $set: req.body }, // Update fields dynamically
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ error: "Failed to update booking" });
  }
});

// Fetch all booking requests with sorting by date
app.get("/allbookingrequests", async (req, res) => {
  try {
    const { date } = req.query; // Get date from query parameters

    let query = {};
    if (date) {
      query.date = date; // If date is provided, filter bookings
    }

    const bookings = await Booking.find(query)
      .sort({ date: 1 }); // Sort by date ascending

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching booking requests:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Endpoint to reject a booking and update its status to "Rejected"
app.delete('/reject-booking/:bookingId', async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Step 1: Find the booking record
    const booking = await Booking.findOne({ booking_id: bookingId });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Step 2: Update the booking status to "Rejected"
    await Booking.updateOne(
      { booking_id: bookingId },
      { $set: { status: "Rejected" } }
    );

    // Step 3: Remove all corresponding booked slots from the Instrument schema
    const instrument = await Instrument.findOne({ ins_id: booking.instrument_id });

    if (instrument) {
      // Iterate over all slots in the booking
      booking.slots.forEach((slot) => {
        // Filter out the booked slots that match the date and slot from the booking
        instrument.bookedSlots = instrument.bookedSlots.filter(
          (bookedSlot) => !(bookedSlot.date === booking.date && bookedSlot.slot === slot)
        );
      });

      // Save the updated instrument
      await instrument.save();
    }

    res.json({ success: true, message: 'Booking rejected and all slots removed successfully' });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ success: false, message: 'An error occurred while rejecting the booking' });
  }
});

// Endpoint to complete a booking and update its status to "Completed"
app.put('/complete-booking/:bookingId', uploadReport.single('report'), async (req, res) => {
  const { bookingId } = req.params;
  const { staff_incharge } = req.body;
  const reportFile = req.file; // File uploaded using `uploadReport` middleware

  try {
    // Step 1: Find the booking record
    const booking = await Booking.findOne({ booking_id: bookingId });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Step 2: Update the booking fields
    booking.status = "Completed"; // Set status to "Completed"
    booking.staff_incharge = staff_incharge; // Update staff incharge

    // Step 3: If a report file is uploaded, save its path
    if (reportFile) {
      booking.report = `http://localhost:${port}/reports/${reportFile.filename}`; // Save the file URL
    }

    // Step 4: Save the updated booking
    await booking.save();

    res.json({ success: true, message: 'Booking completed successfully', booking });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({ success: false, message: 'An error occurred while completing the booking' });
  }
});

// Endpoint to accept a booking and update its status to "Accepted"
app.put('/accept-booking/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  const { discount } = req.body || { discount: 0 };

  try {
    // Step 1: Find the booking record
    const booking = await Booking.findOne({ booking_id: bookingId });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Step 2: Update the booking status to "Accepted"
    await Booking.updateOne(
      { booking_id: bookingId },
      { 
        $set: { 
          status: "Accepted",
          discount: discount || 0 // Store discount, default to 0 if not provided
        }
      }
    );
    res.json({ success: true, message: 'Booking accepted successfully' });
  } catch (error) {
    console.error('Error accepting booking:', error);
    res.status(500).json({ success: false, message: 'An error occurred while accepting the booking' });
  }
});


/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////


const PaymentSchema = new mongoose.Schema(
  {
    booking_id: { type: String, required: true, unique: true }, // Reference to Booking ID
    member_id: { type: String, default: null },
    amount: { type: Number, required: true }, // Base Amount before GST

    gst: {
      sgst: { type: Number, required: true }, // SGST Amount
      cgst: { type: Number, required: true }, // CGST Amount
    },

    total_amount: { type: Number, required: true }, // Total Amount after GST
    discount_percentage: { type: Number, default: 0 }, // Discount Percentage (if any)
    final_price: { type: Number, required: true }, // Final Payable Amount after discount
    discount_amount: { type: Number, default: 0 }, // Add this field
    riccoin_deduction: { type: Number, default: 0 }, // Add this field
    paid_status: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    }, // Payment Status (Pending/Paid/Failed)
    transaction_id: { type: String, default: null }, // Add if not present
    payment_proof: { type: String, default: null }, // Add this field for storing the file path/URL

  },
  { timestamps: true } // Automatically adds createdAt & updatedAt fields
);

const Payment = mongoose.model("Payment", PaymentSchema);

// 🟢 Create a new payment entry
app.post("/process_payment", async (req, res) => {
  try {
    const {
      booking_id,
      member_id,
      amount,
      gst,
      total_amount,
      paid_status,
    } = req.body;

    // Set final_price same as total_amount (No discount applied)
    const final_price = total_amount;

    // Create Payment Entry
    const payment = new Payment({
      booking_id,
      member_id,
      amount,
      gst,
      total_amount,
      final_price, // No discount, so final_price = total_amount
      paid_status,
    });

    await payment.save();

    res.json({
      success: true,
      message: "Payment entry created successfully",
      payment,
    });
  } catch (err) {
    console.error("Error processing payment:", err);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

// Update payment endpoint
app.put("/payment/:booking_id", async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { 
      paid_status, 
      final_amount, 
      discount_percentage, 
      discount_amount,
      riccoin_deduction, 
      payment_proof,
      transaction_id
    } = req.body;

    const updateData = {
      paid_status,
      final_price: final_amount,
      discount_percentage,
      discount_amount,
      riccoin_deduction,
      payment_proof,
      transaction_id,
      updatedAt: new Date()
    };

    const updatedPayment = await Payment.findOneAndUpdate(
      { booking_id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({
      success: true,
      message: "Payment updated successfully",
      payment: updatedPayment
    });
  } catch (err) {
    console.error("Error updating payment:", err);
    res.status(500).json({ error: "Failed to update payment" });
  }
});


// Remove one of the duplicate GET endpoints
app.get("/payment/:booking_id", async (req, res) => {
  try {
    const payment = await Payment.findOne({ booking_id: req.params.booking_id });

    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: "No payment found with this Booking ID." 
      });
    }

    res.json({ success: true, payment });
  } catch (err) {
    console.error("Error fetching payment:", err);
    res.status(500).json({ error: "Failed to fetch payment details." });
  }
});

// Get all payments
app.get("/all-payments", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// Get payment by booking ID
app.get("/payment/:booking_id", async (req, res) => {
  try {
    const payment = await Payment.findOne({ booking_id: req.params.booking_id });

    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: "No payment found with this Booking ID." 
      });
    }

    res.json({ success: true, payment });
  } catch (err) {
    console.error("Error fetching payment:", err);
    res.status(500).json({ error: "Failed to fetch payment details." });
  }
});

// Get payments by date range (updated)
app.get("/payments-by-date", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Both startDate and endDate are required" });
    }

    // Convert to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    const payments = await Payment.find({
      createdAt: {
        $gte: start,
        $lte: end
      }
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: payments });
  } catch (err) {
    console.error("Error fetching payments by date range:", err);
    res.status(500).json({ error: "Failed to fetch payments by date range" });
  }
});

// Update payment endpoint (updated)
app.put("/payment/:booking_id", async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { paid_status, final_amount, transaction_id } = req.body;

    const updateData = {
      paid_status,
      final_price: final_amount,
      updatedAt: new Date()
    };

    if (paid_status === "Paid" && transaction_id) {
      updateData.transaction_id = transaction_id;
    } else if (paid_status !== "Paid") {
      updateData.transaction_id = null;
    }

    const updatedPayment = await Payment.findOneAndUpdate(
      { booking_id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({
      success: true,
      message: "Payment updated successfully",
      payment: updatedPayment
    });
  } catch (err) {
    console.error("Error updating payment:", err);
    res.status(500).json({ error: "Failed to update payment" });
  }
});

// Start the server
app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on port " + port);
  } else {
    console.log("Error: " + error);
  }
});



