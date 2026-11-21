import { Home } from "../components/home/Home";
import { SignUp } from "../components/auth/SignUp";
import { createBrowserRouter } from "react-router-dom";
import { SignIn } from "../components/auth/SignIn";
import { AccountLayout } from "../components/accountLayout/AccountLayout";
import { Profile } from "../components/pages/profile/Profile";
import { UserProfile } from "../components/pages/profile/UserProfile";
import { Listing } from "../components/pages/listing/Listing";
import { Favorite } from "../components/pages/favorite/Favorite";
import { Message } from "../components/pages/message/Message";
import { Notification } from "../components/pages/notification/Notification";
import { Settings } from "../components/pages/settings/Settings";
import { OneListing } from "../components/pages/listing/OneListing";
import { EditListing } from "../components/pages/listing/EditListing";
import { EditProfile } from "../components/pages/settings/EditProfile";
import { ChangePassword } from "../components/pages/settings/ChangePassword";
import { Theme } from "../components/pages/settings/Theme";
import { PaymentSuccess } from "../components/pages/payment/PaymentSuccess";
import { Purchases } from "../components/pages/payment/Purchases";

export const router = createBrowserRouter([
    {
        path: '', 
        element: <Home/>,
    },
            { path: 'signUp', element: <SignUp/>},
            { path: 'signIn', element: <SignIn/>},
            { 
                path: '/account', 
                element: <AccountLayout/>,
                children: [
                    { path: 'profile', element: <Profile/>},
                    { path: 'users/:id', element: <UserProfile/>},
                    { path: 'listings', element: <Listing/>},
                    { path: "listings/:id", element: <OneListing/> },
                    { path: "listings/:id/edit", element: <EditListing/>},
                    { path: 'favorites', element: <Favorite/>},
                    { path: 'purchases', element: <Purchases/>},
                    { path: 'payments/success', element: <PaymentSuccess/>},
                    { path: 'messages', element: <Message/>},
                    { path: 'notifications', element: <Notification/>},
                    { path: 'settings', element: <Settings/>,
                        children: [
                            { path: "accountInfo", element: <EditProfile/>},
                            { path: "security", element: <ChangePassword/>},
                            { path: "theme", element: <Theme/>},
                        ]
                    }
                ]
            }
])
