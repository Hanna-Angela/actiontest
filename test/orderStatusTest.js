const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("assert");
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

describe("Order Status Test", function () {
  let driver;
  let orderCountsDB;
  let processingCountDashboard;
  let toBeShippedCountDashboard;
  let cancelledCountDashboard;

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
  });

  after(async function () {
    await driver.quit();
  });

  // Log in and fetch counts
    await driver.get("http://localhost:3000/login");
    const usernameInput = await driver.findElement(By.id("username"));
    await usernameInput.sendKeys("Max_Verstappen");
    await driver.sleep(1000);

    const passwordInput = await driver.findElement(By.id("password"));
    await passwordInput.sendKeys("12345678");
    await driver.sleep(1000);

    const loginButton = await driver.findElement(By.css(".action-button"));
    await loginButton.click();
    // await driver.sleep(5000);
    await driver.wait(until.urlIs("http://localhost:3000/"), 30000);
    
    const processingElement = await driver.findElement(By.id("processing"));
    await driver.sleep(1000);

    const toBeShippedElement = await driver.findElement(By.id("to-be-shipped"));
    await driver.sleep(1000);

    const cancelledElement = await driver.findElement(By.id("cancelled"));
    await driver.sleep(1000);

    processingCountDashboard = parseInt(await processingElement.getText());
    toBeShippedCountDashboard = parseInt(await toBeShippedElement.getText());
    cancelledCountDashboard = parseInt(await cancelledElement.getText());

    orderCountsDB = await OrderCountsDB();
    await mongoose.disconnect();

  it("Processing count from dashboard and DB match.", function () {
    assert.strictEqual(
      processingCountDashboard,
      orderCountsDB.processing,
      "Processing count does not match!"
    );
  });

  it("To be shipped count from dashboard and DB match.", function () {
    assert.strictEqual(
      toBeShippedCountDashboard,
      orderCountsDB.toBeShipped,
      "To be shipped count does not match!"
    );
  });

  it("Cancelled count from dashboard and DB match.", function () {
    assert.strictEqual(
      cancelledCountDashboard,
      orderCountsDB.cancelled,
      "Cancelled count does not match!"
    );
  });

  console.log("Counts match between MongoDB and Dashboard!");
});
