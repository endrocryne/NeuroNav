import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import AllTasksTab from '../components/AllTasksTab';
import RoutinesTab from '../components/RoutinesTab';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`plan-tabpanel-${index}`}
      aria-labelledby={`plan-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const PlanScreen = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="plan tabs">
          <Tab label="All Tasks" id="plan-tab-0" aria-controls="plan-tabpanel-0" />
          <Tab label="Routines" id="plan-tab-1" aria-controls="plan-tabpanel-1" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <AllTasksTab />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <RoutinesTab />
      </TabPanel>
    </Box>
  );
};

export default PlanScreen;