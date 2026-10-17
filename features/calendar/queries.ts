import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-key";
import { getCalendarSlots, getOccupiedSlots } from "./api";
import type { CalendarParams } from "./types";

export const useOccupiedSlots = ({ date, staffId }: CalendarParams) => {
  return useQuery({
    queryKey: queryKeys.calendar.occupiedList({ date, staffId }),
    queryFn: () => getOccupiedSlots({ date, staffId }),
    enabled: !!date,
  });
};

export const useCalendarSlots = ({ date, staffId, serviceId }: CalendarParams) => {
  return useQuery({
    queryKey: queryKeys.calendar.slotsList({ date, staffId, serviceId }),
    queryFn: () => getCalendarSlots({ date, staffId, serviceId }),
    enabled: !!date,
  });
};
