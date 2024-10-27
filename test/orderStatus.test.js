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

    await driver.get("http://localhost:3000/login");

    // Log in
    const usernameInput = await driver.findElement(By.id("username"));
    await usernameInput.sendKeys("Abstrak_Admin");

    const passwordInput = await driver.findElement(By.id("password"));
    await passwordInput.sendKeys("TOUCH.DOWN!");

    const loginButton = await driver.findElement(By.css(".action-button"));
    await loginButton.click();

    await driver.wait(until.urlIs("http://localhost:3000/"), 10000);

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
