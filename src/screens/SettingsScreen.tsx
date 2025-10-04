import { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
  Switch,
  Button,
  Divider,
} from '@mui/material';
import { useAppStore, type ViewMode } from '../stores/appStore';
import { db } from '../services/db';

export function SettingsScreen() {
  const { viewMode, setViewMode, enableEncouragement, setEnableEncouragement } = useAppStore();
  const [importing, setImporting] = useState(false);

  const handleViewModeChange = async (mode: ViewMode) => {
    setViewMode(mode);
    await db.settings.put({
      id: 1,
      hasSeenWelcome: true,
      viewMode: mode,
      enableEncouragement,
    });
  };

  const handleEncouragementToggle = async (enabled: boolean) => {
    setEnableEncouragement(enabled);
    await db.settings.put({
      id: 1,
      hasSeenWelcome: true,
      viewMode,
      enableEncouragement: enabled,
    });
  };

  const handleExportData = async () => {
    try {
      const tasks = await db.tasks.toArray();
      const routines = await db.routines.toArray();
      const settings = await db.settings.toArray();

      const data = {
        tasks,
        routines,
        settings,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neuronav-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Clear existing data
      await db.tasks.clear();
      await db.routines.clear();
      await db.settings.clear();

      // Import new data
      if (data.tasks) await db.tasks.bulkAdd(data.tasks);
      if (data.routines) await db.routines.bulkAdd(data.routines);
      if (data.settings) await db.settings.bulkAdd(data.settings);

      alert('Data imported successfully! Please refresh the page.');
      window.location.reload();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data. Please check the file format.');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <Box sx={{ pb: 10 }}>
      <List>
        <ListItem>
          <ListItemText
            primary="Focus Modes"
            secondary="Choose how you want to interact with your tasks"
          />
        </ListItem>
        <ListItem>
          <RadioGroup value={viewMode} onChange={(e) => handleViewModeChange(e.target.value as ViewMode)}>
            <FormControlLabel
              value="default"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Default (Linear)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Standard Material 3 styling
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="mindmap"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Mind Map Mode</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Visual connections between tasks
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="lowstim"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Low-Stim Mode</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dark theme, larger text, one task at a time
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="gamified"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Gamified Mode</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Celebrations and progress tracking
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </ListItem>

        <Divider sx={{ my: 2 }} />

        <ListItem>
          <ListItemText
            primary="Emotional Intelligence"
            secondary="Get encouraging messages after completing tasks"
          />
          <Switch
            checked={enableEncouragement}
            onChange={(e) => handleEncouragementToggle(e.target.checked)}
          />
        </ListItem>

        <Divider sx={{ my: 2 }} />

        <ListItem>
          <ListItemText
            primary="Data Management"
            secondary="Export or import your data"
          />
        </ListItem>
        <ListItem>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', width: '100%' }}>
            <Button variant="outlined" onClick={handleExportData} fullWidth>
              Export Data
            </Button>
            <Button
              variant="outlined"
              component="label"
              disabled={importing}
              fullWidth
            >
              {importing ? 'Importing...' : 'Import Data'}
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleImportData}
              />
            </Button>
          </Box>
        </ListItem>

        <Divider sx={{ my: 2 }} />

        <ListItem>
          <ListItemText
            primary="About NeuroNav"
            secondary="Version 1.0.0 • Privacy-first, offline-capable PWA"
          />
        </ListItem>
      </List>
    </Box>
  );
}
