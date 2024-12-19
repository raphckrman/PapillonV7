import { AccountService, type ExternalAccount } from "@/stores/account/types";
import type { BookingDay, BookingTerminal } from "./shared/Booking";

export const getBookingsAvailableFromExternal = async (account: ExternalAccount, weekNumber?: number, force = false): Promise<BookingTerminal[]> => {
  switch (account.service) {
    case AccountService.Turboself: {
      const { getBookingWeek } = await import("./turboself/booking");
      const bookings = await getBookingWeek(account, weekNumber);
      return bookings;
    }
    case AccountService.ARD: {
      // TODO: Implement ARD
      return [];
    }
    case AccountService.Alise: {
      const { getBookings } = await import("./alise/bookings");
      const bookings = await getBookings(account, force);
      return bookings;
    }
    default: {
      return [];
    }
  }
};

export const bookDayFromExternal = async (account: ExternalAccount, id: string, date: Date, booked: boolean): Promise<BookingDay | undefined> => {
  switch (account.service) {
    case AccountService.Turboself: {
      const { bookDay } = await import("./turboself/booking");
      const bookedDay = await bookDay(account, id, date, booked);
      return bookedDay;
    }
    case AccountService.Alise: {
      const { bookDay } = await import("./alise/bookings");
      const bookedDay = await bookDay(account, id, date, booked);
      return bookedDay;
    }
    case AccountService.ARD: {
      return undefined;
    }
  }
};
