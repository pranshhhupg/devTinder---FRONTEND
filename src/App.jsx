import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Body from './components/Body'
import Profile from './components/Profile'
import Login from './components/Login'
import appStore from './utils/appStore'
import { Provider } from 'react-redux'
import Feed from './components/Feed'

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
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
    </>
  )
}

export default App;
