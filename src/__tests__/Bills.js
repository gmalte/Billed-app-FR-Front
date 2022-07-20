/**
 * @jest-environment jsdom
 */

import { screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { bills } from "../__fixtures__/bills"
import router from "../app/Router"
import BillsUI from "../views/BillsUI.js"
import mockBillsUI from "../__mocks__/BillsUI.js"
import Bills from "../containers/Bills.js";
import { formatDate } from '../app/format.js'

jest.mock("../app/store", () => mockStore)
 
describe("When I am on Bills Page", () => {
  test("Then bills should be ordered from earliest to latest", () => {
    // mockBillsUI used so that the dates are note formatted when displayed
    document.body.innerHTML = mockBillsUI({ data: bills })
    const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
    const antiChrono = (a, b) => ((a > b) ? 1 : -1)
    const datesSorted = [...dates].sort(antiChrono)
    expect(dates).toEqual(datesSorted)
  })
  test("Then bill icon in vertical layout should be highlighted", async () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.Bills)
    await waitFor(() => screen.getByTestId('icon-window'))
    const windowIcon = screen.getByTestId('icon-window')
    expect(windowIcon.classList.contains('active-icon')).toBe(true)
  })
  
  describe('When I am on Bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
  describe('When I am on Bills page and I click on a eye icon', () => {
    test('Then, a modal should open', () => {
      document.body.innerHTML = BillsUI({ data: bills })

      const billsInstance = new Bills({ document })

      const iconEye = screen.getAllByTestId("icon-eye")[0]

      /*
      Without "$.fn.modal = jest.fn()", jest returns "TypeError: $(...).modal is not a function"
        https://stackoverflow.com/questions/45225235/accessing-bootstrap-functionality-in-jest-testing
        https://codehunter.cc/a/reactjs/reactjs-jest-jquery-is-not-defined
      Bills handleClickIconEye function uses jquery...
      */
      $.fn.modal = jest.fn(); 
      const handleClickIconEye = jest.fn(() => billsInstance.handleClickIconEye(iconEye)) // To use toHaveBeenCalled

      iconEye.addEventListener('click', handleClickIconEye)
      userEvent.click(iconEye)

      expect(handleClickIconEye).toHaveBeenCalled();
      expect(document.getElementById('modaleFile')).toBeTruthy   
    })
  })
  describe('When I am on Bills page and I click on NewBill', () => {
    test('Then, it should render NewBill page', () => {
      document.body.innerHTML = BillsUI({ data: [] })

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      new Bills({ document, onNavigate })
  
      const newBillBtn = screen.getByTestId("btn-new-bill")
      userEvent.click(newBillBtn)
  
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      // Make the onNavigate function available
      router()

      // jest.mock("../app/store", () => mockStore) declared at the beginning of this module
      //    It will be mockStore which will be used to get bills
      onNavigate(ROUTES_PATH.Bills)

      const lastBill = await waitFor(() => screen.getByText('test2'))
      expect(lastBill).toBeTruthy()
    })
  })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      // Allow with mockImplementationOnce to mock the list function
      jest.spyOn(mockStore, "bills")
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)

      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      onNavigate(ROUTES_PATH.Bills)
      // Ensure asynchronous actions are resolved before running assertions during tests
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })
      /*
      Call getBills() (router.js) => list() (bills.js) => return Promise.reject => 
      catch(error => { (router.js)
        rootDiv.innerHTML = ROUTES({ pathname, error })
      */
      onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})

