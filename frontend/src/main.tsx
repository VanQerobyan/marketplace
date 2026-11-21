import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router/Routes'
import { Provider } from 'react-redux'
import { store } from '../store/store'
import { ThemeProvider } from 'next-themes'

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        enableSystem
        >

   <RouterProvider router={router}/>
        </ThemeProvider>
   </Provider>
)