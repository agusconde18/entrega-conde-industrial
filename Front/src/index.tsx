import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App/App';
import reportWebVitals from './reportWebVitals';
import {QueryClient, QueryClientProvider} from "react-query";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
document.addEventListener("DOMContentLoaded", (event) => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  const render = () => {
    const queryClient = new QueryClient();
    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
      },
    });

    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={darkTheme}>
            <CssBaseline />
              <App />
          </ThemeProvider>
        </QueryClientProvider>
      </React.StrictMode>
    );
  };
  render();
  reportWebVitals();
  const mod = module as any;;
  if (mod.hot) {
    mod.hot.accept('./App', render);
  }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

