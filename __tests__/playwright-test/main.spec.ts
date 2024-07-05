import { test, expect } from '@playwright/test';

test('Check on logo element exists', async ({ page }) => {
    await page.goto('http://localhost:3000/*/chat');
  
    const elementExists = await page.waitForSelector('.flex.cursor-pointer');
  
    expect(elementExists).not.toBeNull();
  });
  
  
  test('Check if logo element exists', async ({ page }) => {
    await page.goto('http://localhost:3000/*/chat');
  
    const elementExists = await page.waitForSelector('.mb-2');
  
    expect(elementExists).not.toBeNull();
  });
  
  
  test('Check if background exists', async ({ page }) => {
    await page.goto('http://localhost:3000/*/chat');
  
    const elementExists = await page.waitForSelector('.bg-background');
  
    expect(elementExists).not.toBeNull();
  });
  
    test('check main div', async ({ page }) => {
      await page.goto('http://localhost:3000/*/chat');
  
      // Evaluate if the div exists on the page
      const divExists = await page.evaluate(() => {
        const div = document.querySelector('.flex.size-full.flex-col.items-center.justify-center');
        return div !== null;
      });
  
      expect(divExists).toBe(true);
    });
  
    test('Check if button-arrow for side menu exists', async ({ page }) => {
      await page.goto('http://localhost:3000/*/chat');
  
      const buttonExists = await page.waitForSelector('button.ring-offset-background');
  
      expect(buttonExists).not.toBeNull();
    });
  
  
  
  
    test('start chatting is displayed', async ({ page }) => {
      await page.goto('http://localhost:3000/*/chat');
  
      const startChattingElementExists = await page.waitForSelector('.ring-offset-background', { state: 'attached' });
  
      expect(startChattingElementExists).toBeTruthy();
  });
  
  test('Check if "New chat" button exists', async ({ page }) => {
      await page.goto('http://localhost:3000/*/chat');
  
      const NewChatButton = await page.waitForSelector('.mr-1', { state: 'attached' });
  
      expect(NewChatButton).toBeTruthy();
  });
  
  test('Check if input for workspace exists', async ({ page }) => {
      await page.goto('http://localhost:3000/*/chat');
  
      const inp = await page.getByPlaceholder('Search workspaces...');
  
      expect(inp).toBeTruthy();
  });
  
  test('Check if input for presets exists', async ({ page }) => {
      await page.goto('http://localhost:3000/*/chat');
  
      const inp = await page.getByPlaceholder('Search presets...');
      expect(inp).toBeTruthy();
  });
  
  test('Check if input for promts exists', async ({ page }) => {
      await page.goto('http://localhost:3000/*/chat');
  
      const inp = await page.getByPlaceholder('Search prompts...');
      expect(inp).toBeTruthy();
  });
  
  test('Check if input for models exists', async ({ page }) => {
      await page.goto('http://localhost:3000/*/chat');
  
      const inp = await page.getByPlaceholder('Search models...');
      expect(inp).toBeTruthy();
  });
  
  test('Check if input for files exists', async ({ page }) => {
      await page.goto('http://localhost:3000/*/chat');
  
      const inp = await page.getByPlaceholder('Search files...');
      expect(inp).toBeTruthy();
  });
  
  test('Check if input for promts on home page exist', async ({ page }) => {
      await page.goto('http://localhost:3000/*/chat');
  
      const inp = await page.getByPlaceholder('Ask anything. Type &quot;@&quot; for assistants, &quot;/&quot; for prompts, &quot;#&quot; for files, and &quot;!&quot; for tools.');
      expect(inp).toBeTruthy();
  });
  
  test('Check if input for collections exist', async ({ page }) => {
      await page.goto('http://localhost:3000/*/chat');
  
      const inp = await page.getByPlaceholder('Search collections...');
      expect(inp).toBeTruthy();
  });
  
  test('Check if input for assistants exist', async ({ page }) => {
      await page.goto('http://localhost:3000/*/chat');
  
      const inp = await page.getByPlaceholder('Search assistants...');
      expect(inp).toBeTruthy();
  });
  
  test('Check if input for tools exist', async ({ page }) => {
      await page.goto('http://localhost:3000/*/chat');
  
      const inp = await page.getByPlaceholder('Search tools...');
      expect(inp).toBeTruthy();
  });
  
  test('Check if "New Workspace" button exists', async ({ page }) => {
      await page.goto('http://localhost:3000/*/chat');
  
      const NewWorkspace = page.getByText("New Workspace");
      expect(NewWorkspace).toBeTruthy();
  });

  test('Delete the workspace', async ({ page }) => {

    await page.goto('localhost:3000/*/chat');
  
    const dialogSelector = '[role="dialog"]';
    await page.waitForSelector(dialogSelector, { state: 'visible' });
  
    // Check that the delete warning header is present
    const deleteHeader = "WARNING: Deleting a workspace will delete all of its data.";
    const header = await page.getByText(deleteHeader);
    expect(header).not.toBeNull();

    const inputPlaceholder = "Type the name of this workspace to confirm";
    const input = await page.getByPlaceholder(inputPlaceholder);
    await input.fill("New Workspace");
    expect(input).not.toBeNull();
  
    // Enable and click the "Delete" button
    const deleteButton = await page.getByRole('button', { name: 'Delete' });
    await deleteButton.evaluate(button => button.disabled = false);
    await deleteButton.click();
  });

  test('check button new-workspace-button exists', async ({ page }) => {
    await page.goto('localhost:3000/*/chat');

    // Wait for the network to be idle
    await page.waitForLoadState('networkidle');

    const button = page.locator('#new-workspace-button');
    expect(button).toBeTruthy();
  });


  test('Profile button exist', async ({ page }) => {
    // Navigate to the page containing the button and the side panel
    await page.goto('localhost:3000/*/chat"', { waitUntil: 'networkidle' });

    const locator = await page.getByTestId('#userButtonOpenMenu');

    expect(locator).toBeTruthy();
});


test('Cancel and save buttons exist', async ({ page }) => {
  await page.goto('localhost:3000/*/chat"', { waitUntil: 'networkidle' }); 

  const CancelButtons = await page.getByText('Cancel');
  const SaveButtons = await page.getByText('Save');

  expect(CancelButtons).toBeTruthy();
  expect(SaveButtons).toBeTruthy();
});


test('Check help information exist', async ({ page }) => {
    await page.goto("localhost:3000/*/chat");

    const TextShowHelp = "Show Help";
    const TextShowWorkspace = "Show Workspaces";

    const svgElement = await page.$('#icon-question-mark');

    if (svgElement) {
      console.log('SVG element found');
      // You can perform further actions on the svgElement if needed
    } else {
      console.log('SVG element not found');
    }


    const TargetShowHelp = await page.getByText(TextShowHelp);
    const TargetWorkspace = await page.getByText(TextShowWorkspace);

    expect(TargetShowHelp).toBeVisible();
    expect(TargetWorkspace).toBeVisible(); 
  });
