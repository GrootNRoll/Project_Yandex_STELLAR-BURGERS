import Cypress from 'cypress';

const BASE_URL = 'https://norma.nomoreparties.space/api';
const MAIN_BUN = `[data-cy=${'643d69a5c3f7b9001cfa093c'}]`;
const RESERVE_BUN = `[data-cy=${'643d69a5c3f7b9001cfa093d'}]`;
const MAIN_TOPPING = `[data-cy=${'643d69a5c3f7b9001cfa0949'}]`;

beforeEach(() => {
  cy.intercept('GET', `${BASE_URL}/ingredients`, {
    fixture: 'ingredients.json'
  });
  cy.intercept('POST', `${BASE_URL}/auth/login`, {
    fixture: 'user.json'
  });
  cy.intercept('GET', `${BASE_URL}/auth/user`, {
    fixture: 'user.json'
  });
  cy.intercept('POST', `${BASE_URL}/orders`, {
    fixture: 'orderResponse.json'
  });
  cy.visit('/', {
    onBeforeLoad(win) {
      // Disable dev-server overlay that covers elements
      const originalConsoleError = win.console.error;
      win.console.error = (...args) => {
        if (!args[0].includes('webpack-dev-server')) {
          originalConsoleError(...args);
        }
      };
    }
  });
  cy.viewport(1440, 800);
  cy.get('#modals').as('modal');
  // Wait for ingredients to load
  cy.wait(2000);
});

describe('Space Kitchen: Ingredient Management', () => {
  it('counting space components', () => {
    cy.get(MAIN_TOPPING).children('button').click({ force: true });
    cy.wait(500);
    cy.get(MAIN_TOPPING).find('.counter__num').contains('1');
  });

  describe('space burger assembly', () => {
    it('adding space bun and exotic topping', () => {
      cy.get(MAIN_BUN).children('button').click({ force: true });
      cy.wait(500);
      cy.get(MAIN_TOPPING).children('button').click({ force: true });
    });

    it('adding bun after placing topping', () => {
      cy.get(MAIN_TOPPING).children('button').click({ force: true });
      cy.wait(500);
      cy.get(MAIN_BUN).children('button').click({ force: true });
    });
  });

  describe('space burger modification', () => {
    it('replacing crater bun with fluorescent bun', () => {
      cy.get(MAIN_BUN).children('button').click({ force: true });
      cy.wait(500);
      cy.get(RESERVE_BUN).children('button').click({ force: true });
    });

    it('updating bun in a complete burger', () => {
      cy.get(MAIN_BUN).children('button').click({ force: true });
      cy.wait(500);
      cy.get(MAIN_TOPPING).children('button').click({ force: true });
      cy.wait(500);
      cy.get(RESERVE_BUN).children('button').click({ force: true });
    });
  });
});

describe('space order processing', () => {
  beforeEach(() => {
    window.localStorage.setItem('refreshToken', 'quantum_token');
    cy.setCookie('accessToken', 'nebula_pass');
    cy.getAllLocalStorage().should('be.not.empty');
    cy.getCookie('accessToken').should('be.not.empty');
  });

  afterEach(() => {
    window.localStorage.clear();
    cy.clearAllCookies();
    cy.getAllLocalStorage().should('be.empty');
    cy.getAllCookies().should('be.empty');
  });

  it('creating and verifying space order', () => {
    cy.get(MAIN_BUN).children('button').click({ force: true });
    cy.wait(500);
    cy.get(MAIN_TOPPING).children('button').click({ force: true });
    cy.wait(500);
    cy.get("[data-cy='order-button']").click({ force: true });
    cy.wait(2000); // Increased wait time for modal to appear
    cy.get('@modal').find('h2').contains('38483');
  });
});

describe('Space Menu Interactive Elements', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1440, 800);
    cy.get('#modals').as('modal');
    cy.wait(2000); // Wait for initial data load
  });

  it('viewing detailed information about space ingredient', () => {
    // Check that modal is not present initially
    cy.get('@modal')
      .find('h3')
      .should('not.exist');

    // Click on an ingredient
    cy.get(MAIN_TOPPING)
      .children('a')
      .click({ force: true });

    cy.wait(1000); // Wait for modal animation

    // Verify modal appears with correct title
    cy.get('@modal')
      .find('h3')
      .should('exist')
      .and('contain', 'Детали ингредиента');
    
    // Verify URL contains ingredient ID
    cy.url().should('include', '643d69a5c3f7b9001cfa0949');
  });

  it('closing information with navigation button', () => {
    // Open ingredient modal
    cy.get(MAIN_TOPPING)
      .children('a')
      .click({ force: true });

    cy.wait(1000);

    // Verify modal appears
    cy.get('@modal')
      .find('h3')
      .should('exist')
      .and('contain', 'Детали ингредиента');

    // Close modal and verify it's gone
    cy.get('@modal').find('svg').click({ force: true });
    cy.wait(1000); // Wait for modal to close
    cy.get('@modal')
      .find('h3')
      .should('not.exist');
    cy.url().should('not.include', '643d69a5c3f7b9001cfa0949');
  });

  it('closing information through overlay area', () => {
    // Open ingredient modal
    cy.get(MAIN_TOPPING)
      .children('a')
      .click({ force: true });

    cy.wait(1000);

    // Verify modal appears
    cy.get('@modal')
      .find('h3')
      .should('exist')
      .and('contain', 'Детали ингредиента');

    // Close through overlay and verify
    cy.get("[data-cy='overlay']").click({ force: true });
    cy.wait(1000); // Wait for modal to close
    cy.get('@modal')
      .find('h3')
      .should('not.exist');
    cy.url().should('not.include', '643d69a5c3f7b9001cfa0949');
  });

  it('closing information with hotkey', () => {
    // Open ingredient modal
    cy.get(MAIN_TOPPING)
      .children('a')
      .click({ force: true });

    cy.wait(1000);

    // Verify modal appears
    cy.get('@modal')
      .find('h3')
      .should('exist')
      .and('contain', 'Детали ингредиента');

    // Close with Escape key and verify
    cy.get('body').type('{esc}');
    cy.wait(1000); // Wait for modal to close
    cy.get('@modal')
      .find('h3')
      .should('not.exist');
    cy.url().should('not.include', '643d69a5c3f7b9001cfa0949');
  });
});
