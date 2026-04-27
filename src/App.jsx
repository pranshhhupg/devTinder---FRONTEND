import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Body from './components/Body'
import Profile from './components/Profile'
import Login from './components/Login'
import appStore from './utils/appStore'
import { Provider } from 'react-redux'
import Feed from './components/Feed'
import Connections from './components/Connections'
import Requests from './components/Requests'
import Status from './components/Status'
import Chat from './components/Chat'

const App = function() {
  return (
    <>
    <Provider store = {appStore}>
      <BrowserRouter basename="/">
        <Routes>
          <Route path = "/" element = {<Body/>}>
            <Route path = "/login" element = {<Login/>}/>
            <Route path = "/feed" element = {<Feed/>}/>
            <Route path = "/profile" element = {<Profile/>}/>
            <Route path = "/connections" element = {<Connections/>}/>
            <Route path = "/request" element = {<Requests/>}/>
            <Route path = "/status" element = {<Status/>}/>
            <Route path = "/chat/:targetUserId" element = {<Chat/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
    </>
  )
}

export default App;
