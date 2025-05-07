import { createContext, useContext, useState } from "react";

const RoleContext = createContext({
  activeRole: null,
  setActiveRole: () => { }
});

export const RoleProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState(null);
  return (
    <RoleContext.Provider value={{ activeRole, setActiveRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);