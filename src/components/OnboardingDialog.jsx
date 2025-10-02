import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useAppStore } from '../store';

const OnboardingDialog = () => {
  const hasOnboarded = useAppStore((state) => state.hasOnboarded);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  return (
    <Dialog
      open={!hasOnboarded}
      aria-labelledby="welcome-dialog-title"
      aria-describedby="welcome-dialog-description"
    >
      <DialogTitle id="welcome-dialog-title">Welcome to NeuroNav</DialogTitle>
      <DialogContent>
        <DialogContentText id="welcome-dialog-description">
          Your data is stored only on this device and is never sent to a server. No account needed.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={completeOnboarding} variant="contained" autoFocus>
          Get Started
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OnboardingDialog;