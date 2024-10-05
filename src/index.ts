import express from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { AppointmentService } from './services/appointment';

import 'dotenv/config';

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite, { schema });

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`Server is running. ${new Date().toISOString()}`);
});

app.use('/api/v1/*', async (req, res, next) => {
  const bearerToken = req.headers.authorization;
  if (!bearerToken) {
    res.status(401).json({ error: 'Unauthorized' });
  }

  const token = bearerToken!.split(' ')[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  console.log(decoded);
  // @ts-ignore
  req.auth = decoded;
  next();
});


app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email and password are required' });
  }

  const existingUser = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  
  if (existingUser.length > 0) {
    res.status(409).json({ error: 'User already exists' });
  }

  const newUser = await db.insert(schema.users).values({
    name,
    email,
    password: bcrypt.hashSync(password, 10),
  }).returning();

  res.status(201).json({
    message: `${name} registered successfully with id ${newUser[0].id}`,
  });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);

  if (user.length === 0) {
    res.status(401).json({ error: 'Invalid email or password' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user[0].password);

  if (!isPasswordValid) {
    res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user[0].id }, process.env.JWT_SECRET as string);

  res.json({ token });
  
});


app.get('/api/v1/slots', async (req, res) => {
  // @ts-ignore
  const { userId } = req.auth as { userId: string };

  const appointments = await new AppointmentService(db).getAllAvailableSlots();
  res.json(appointments);
}); 

app.get('/api/v1/slots', async (req, res) => {
  const { dateTime } = req.query;

  if (!dateTime) {
    res.status(400).json({ error: 'DateTime is required' });
  }

  const appointments = await new AppointmentService(db).getAvailableSlots(dateTime as string);
  res.json(appointments);
});

app.get('/api/v1/bookings', async (req, res) => {
  // @ts-ignore
  const { userId } = req.auth as { userId: string };

  const bookings = await new AppointmentService(db).getBookings(Number(userId));
  res.json(bookings);
});

app.post('/api/v1/bookings', async (req, res) => {
  // @ts-ignore
  const { userId } = req.auth as { userId: string };

  const { dateTime } = req.body;

  const appointment = await new AppointmentService(db).bookAppointment(dateTime, Number(userId));
  res.json(appointment);
});

app.patch('/api/v1/bookings', async (req, res) => {
  // @ts-ignore
  const { userId } = req.auth as { userId: string };

  const { dateTime } = req.body;

  const appointmentService = new AppointmentService(db);

  const slot = await appointmentService.getAvailableSlots(dateTime);

  if (slot.length === 0) {
    res.status(400).json({ error: 'Slot not available' });
  }

  const appointment = await appointmentService.cancelAppointment(Number(userId));

  if (appointment.error) {
    res.status(400).json({ error: appointment.error });
  }
  
  const newAppointment = await appointmentService.bookAppointment(dateTime, Number(userId));

  res.json(newAppointment);
});

app.delete('/api/v1/bookings', async (req, res) => {
  // @ts-ignore
  const { userId } = req.auth as { userId: string };

  const appointment = await new AppointmentService(db).cancelAppointment(Number(userId));

  if (appointment.error) {
    res.status(400).json({ error: appointment.error });
  }

  res.json(appointment);
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});