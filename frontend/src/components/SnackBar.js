import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const SnackbarContext = createContext();

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // 'success', 'error', 'warning', 'info'
  });
  
  // Utiliser une ref pour éviter les mises à jour multiples
  const pendingTimerRef = useRef(null);

  // Mémoriser la fonction avec useCallback pour éviter les re-rendus inutiles
  const showSnackbar = useCallback((message, severity = "info") => {
    // Annuler tout timer en attente pour éviter les mises à jour multiples
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Valeur mémorisée pour le contexte
  const contextValue = useCallback(() => ({
    showSnackbar
  }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={contextValue()}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};