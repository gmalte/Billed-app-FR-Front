/**
 * @jest-environment jsdom
 */

import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import { formatDate } from '../app/format.js'

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import router from "../app/Router.js";
 
describe("When I am on Bills Page", () => {
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
  test("Then bills should be ordered from earliest to latest", () => {
    const orderedBills = [...bills].sort(function(a,b){ // [...bills] used so that bills is not modified
      return new Date(a.date) - new Date(b.date);
    });
    var dates = orderedBills.map(function(bill) { return formatDate(bill["date"]) });

    document.body.innerHTML = BillsUI({ data: bills })
    const UiDates = screen.getAllByText(/^\d.*\d$/).map(a => a.innerHTML)

    expect(UiDates).toEqual(dates)
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
})

