
import { parseICS, CalendarComponent } from 'ical';
import create_calendar, { ICalEventData, ICalCalendarData } from 'ical-generator';

export type { ICalEventData, ICalCalendarData, ICalAttendeeData, ICalAttendeeStatus } from 'ical-generator';

export function parse_icalendar(contents: string) {
	const parsed = parseICS(contents);
	const calendar: CalendarComponent[] = [ ];

	for (const data of Object.values(parsed)) {
		calendar.push(data);
	}

	return calendar;
}

export function create_icalendar(cal: ICalCalendarData, events: ICalEventData | ICalEventData[]) {
	const calendar = create_calendar(cal);

	if (Array.isArray(events)) {
		for (const event of events) {
			calendar.createEvent(event);
		}
	}

	else {
		calendar.createEvent(events);
	}

	return calendar.toString();
}
