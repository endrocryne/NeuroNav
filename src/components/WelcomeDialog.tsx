import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useAppStore } from '../stores/appStore';
import { db } from '../services/db';

export function WelcomeDialog() {
  const { hasSeenWelcome, setHasSeenWelcome } = useAppStore();

  const handleGetStarted = async () => {
    setHasSeenWelcome(true);
    await db.settings.put({
      id: 1,
      hasSeenWelcome: true,
      viewMode: 'default',
      enableEncouragement: true
    });
  };

  return (
    <Dialog open={!hasSeenWelcome} maxWidth="sm" fullWidth>
      <DialogTitle>Welcome to NeuroNav</DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          Your data is stored only on this device and is never sent to a server.
        </Typography>
        <Typography variant="body1">
          No account needed.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleGetStarted} fullWidth>
          Get Started
        </Button>
      </DialogActions>
    </Dialog>
  );
}
