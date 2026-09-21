const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Parse comma-separated URLs from env, defaulting to empty array if not provided
const envUrls = process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',').map(url => url.trim()) : [];
const allowedOrigins = ['http://localhost:5173', ...envUrls];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback: allow all to prevent breaking, can restrict later by throwing an error here
    }
  },
  credentials: true
}));
app.use(express.json());

// Data
const services = [
  {
    id: 1,
    icon: '🐕',
    title: 'Dog Training',
    description: 'Expert dog training to turn your furry friend into a well-behaved companion. Obedience, behavior, and socialization programs.',
    features: ['Basic Obedience', 'Advanced Commands', 'Behavior Correction', 'Puppy Training'],
  },
  {
    id: 2,
    icon: '🦮',
    title: 'Pet Walking',
    description: 'Daily pet walking services to keep your pets active, healthy, and happy with our experienced walkers.',
    features: ['Solo Walks', 'Group Walks', 'GPS Tracking', 'Post-Walk Report'],
  },
  {
    id: 3,
    icon: '✂️',
    title: 'Pet Grooming',
    description: 'Professional grooming to make your pets look and feel their very best with premium products.',
    features: ['Bath & Dry', 'Hair Trimming', 'Nail Clipping', 'Ear Cleaning'],
  },
  {
    id: 4,
    icon: '🏠',
    title: 'Pet Daycare & Boarding',
    description: 'Safe and fun pet day care where pets play, socialize, and are loved while you are away.',
    features: ['Full Day Care', 'Overnight Boarding', 'Playtime Sessions', '24/7 Supervision'],
  },
];

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    pet: 'Max (Golden Retriever)',
    rating: 5,
    text: 'Happy Pet Training transformed Max from a hyperactive puppy into the most well-behaved dog. The trainers are incredibly patient and professional!',
    avatar: 'PS',
  },
  {
    id: 2,
    name: 'Rahul Mehta',
    pet: 'Luna (Labrador)',
    rating: 5,
    text: 'The grooming service is top-notch! Luna always comes back looking beautiful and smelling great. The team genuinely cares about every pet.',
    avatar: 'RM',
  },
  {
    id: 3,
    name: 'Anjali Singh',
    pet: 'Bruno (Beagle)',
    rating: 5,
    text: 'Boarding service gave me complete peace of mind during my vacation. Bruno was treated like royalty. Highly recommend to all pet parents!',
    avatar: 'AS',
  },
  {
    id: 4,
    name: 'Vikram Patel',
    pet: 'Coco (Poodle)',
    rating: 5,
    text: 'Best pet training in Mumbai! Coco learned so much in just 4 weeks. The personalized approach makes all the difference.',
    avatar: 'VP',
  },
];

const faqs = [
  {
    id: 1,
    question: 'What age can my puppy start training?',
    answer: 'Puppies can begin basic training as early as 8 weeks old! Early socialization and training is incredibly beneficial for their development.',
  },
  {
    id: 2,
    question: 'How long does a typical training program take?',
    answer: 'Basic obedience programs typically run 4-6 weeks with sessions 2-3 times per week. Advanced programs can take 8-12 weeks depending on goals.',
  },
  {
    id: 3,
    question: 'Do you offer home visits for training?',
    answer: 'Yes! We offer in-home training sessions for dogs that are more comfortable learning in their own environment. Contact us to book.',
  },
  {
    id: 4,
    question: 'What breeds do you train?',
    answer: 'We train all breeds! From tiny Chihuahuas to large Great Danes. Our trainers are experienced with all temperaments and breeds.',
  },
  {
    id: 5,
    question: 'Is the daycare facility safe?',
    answer: 'Absolutely. Our facility is fully secured, climate-controlled, and monitored 24/7. All pets are vaccinated before entry for everyone\'s safety.',
  },
  {
    id: 6,
    question: 'What are your operating hours?',
    answer: 'We operate Monday-Saturday 8AM-8PM and Sunday 9AM-6PM. Emergency boarding is available 24/7 for our enrolled members.',
  },
];

const blogPosts = [
  {
    id: 1,
    title: '5 Common Dog Behavior Problems & How to Fix Them',
    excerpt: 'From excessive barking to leash pulling — we break down the most common issues pet parents face and provide expert solutions.',
    category: 'Behavior',
    readTime: '5 min read',
    emoji: '🐾',
  },
  {
    id: 2,
    title: 'Puppy Socialization: The Critical Window You Can\'t Miss',
    excerpt: 'The first 16 weeks of your puppy\'s life are the most important for socialization. Here\'s exactly what to do.',
    category: 'Training',
    readTime: '7 min read',
    emoji: '🐶',
  },
  {
    id: 3,
    title: 'Grooming at Home: Tips from Our Expert Groomers',
    excerpt: 'Keep your pet looking and feeling fresh between professional appointments with these easy-to-follow grooming tips.',
    category: 'Grooming',
    readTime: '4 min read',
    emoji: '✨',
  },
];

// Routes
app.get('/api/services', (req, res) => {
  res.json({ success: true, data: services });
});

app.get('/api/testimonials', (req, res) => {
  res.json({ success: true, data: testimonials });
});

app.get('/api/faqs', (req, res) => {
  res.json({ success: true, data: faqs });
});

app.get('/api/blogs', (req, res) => {
  res.json({ success: true, data: blogPosts });
});

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail service
  auth: {
    user: process.env.EMAIL_USER || 'happypettraining25@gmail.com',
    pass: process.env.EMAIL_PASS, // App Password required
  },
});

app.post('/api/contact', async (req, res) => {
  const { name, phone, city, email, pincode } = req.body;
  
  if (!name || !phone || !city) {
    return res.status(400).json({ success: false, message: 'Name, phone, and city are required.' });
  }

  // Beautiful HTML Email Template matching the brand UI
  const htmlContent = `
    <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FDF9F6; border: 1px solid #F3D5E8; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(198,46,123,0.08);">
      <div style="background-color: #C62E7B; padding: 35px 30px; text-align: center; border-bottom: 4px solid #8B1055;">
        <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">New Demo Booking 🎉</h1>
        <p style="color: #FDEEF6; margin: 10px 0 0 0; font-size: 15px;">A new user has requested a free training session.</p>
      </div>
      <div style="padding: 35px 30px; background-color: white;">
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
          <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #F3D5E8; color: #9B6B7A; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; width: 35%;">Name</td>
            <td style="padding: 16px 0; border-bottom: 1px solid #F3D5E8; color: #2A1A24; font-size: 18px; font-weight: 700;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #F3D5E8; color: #9B6B7A; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Phone Number</td>
            <td style="padding: 16px 0; border-bottom: 1px solid #F3D5E8; color: #2A1A24; font-size: 18px; font-weight: 700;">
              <a href="tel:+91${phone}" style="color: #C62E7B; text-decoration: none;">+91 ${phone}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #F3D5E8; color: #9B6B7A; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">City</td>
            <td style="padding: 16px 0; border-bottom: 1px solid #F3D5E8; color: #2A1A24; font-size: 16px; font-weight: 500;">${city}</td>
          </tr>
          <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #F3D5E8; color: #9B6B7A; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Email</td>
            <td style="padding: 16px 0; border-bottom: 1px solid #F3D5E8; color: #2A1A24; font-size: 16px; font-weight: 500;">${email || '<span style="color: #CBD5E1; font-style: italic;">Not provided</span>'}</td>
          </tr>
          <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #F3D5E8; color: #9B6B7A; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Pincode</td>
            <td style="padding: 16px 0; border-bottom: 1px solid #F3D5E8; color: #2A1A24; font-size: 16px; font-weight: 500;">${pincode || '<span style="color: #CBD5E1; font-style: italic;">Not provided</span>'}</td>
          </tr>
        </table>
        
        <div style="margin-top: 35px; text-align: center; display: flex; justify-content: center; gap: 15px;">
          <a href="tel:+91${phone}" style="background-color: #C62E7B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(198,46,123,0.3);">📞 Call User</a>
          <a href="https://wa.me/91${phone}" style="background-color: #25D366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(37,211,102,0.3);">💬 WhatsApp</a>
        </div>
      </div>
      <div style="background-color: #FDF9F6; padding: 20px; text-align: center; color: #9B6B7A; font-size: 13px; border-top: 1px solid #F3D5E8;">
        &copy; ${new Date().getFullYear()} Happy Pets Training. Sent securely via backend.
      </div>
    </div>
  `;

  const mailOptions = {
    from: '"Happy Pets Website" <' + (process.env.EMAIL_USER || 'happypettraining25@gmail.com') + '>',
    to: 'happypettraining25@gmail.com', // Always send to this email
    subject: `🔥 New Demo Booking: ${name} from ${city}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email successfully sent to happypettraining25@gmail.com');
    res.json({ success: true, message: 'Thank you! We\'ll be in touch shortly.' });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email. Ensure backend environment variables are set.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Happy Pet Training API is running!' });
});

app.listen(PORT, () => {
  console.log(`🐾 Happy Pet Training API running on http://localhost:${PORT}`);
});

// Export the Express API for Vercel Serverless
module.exports = app;
