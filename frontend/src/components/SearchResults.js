import React from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import LectureCard from './LectureCard';

const SearchResults = ({ 
  results, 
  loading, 
  error, 
  onClick, 
  query 
}) => {
  if (loading) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400 mb-4"></div>
        <p className="text-lg text-purple-300">Searching for lectures...</p>
        {query && <p className="text-gray-400 mt-2">Looking for "{query}"</p>}
      </div>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2, mb: 3 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
        >
          <AlertTitle>Search Error</AlertTitle>
          {error}
        </Alert>
        
        <Box sx={{ mt: 3, pl: 2 }}>
          <Typography variant="h6" gutterBottom>
            Troubleshooting Tips:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Make sure you're logged in with a valid account" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Check your internet connection" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Try a different search term - be careful with special characters" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Wait a moment and try again - the server might be temporarily busy" />
            </ListItem>
            <ListItem>
              <ListItemText primary="If the problem persists, please contact support" />
            </ListItem>
          </List>
        </Box>
      </Box>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          <AlertTitle>No Results Found</AlertTitle>
          {query ? 
            `No lectures match your search for "${query}". Try different keywords or check for typos.` : 
            'Please enter a search term to find lectures.'}
        </Alert>
      </Box>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-white mb-4">
        Search Results for "{query}" <span className="text-sm text-gray-400">({results.length} found)</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map(lecture => (
          <LectureCard 
            key={lecture.id} 
            lecture={lecture} 
            isPast={lecture.isPast} 
            onClick={onClick}
            isUserRegistered={lecture.isRegistered || false} 
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResults; 