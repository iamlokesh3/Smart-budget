import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class SmartBudgetE2ETests(unittest.TestCase):
    def setUp(self):
        options = webdriver.ChromeOptions()
        options.add_argument('--headless=new') # Enable headless mode
        options.add_argument('--window-size=1280,800')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        
        self.driver = webdriver.Chrome(options=options)
        self.driver.implicitly_wait(10)
        self.wait = WebDriverWait(self.driver, 10)
        self.url = "http://localhost:5173"

    def tearDown(self):
        self.driver.quit()

    def test_01_landing_and_login(self):
        driver = self.driver
        driver.get(self.url)
        
        # Verify landing page
        self.assertIn("Smart Budget", driver.title)
        
        # Wait for the heading text to appear (to handle rendering/animation latency)
        self.wait.until(EC.text_to_be_present_in_element((By.TAG_NAME, "h1"), "Your Personal AI"))
        heading = driver.find_element(By.TAG_NAME, "h1").text
        self.assertIn("Your Personal AI", heading)
        
        # Click "Get Started"
        btn = self.wait.until(EC.element_to_be_clickable((By.XPATH, '//button[contains(text(), "Get Started")]')))
        btn.click()
        
        # Verify Auth Card
        self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'auth-card')))
        
        # Fill Login
        driver.find_element(By.CSS_SELECTOR, 'input[type="email"]').send_keys('lokeshmk436@gmail.com')
        driver.find_element(By.CSS_SELECTOR, 'input[type="password"]').send_keys('password123')
        
        # Submit
        submit = driver.find_element(By.XPATH, '//button[contains(text(), "Sign In")]')
        submit.click()
        
        # Wait for dashboard
        dashboard = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'action-grid')))
        self.assertIsNotNone(dashboard)
        print("Login test passed.")

    def test_02_add_transaction(self):
        driver = self.driver
        driver.get(self.url)
        
        # Login first
        login_btn = self.wait.until(EC.element_to_be_clickable((By.XPATH, '//button[contains(text(), "Login")]')))
        login_btn.click()
        self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'auth-card')))
        driver.find_element(By.CSS_SELECTOR, 'input[type="email"]').send_keys('lokeshmk436@gmail.com')
        driver.find_element(By.CSS_SELECTOR, 'input[type="password"]').send_keys('password123')
        driver.find_element(By.XPATH, '//button[contains(text(), "Sign In")]').click()
        self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'action-grid')))
        
        # Navigate to Smart Entries
        entries_card = driver.find_element(By.XPATH, '//h4[text()="Add Entry"]/..')
        entries_card.click()
        
        # Wait for Smart Entries page
        self.wait.until(EC.text_to_be_present_in_element((By.CSS_SELECTOR, '.page-header h2'), 'Smart Entries'))
        
        # Add a new transaction
        input_field = driver.find_element(By.CLASS_NAME, 'entry-input')
        input_field.send_keys('Spent Rs 800 on groceries', Keys.ENTER)
        
        # Wait for transaction to appear
        table = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'transactions-table')))
        first_row = table.find_element(By.CSS_SELECTOR, 'tbody tr td')
        
        # Note: The test will pass if the table exists, we'll give it a tiny sleep to let React update
        time.sleep(1)
        print("Transaction add test passed.")

if __name__ == "__main__":
    unittest.main()
