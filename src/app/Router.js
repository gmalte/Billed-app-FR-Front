import store from "./Store.js"
import Login, { PREVIOUS_LOCATION } from "../containers/Login.js"
import Bills  from "../containers/Bills.js"
import NewBill from "../containers/NewBill.js"
import Dashboard from "../containers/Dashboard.js"

import BillsUI from "../views/BillsUI.js"
import DashboardUI from "../views/DashboardUI.js"

import { ROUTES, ROUTES_PATH } from "../constants/routes.js"

export default () => {
  const rootDiv = document.getElementById('root')
  rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname })

  /*
    The onNavigate function is global with the use of window
    Why pass it to Login, Bills, etc... ?
  */
  window.onNavigate = (pathname) => {
    /*
    Update window.location =>
    - the browser URL bar is updated
    - when the user navigates back in Bills and Dashboard, the URL is not modified (see onpopstate block)
    - when the user reloads the page (see last checks of this module), window.location is used
    */
    window.history.pushState(
      {},
      pathname,
      window.location.origin + pathname
    )
    if (pathname === ROUTES_PATH['Login']) {
      rootDiv.innerHTML = ROUTES({ pathname })
      document.body.style.backgroundColor="#0E5AE5"
      new Login({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store })
    } else if (pathname === ROUTES_PATH['Bills']) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true })
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.add('active-icon')
      divIcon2.classList.remove('active-icon')
      const bills = new Bills({ document, onNavigate, store, localStorage  }) // 1st "new Bills" for getBills()
      bills.getBills().then(data => {
        rootDiv.innerHTML = BillsUI({ data }) // returns BillsUI with bills from getBills()
        const divIcon1 = document.getElementById('layout-icon1')
        const divIcon2 = document.getElementById('layout-icon2')
        divIcon1.classList.add('active-icon')
        divIcon2.classList.remove('active-icon')
        new Bills({ document, onNavigate, store, localStorage }) // 2nd "new Bills" to add EventListeners to BillsUI
      }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname, error })
      })
    } else if (pathname === ROUTES_PATH['NewBill']) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true })
      new NewBill({ document, onNavigate, store, localStorage })
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.remove('active-icon')
      divIcon2.classList.add('active-icon')
    } else if (pathname === ROUTES_PATH['Dashboard']) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true })
      const bills = new Dashboard({ document, onNavigate, store, bills: [], localStorage })
      bills.getBillsAllUsers().then(bills => {
          rootDiv.innerHTML = DashboardUI({data: {bills}})
          new Dashboard({document, onNavigate, store, bills, localStorage})
        }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname, error })
      })
    }
  }

  window.onpopstate = (e) => { // Executed when the user navigate back
    const user = JSON.parse(localStorage.getItem('user'))
    if (window.location.pathname === "/" && !user) {
      document.body.style.backgroundColor="#0E5AE5"
      rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname })
    }
    else if (user) {
      onNavigate(PREVIOUS_LOCATION) // PREVIOUS_LOCATION updated by Login with Bills or Dashboard path
    }
  }

  // Executed when user first loads index.html (first case) or when he reloads the page (other cases)
  if (window.location.pathname === "/" && window.location.hash === "") {
    new Login({ document, localStorage, PREVIOUS_LOCATION, store })
    document.body.style.backgroundColor="#0E5AE5"
  } else if (window.location.hash !== "") {
    if (window.location.hash === ROUTES_PATH['Bills']) {
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true })
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.add('active-icon')
      divIcon2.classList.remove('active-icon')
      const bills = new Bills({ document, onNavigate, store, localStorage  })
      bills.getBills().then(data => {
        rootDiv.innerHTML = BillsUI({ data })
        const divIcon1 = document.getElementById('layout-icon1')
        const divIcon2 = document.getElementById('layout-icon2')
        divIcon1.classList.add('active-icon')
        divIcon2.classList.remove('active-icon')
        new Bills({ document, onNavigate, store, localStorage })
      }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error })
      })
    } else if (window.location.hash === ROUTES_PATH['NewBill']) {
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true })
      new NewBill({ document, onNavigate, store, localStorage })
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.remove('active-icon')
      divIcon2.classList.add('active-icon')
    } else if (window.location.hash === ROUTES_PATH['Dashboard']) {
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true })
      const bills = new Dashboard({ document, onNavigate, store, bills: [], localStorage })
      bills.getBillsAllUsers().then(bills => {
        rootDiv.innerHTML = DashboardUI({ data: { bills } })
        new Dashboard({ document, onNavigate, store, bills, localStorage })
      }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error })
      })
    }
  }

  return null
}

