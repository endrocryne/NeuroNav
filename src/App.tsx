import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import { WelcomeDialog } from './components/WelcomeDialog';
import { TodayScreen } from './screens/TodayScreen';
import { PlanScreen } from './screens/PlanScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { useAppStore } from './stores/appStore';
import { getTheme } from './theme';
import { db } from './services/db';

function App() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const { viewMode, setViewMode, setEnableEncouragement, setHasSeenWelcome } = useAppStore();

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await db.settings.get(1);
      if (settings) {
        setHasSeenWelcome(settings.hasSeenWelcome);
        setViewMode(settings.viewMode);
        setEnableEncouragement(settings.enableEncouragement);
      }
    };
    loadSettings();
  }, [setHasSeenWelcome, setViewMode, setEnableEncouragement]);

  const theme = getTheme(viewMode === 'lowstim' ? 'lowstim' : 'default');

  const renderScreen = () => {
    switch (currentScreen) {
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box sx={{ p: 2, pt: 3 }}>
          {renderScreen()}
        </Box>
        
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation
            value={currentScreen}
            onChange={(_, newValue) => setCurrentScreen(newValue)}
            showLabels
          >
            <BottomNavigationAction label="Today" icon={<TodayIcon />} />
            <BottomNavigationAction label="Plan" icon={<CalendarMonthIcon />} />
            <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
          </BottomNavigation>
        </Paper>

        <WelcomeDialog />
      </Box>
    </ThemeProvider>
  );
}

export default App;
