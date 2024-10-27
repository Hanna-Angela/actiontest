const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const path = require("path");
const assert = require("assert");

describe("Signup Test", function () {
  let driver;

  // Increase timeout for tests
  this.timeout(30000);

  before(async function () {
    // Set up Chrome options
    const options = new chrome.Options();
    options.addArguments(
      "--headless",
      "--no-sandbox",
      "--disable-dev-shm-usage"
    );
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

    // Function to navigate back to the signup page
    await driver.get("http://localhost:3000/signup");
    await driver.sleep(1000);
  });

  after(async function () {
    await driver.quit();
  });

  const testCases = [
    // NO FIRST NAME
    {
      testName: "No first name (stay in signup)",
      firstNameInput: "",
      lastNameInput: "Robles",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "Jhoanna1.",
      emailInput: "jhoanna@gmail.com",
      isValid: false,
    },
    // NO LAST NAME
    {
      testName: "No last name (stay in signup)",
      firstNameInput: "Jhoanna",
      lastNameInput: "",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "Jhoanna1.",
      emailInput: "jhoanna@gmail.com",
      isValid: false,
    },
    // NO USERNAME
    {
      testName: "No username (stay in signup)",
      firstNameInput: "Jhoanna",
      lastNameInput: "Robles",
      usernameInput: "",
      passwordInput: "Jhoanna1.",
      emailInput: "jhoanna@gmail.com",
      isValid: false,
    },
    // NO PASSWORD
    {
      testName: "No password (stay in signup)",
      firstNameInput: "Jhoanna",
      lastNameInput: "Robles",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "",
      emailInput: "jhoanna@gmail.com",
      isValid: false,
    },
    // INVALID PASSWORD
    {
      testName: "Invalid password (stay in signup)",
      firstNameInput: "Jhoanna",
      lastNameInput: "Robles",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "12345678",
      emailInput: "jhoanna@gmail.com",
      isValid: false,
    },
    // NO EMAIL
    {
      testName: "No email (stay in signup)",
      firstNameInput: "Jhoanna",
      lastNameInput: "Robles",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "Jhoanna1.",
      emailInput: "",
      isValid: false,
    },
    // INVALID EMAIL
    {
      testName: "Invalid email (stay in signup)",
      firstNameInput: "Jhoanna",
      lastNameInput: "Robles",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "Jhoanna1.",
      emailInput: "jho",
      isValid: false,
    },
    // VALID USER
    {
      testName: "Valid user (redirect to login)",
      firstNameInput: "Jhoanna",
      lastNameInput: "Robles",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "Jhoanna1.",
      emailInput: "jhoanna@gmail.com",
      isValid: true,
    },
    // USER ALREADY EXISTS
    {
      testName: "User already exists (stay in signup)",
      firstNameInput: "Jhoanna",
      lastNameInput: "Robles",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "Jhoanna1.",
      emailInput: "jhoanna@gmail.com",
      isValid: false,
    },
  ];

  testCases.forEach((testCase) => {
    it(`"${testCase.testName}"`, async function () {
      await driver.get("http://localhost:3000/signup");
      await driver.sleep(1000);

      const firstNameInput = await driver.findElement(By.id("first-name"));
      const lastNameInput = await driver.findElement(By.id("last-name"));
      const usernameInput = await driver.findElement(By.id("username"));
      const passwordInput = await driver.findElement(By.id("password"));
      const emailInput = await driver.findElement(By.id("email"));
      const signupButton = await driver.findElement(By.css(".action-button"));

      // Fill out the form
      await firstNameInput.clear();
      await firstNameInput.sendKeys(testCase.firstNameInput);
      await driver.sleep(1000);

      await lastNameInput.clear();
      await lastNameInput.sendKeys(testCase.lastNameInput);
      await driver.sleep(1000);

      await usernameInput.clear();
      await usernameInput.sendKeys(testCase.usernameInput);
      await driver.sleep(1000);

      await passwordInput.clear();
      await passwordInput.sendKeys(testCase.passwordInput);
      await driver.sleep(1000);

      await emailInput.clear();
      await emailInput.sendKeys(testCase.emailInput);
      await driver.sleep(1000);

      await signupButton.click();
      await driver.sleep(2000);

      // Assert the URL based on the test case
      const currentUrl = await driver.getCurrentUrl();
      if (testCase.isValid) {
        assert.strictEqual(
          currentUrl,
          "http://localhost:3000/login",
          `Expected to redirect for "${testCase.testName}"`
        );
      } else {
        assert.strictEqual(
          currentUrl,
          "http://localhost:3000/signup",
          `Expected to stay on signup for "${testCase.testName}"`
        );
      }
    });
  });
});
