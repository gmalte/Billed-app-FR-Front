/**
 * @jest-environment jsdom
 */

/*
it seems that userEvent.click launch the addEventListener callback contrary on real....
https://stackoverflow.com/questions/68055955/how-to-test-a-required-input-field-with-react-testing-library-and-jest
*/

import { screen, fireEvent, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from '@testing-library/user-event'
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router"
import { bills } from "../__fixtures__/bills"

jest.mock("../app/store", () => mockStore)

describe("Given I am on NewBill Page", () => {
  describe("When I choose a not valid proof file", () => {
    test("Then a warning should be display", async () => {
    })
  })
  // test d'intégration POST
  describe("When I choose a valid proof file", () => {
    test("Then file data should be sent", async () => {
    })
  })
  describe("When I choose a valid proof file and I click on send button", () => {
    test("Then I should be sent on Bills page", async () => {
    })
  })
})

describe("Given I am on NewBill Page", () => {
  describe("When I choose a not valid proof file", () => {
    test("Then a warning should be display", async () => {
      
    })
  })
})

describe("Given I am on NewBill Page", () => {
  describe("When I choose a not valid proof file", () => {
    test("Then a warning should be display", () => {
      document.body.innerHTML = NewBillUI()

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        email: 'a@a.fr'
      }))
      new NewBill({
        document,
        onNavigate: null,
        store: null,
        localStorage: window.localStorage,
      })

      const inputFile = screen.getByTestId('file')

      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(['test.txt'], 'test.txt')
          ]
        }
      })
      
      expect(screen.getByText(/Veuillez choisir/)).toBeTruthy()
    })
  })

  // test d'intégration POST
  describe("When I choose a valid proof file", () => {
    test("Then file data should be sent", async () => {
      document.body.innerHTML = NewBillUI()

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        email: 'a@a.fr'
      }))
      const newBill = new NewBill({
        document,
        onNavigate: null,
        store: mockStore,
        localStorage: window.localStorage,
      })

      const inputFile = screen.getByTestId('file')

      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(['test.jpg'], 'test.jpg')
          ]
        }
      })
      
      await new Promise(process.nextTick)

      expect(newBill.billId).toBe('1234')
    })

    describe("When I choose a valid proof file and I click on send button", () => {
      test("Then I should be sent on Bills page", async () => {  
        document.body.innerHTML = "" // previousz tests...
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
  
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: 'a@a.fr'
        }))

        router() // To get its onNavigate function which will get the bills before calling BillsUI
        window.onNavigate(ROUTES_PATH.NewBill)
  
        const newBill = new NewBill({
          document,
          onNavigate: onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        })
  
        newBill.fileName = "test"

        const submit = screen.getByText('Envoyer')
        userEvent.click(submit) // or fireEvent.click(submit)??

        const lastBill = await waitFor(() => screen.getByText('test2'))
        expect(lastBill).toBeTruthy()
      })
    })

    // OR without testing updateBill: 
    // store: null & data: bills from fixtures
    describe("When I choose a valid proof file and I click on send button", () => {
      test("Then I should be sent on Bills page", async () => {
        document.body.innerHTML = NewBillUI()

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname, data: bills })
        }
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          email: 'a@a.fr'
        }))
        const newBill = new NewBill({
          document,
          onNavigate: onNavigate,
          store: null,
          localStorage: window.localStorage,
        })

        newBill.fileName = "test"

        const submit = screen.getByText('Envoyer')
        userEvent.click(submit) // or fireEvent.click(submit)

        const lastBill = await waitFor(() => screen.getByText('test2'))
        expect(lastBill).toBeTruthy()
      })
    })
  })
})
