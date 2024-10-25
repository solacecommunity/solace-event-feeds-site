import React, { createContext, useState } from 'react';

// Create the context object to hold the Solace Session
export const SessionContext = createContext();

// Create a Provider component to wrap the app and provide the context values
export const SolaceSession = ({ children }) => {
  const [session, setSession] = useState(null);
  const [sessionProperties, setSessionProperties] = useState({});
  const [isAnyEventRunning, setIsAnyEventRunning] = useState(false);
  
  return (
    <SessionContext.Provider value={{ session, setSession, sessionProperties, setSessionProperties, isAnyEventRunning, setIsAnyEventRunning }}>
      {children}
    </SessionContext.Provider>
  );
};