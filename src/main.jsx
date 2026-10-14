import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SearchProvider } from './contexts/SearchContext.jsx';
import { AddLinkDialogProvider } from './contexts/AddLinkDialogContext.jsx';
import { CardDensityProvider } from './contexts/CardDensityContext.jsx';
import AppRouter from './app/router.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CardDensityProvider>
        <SearchProvider>
          <AddLinkDialogProvider>
            <AppRouter />
          </AddLinkDialogProvider>
        </SearchProvider>
      </CardDensityProvider>
    </AuthProvider>
  </React.StrictMode>,
)
