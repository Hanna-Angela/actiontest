const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const OrderInfo = require("../src/models/OrderInfo");
const mongoose = require("mongoose");

// Fetch order counts from the database
async function OrderCountsDB() {
  try {
    await mongoose.connect("mongodb://0.0.0.0:27017/abstrak");

    const processingCount = await OrderInfo.countDocuments({
      fulfillmentStatus: "Unfulfilled",
    });
    const toBeShippedCount = await OrderInfo.countDocuments({
      fulfillmentStatus: "Fulfilled",
    });
    const cancelledCount = await OrderInfo.countDocuments({
      fulfillmentStatus: "Canceled",
    });

    return {
      processing: processingCount,
      toBeShipped: toBeShippedCount,
      cancelled: cancelledCount,
    };
  } catch (err) {
    console.error("Error fetching data from MongoDB:", err);
    return null;
  }
}

describe("Order Status Test", () => {
  let driver;
  let orderCountsDB;
  let processingCountDashboard;
  let toBeShippedCountDashboard;
  let cancelledCountDashboard;
  jest.setTimeout(30000);

  beforeAll(async () => {
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

    await driver.get("https://localhost:3000/login");
    driver.sleep(1000);

    url = await driver.getCurrentUrl();
    console.log(url);

    const ngrokButton = await driver.findElement(By.css('button'));
    await ngrokButton.click();
    driver.sleep(1000);

    // Log in
    const usernameInput = await driver.findElement(By.id("username"));
    await usernameInput.sendKeys("Abstrak_Admin");
    driver.sleep(1000);

    const passwordInput = await driver.findElement(By.id("password"));
    await passwordInput.sendKeys("TOUCH.DOWN!");
    driver.sleep(1000);

    const loginButton = await driver.findElement(By.css(".action-button"));
    await loginButton.click();
    driver.sleep(1000);

    // await driver.wait(until.urlIs("http://localhost:3000"), 10000);
    // Wait until the URL is no longer the login URL
    // await driver.wait(async () => {
    //   const currentUrl = await driver.getCurrentUrl();
    //   return currentUrl !== '${{ steps.ngrok.outputs.public_url }}/login';
    // }, 10000); // Adjust the timeout as necessary

    // Fetch data from dashboard
    processingCountDashboard = parseInt(
      await (await driver.findElement(By.id("processing"))).getText()
    );
    toBeShippedCountDashboard = parseInt(
      await (await driver.findElement(By.id("to-be-shipped"))).getText()
    );
    cancelledCountDashboard = parseInt(
      await (await driver.findElement(By.id("cancelled"))).getText()
    );

    // Fetch data from database
    orderCountsDB = await OrderCountsDB();
    await mongoose.disconnect();
  });

  afterAll(async () => {
    await driver.quit();
  });

  test("Processing count from dashboard and DB match.", () => {
    expect(processingCountDashboard).toBe(orderCountsDB.processing);
  });

  test("To be shipped count from dashboard and DB match.", () => {
    expect(toBeShippedCountDashboard).toBe(orderCountsDB.toBeShipped);
  });

  test("Cancelled count from dashboard and DB match.", () => {
    expect(cancelledCountDashboard).toBe(orderCountsDB.cancelled);
  });
});
