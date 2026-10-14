import { createContext, useContext, useState } from 'react';

const AddLinkDialogContext = createContext();

export const useAddLinkDialog = () => {
  const context = useContext(AddLinkDialogContext);
  if (!context) {
    throw new Error('useAddLinkDialog must be used within AddLinkDialogProvider');
  }
  return context;
};

export const AddLinkDialogProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <AddLinkDialogContext.Provider value={{ isOpen, open, close }}>
      {children}
    </AddLinkDialogContext.Provider>
  );
};
