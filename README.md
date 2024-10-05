# Appointment Booking System

## Installation

```bash
npm install
```

## Setup

```bash
cp .env.example .env
```
1. Update the .env file with a random secret for JWT
2. Create the database and run the migrations

```bash
npm run migrate
```
3. Seed the database with the initial data (Appointment Slots)

```bash
npm run seed
```

## Running the app

```bash
npm run dev
```
### View Database with ([Drizzle Studio](https://local.drizzle.studio))
```bash
npm run studio
```

## API Endpoints

### Get All Available Slots

#### Endpoint

```bash
GET /api/v1/slots
```

### Get Available Slots for a Specific Date

#### Endpoint

```bash
GET /api/v1/slots?dateTime=2024-04-04 10:00:00
```

### Get User Bookings

#### Endpoint

```bash
GET /api/v1/bookings
```


### Book an Appointment

#### Endpoint

```bash
POST /api/v1/bookings
```
#### Body
```json
{
  "dateTime": "2024-04-04 10:00:00"
}
```

### Cancel an Appointment

#### Endpoint

```bash
DELETE /api/v1/bookings
```
#### Body
```json
{
  "dateTime": "2024-04-04 10:00:00"
}
```

### Update an Appointment

#### Endpoint

```bash
PATCH /api/v1/bookings
```
#### Body
```json
{
  "dateTime": "2024-04-04 10:00:00"
}