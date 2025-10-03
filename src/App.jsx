import React, { useState, useMemo, useEffect } from 'react';
import { Box, Paper, ThemeProvider, CssBaseline, Snackbar, Alert } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import TodayIcon from '@mui/icons-material/Today';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SettingsIcon from '@mui/icons-material/Settings';
import Confetti from 'react-confetti';

import { useAppStore } from './store';
import { defaultTheme, lowStimTheme } from './theme';

import TodayScreen from './screens/TodayScreen';
import PlanScreen from './screens/PlanScreen';
import SettingsScreen from './screens/SettingsScreen';
import OnboardingDialog from './components/OnboardingDialog';
import TaskBreakdownDialog from './components/TaskBreakdownDialog';
import EditTaskDialog from './components/EditTaskDialog';
import EditRoutineDialog from './components/EditRoutineDialog';

const encouragementMessages = [
  "You're doing great!",
  "One step at a time.",
  "It's okay to take a break.",
  "Small progress is still progress.",
  "You've got this!",
];

function App() {
  const [value, setValue] = useState(0);
  const { focusMode, showConfetti, enableEncouragement, triggerConfetti } = useAppStore();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const theme = useMemo(() => {
    switch (focusMode) {
      case 'lowstim':
        return lowStimTheme;
      default:
        return defaultTheme;
    }
  }, [focusMode]);

  const handleTaskComplete = () => {
    if (focusMode === 'gamified') {
      triggerConfetti();
    }
    if (enableEncouragement) {
      const message = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
      setSnackbarMessage(message);
      setSnackbarOpen(true);
    }
  };

  // This is a bit of a hack to pass the completion handler down.
  // In a larger app, React Context or a more direct prop-drilling would be better.
  useEffect(() => {
    window.handleTaskComplete = handleTaskComplete;
  }, [focusMode, enableEncouragement]);


  const renderScreen = () => {
    switch (value) {
      case 0:
        return <TodayScreen />;
      case 1:
        return <PlanScreen />;
      case 2:
        return <SettingsScreen />;
      default:
        return <TodayScreen />;
    }
  };

  const showIcons = focusMode !== 'lowstim';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {showConfetti && <Confetti recycle={false} />}
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <OnboardingDialog />
        <TaskBreakdownDialog />
        <EditTaskDialog />
        <EditRoutineDialog />
        <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', mb: 7 }}>
          {renderScreen()}
        </Box>
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation
            showLabels
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
          >
            <BottomNavigationAction label="Today" icon={showIcons ? <TodayIcon /> : null} />
            <BottomNavigationAction label="Plan" icon={showIcons ? <EventNoteIcon /> : null} />
            <BottomNavigationAction label="Settings" icon={showIcons ? <SettingsIcon /> : null} />
          </BottomNavigation>
        </Paper>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;