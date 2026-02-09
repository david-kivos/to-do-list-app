'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Belgrade", label: "Belgrade (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)" },
]

type Timezone = {
    label: string;
    value: string;
}

type TimezoneContextType = {
  timezone: Timezone;
  setTimezone: (timezone: Timezone) => void;
  userTimezone: Timezone;
}

const getUserTimezone = (): Timezone => {
  if (typeof window === 'undefined') {
    return TIMEZONES[0];
  }
  
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const finalTz = TIMEZONES.find(tz => tz.value === userTz);
  return finalTz || TIMEZONES[0];
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export const TimezoneProvider = ({ children }: { children: React.ReactNode }) => {
  const userTimezone = getUserTimezone()
  const [timezone, setTimezone] = useState<Timezone>(TIMEZONES[0]);

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone, userTimezone }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within TimezoneProvider');
  }
  return context;
}