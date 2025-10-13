import { Text, Tooltip } from "@radix-ui/themes";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import React from "react";
import { cn } from "../../../../utils/helperFunctions";

const StudentAttendanceCalendar = ({
  attendance = {},
  scheduledDays = [],
  showOutsideDays = true,
  weekStartsOn = 0, // 0 = Sunday, 1 = Monday
}) => {
  const month = new Date();

  const attendanceData = attendance;

  // Dynamic weekday labels
  const allDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayNames = [
    ...allDayNames.slice(weekStartsOn),
    ...allDayNames.slice(0, weekStartsOn),
  ];

  // Calendar bounds (using { weekStartsOn } correctly)
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });

  // Generate all days
  const days = [];
  let currentDate = new Date(calendarStart);
  while (currentDate <= calendarEnd) {
    days.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  // Helper to check if a day is scheduled
  const isScheduledDay = (date) => {
    const dayName = format(date, 'EEEE').toLowerCase(); // e.g., 'monday', 'tuesday'
    return scheduledDays.includes(dayName);
  };

  // Helpers
  const getAttendanceStatus = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return attendanceData[dateStr];
  };

  const getDayModifiers = (date) => {
    const mods = [];
    const today = new Date();
    if (isSameDay(date, today)) mods.push("today");
    if (!isSameMonth(date, month)) mods.push("outside");

    // Add scheduled/non-scheduled modifiers
    if (isSameMonth(date, month)) {
      if (isScheduledDay(date)) {
        mods.push("scheduled");
      } else {
        mods.push("non-scheduled");
      }
    }

    const status = getAttendanceStatus(date);
    if (status) mods.push(status);
    return mods;
  };

  const getDayClasses = (date) => {
    const modifiers = getDayModifiers(date);
    const isOutside = modifiers.includes("outside");
    const isNonScheduled = modifiers.includes("non-scheduled");
    const isToday = modifiers.includes("today");
    const isPresent = modifiers.includes("present");
    const isAbsent = modifiers.includes("absent");

    return cn(
      // Base styles
      "w-10 h-10 flex items-center justify-center text-sm hover:translate-y-[-1px] rounded-full transition-all",

      // Text color
      isOutside ? "text-[--gray-6]" : "text-[--gray-12]",

      // Today ring
      isToday && "ring-1 ring-[--blue-11]",

      // Attendance status colors (only for scheduled days inside the month)
      !isOutside && !isNonScheduled && {
        "bg-[--green-4] text-[--green-12]": isPresent,
        "bg-[--red-4] text-[--red-12]": isAbsent,
      }
    );
  };

  // Enhanced tooltip content
  const getTooltipContent = (date) => {
    const dateStr = format(date, 'MMMM do');
    const status = getAttendanceStatus(date);
    const isScheduled = isScheduledDay(date);
    const isOutside = !isSameMonth(date, month);

    if (isOutside) return dateStr;

    if (!isScheduled) {
      return `${dateStr} - No class scheduled`;
    }

    if (status) {
      return `${dateStr} - ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    }

    return `${dateStr} - Class scheduled`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <h2 className="font-bold">
        {format(month, "MMMM yyyy")}
      </h2>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2">
        {dayNames.map((day) => (
          <Text
            as="div"
            color="gray"
            size="1"
            weight="medium"
            key={day}
            className={cn(
              "py-2 tracking-wide text-center uppercase",
              day === "Sun" && "text-[--red-11]"
            )}
          >
            {day.charAt(0)}
          </Text>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          const isOutside = !isSameMonth(date, month);
          if (!showOutsideDays && isOutside) {
            return <div key={index} className="w-10 h-10"></div>;
          }
          return (
            <Tooltip
              content={getTooltipContent(date)}
            >
              <div
                key={index}
                className={cn(
                  "relative cursor-default",
                  getDayClasses(date)
                )}
              >
                <span className={cn(
                  getDayModifiers(date).includes("scheduled") && "absolute left-1/2 rounded-full -translate-x-1/2 bg-[--blue-11] top-[3px] size-1"
                )} />
                {date.getDate()}
              </div>
            </Tooltip>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <Text as="div" color="gray" size="1" className="flex gap-1 items-center">
          <div className=" size-3 bg-[--green-6] rounded-full"></div>
          Present
        </Text>
        <Text as="div" color="gray" size="1" className="flex gap-1 items-center">
          <div className=" size-3 bg-[--red-6] rounded-full"></div>
          Absent
        </Text>
        <Text as="div" color="gray" size="1" className="flex gap-1 items-center">
          <div className="size-1 bg-[--blue-11] rounded-full"></div>
          Scheduled
        </Text>
      </div>
    </div>
  );
};

export default StudentAttendanceCalendar;