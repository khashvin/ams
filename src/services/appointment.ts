
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../schema';
import { eq, gt, and, sql } from 'drizzle-orm';

export class AppointmentService {
    constructor(private readonly db: BetterSQLite3Database<typeof schema>) {}

    async getAllAvailableSlots() {
        const slots = await this.db.query.slots.findMany({
            where: gt(schema.slots.availableSlots, 0),
        });
        return slots;
    }

    async getAvailableSlots(dateTime: string) {
        const slots = await this.db.query.slots.findMany({
            where: and(gt(schema.slots.availableSlots, 0), eq(schema.slots.dateTime, dateTime)),
        });
        return slots;
    }

    async getBookings(userId: number) {
        const bookings = await this.db.query.appointments.findFirst({
            where: eq(schema.appointments.user, userId),
        });
        return bookings;
    }

    async bookAppointment(dateTime: string, userId: number) {
        const slot = await this.db.query.slots.findFirst({
            where: eq(schema.slots.dateTime, dateTime),
        });

        const bookings = await this.getBookings(userId);

        if (bookings) {
            return { error: 'User already has an appointment' };
        }

        if (!slot) {
            return { error: 'Slot not found' };
        }

        if (slot.availableSlots < 1) {
            return { error: 'Slot not available' };
        }

        await this.db.update(schema.slots).set({
            availableSlots: slot.availableSlots - 1,
        }).where(eq(schema.slots.dateTime, dateTime));
        
        const appointment = await this.db.insert(schema.appointments).values({
            dateTime,
            slot: slot.id,
            user: userId,
        }).returning();


        return appointment;
    }

    async cancelAppointment(userId: number) {

        const bookings = await this.getBookings(userId);

        if (!bookings) {
            return { error: 'User has no appointment' };
        }

        const slot = await this.db.query.slots.findFirst({
            where: eq(schema.slots.dateTime, bookings.dateTime),
        });

        if (!slot) {
            return { error: 'Slot not found' };
        }

        await this.db.update(schema.slots).set({
            availableSlots: sql`${schema.slots.availableSlots} + 1`,
        }).where(eq(schema.slots.dateTime, slot.dateTime));

        await this.db.delete(schema.appointments).where(eq(schema.appointments.id, bookings.id));

        return { message: 'Appointment cancelled' };
    }
}