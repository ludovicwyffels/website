---
title: "Generate BDD tests with ChatGPT and run them with Playwright"
authors: [ludovicwyffels]
date: 2024-01-20T15:14:35+02:00
summary: ""
draft: true
showToc: true
cover: cover.png
# cover:
#     image: "cover.png"
#     relative: true
#     caption: Photos de [Andy Li](https://unsplash.com/fr/@andylid0) sur [Unsplash](https://unsplash.com)
tags:
  - "Testing"
  - "Playwright"
  - "TypeScript"
  - "Artificial Intelligence"
categories: ["Testing"]
# source: https://medium.com/@vitaliypotapov/generate-bdd-tests-with-chatgpt-and-run-them-with-playwright-e1ce29d7a7bd
---

In my current projects, I follow the [Behavior Driven Development (BDD)](https://en.wikipedia.org/wiki/Behavior-driven_development) approach for automated end-to-end testing. Previously I was rather skeptical of _Given-When-Then_ syntax, but now I actively use it. The main reason, I generate BDD scenarios with ChatGPT instead of writing them manually.

In this guide, I’ll share the steps on how you can obtain AI-generated tests for your project and execute them in a real browser with [Playwright](https://playwright.dev/).

For the demo, I will use a [TodoList App](https://demo.playwright.dev/todomvc/) built by the Playwright team. It is a web page with a list of todo items. Users can create, complete and filter items. The ultimate goal is to cover this app with end-to-end tests, writing minimal code manually and delegating maximum stuff to ChatGPT. Ideally, generated tests should run and pass without any edits. Let’s figure out if it’s possible!

![TodoList App]()

## Define user story

User story is a keystone for BDD. It is a description of user actions to achieve a specific outcome from a feature within the app. For testing `TodoList` let's stick to the following story:

```text
As a user I want to manage items in todo list: 
create items, complete items and filter to see only completed items.
```

Later I will use this story in ChatGPT prompts.

## Generate step definitions

Step definition is an implementation of a user action. For example:

```gherkin
Given I open TodoApp page
```

transforms to the browser command:

```typescript
await page.goto('https://demo.playwright.dev/todomvc/');
```

Or

```gherkin
When I click the button
```

transforms to:

```typescript
await page.getByTestId('button').click();
```

Several step definitions can be grouped into [Page Object Model](https://playwright.dev/docs/pom), a class representing a particular page in test scenarios.

For the todo list I need a single `TodoPage` class with methods to create, complete and filter items. The problem here is that step definitions highly depend on the page HTML structure, so I wouldn't delegate it to AI. But... ChatGPT is a perfect candidate to generate the template for the class.

As an output, I expect TypeScript code that uses NPM packages [@playwright/test](https://github.com/microsoft/playwright) and [playwright-bdd](https://github.com/vitalets/playwright-bdd) - to be able to run these tests later with Playwright.

**Initial prompt** to generate `TodoPage` class:

```text
Create Page Object Model 'TodoPage' in TypeScript for the following feature:

As a user I want to manage items in todo list: 
create items, complete items and filter to see only completed items.

* Use 'page' from '@playwright/test' as constructor parameter.
* Use Given, When, Then from 'playwright-bdd/decorators' as BDD decorators, for example: @Given('pattern {string}').
* Don't fill methods body.
```

Sending this prompt to ChatGPT and waiting for the response... I always feel a bit hypnotized while code is being generated

Full ChatGPT response:

```typescript
import { Page } from '@playwright/test'; 
import { Given, When, Then } from 'playwright-bdd/decorators';

export class TodoPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  @Given('I am on the Todo page')
  async navigateToTodoPage() {
    // Implement navigation to the Todo page here
  }

  @When('I create a new todo item with text {string}')
  async createTodoItem(text: string) {
    // Implement creating a new todo item here
  }

  @When('I complete the todo item with text {string}')
  async completeTodoItem(text: string) {
    // Implement completing a todo item here
  }

  @When('I filter to see only completed items')
  async filterCompletedItems() {
    // Implement filtering completed items here
  }

  @Then('I should see the todo item with text {string}')
  async verifyTodoItemVisible(text: string) {
    // Implement verification logic here
  }

  @Then('I should not see the todo item with text {string}')
  async verifyTodoItemNotVisible(text: string) {
    // Implement verification logic here
  }

  @Then('I should see only completed todo items')
  async verifyOnlyCompletedItemsVisible() {
    // Implement verification logic here
  }

  @Then('I should see all todo items')
  async verifyAllItemsVisible() {
    // Implement verification logic here
  }
}
```

So far so good!

ChatGPT has generated correct class methods, marked them with decorators and passed parameters where needed.

Now I want to simplify the response. Instead of having 4 separate assertion methods, I want to use a single one that compares the whole list. It is cleaner than checking each item individually. I simply send this request into the chat and get what I need.

**Second prompt:**

```text
Replace all verify methods with single method
that verifies list of visible items
```

ChatGPT output (notice the last method):

```typescript
import { Page } from '@playwright/test';
import { Given, When, Then } from 'playwright-bdd/decorators';

export class TodoPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  @Given('I am on the Todo page')
  async navigateToTodoPage() {
    // Implement navigation to the Todo page here
  }

  @When('I create a new todo item with text {string}')
  async createTodoItem(text: string) {
    // Implement creating a new todo item here
  }

  @When('I complete the todo item with text {string}')
  async completeTodoItem(text: string) {
    // Implement completing a todo item here
  }

  @When('I filter to see only completed items')
  async filterCompletedItems() {
    // Implement filtering completed items here
  }

  @Then('I should see the following todo items:')
  async verifyTodoItemsVisible(itemList: string[]) {
    for (const itemText of itemList) {
      // Implement verification logic for each itemText here
    }
  }
}
```

Fixed. ChatGPT replaced required methods and kept others untouched.

It’s worth mentioning that running the same prompts may yield different results for you, worse or better. I’ve conducted numerous experiments, starting with a clean ChatGPT session. Here are some tips to refine the output:

- `make all methods async` - sometimes ChatGPT generates synchronous methods
- `use {string} for string pattern parameters` - to stick to [Cucumber Expression](https://github.com/cucumber/cucumber-expressions) syntax for parameters
- `create todo items inside scenario "xxx"` - to fix scenario that uses data from another scenario, tests should be isolated
- `don't start method names with given/when/then` - for better method names

Don’t try to get an ideal response. ChatGPT can produce different answers, like a human! I use the following strategy:

1. get the initial response
2. improve it with subsequent commands
3. finalize it manually

It is especially relevant for generating `TodoPage` class, anyway I still need to complete step implementations.

### Fill step bodies

I can write step bodies manually inspecting HTML with devtools. However, my goal is to generate as much code as possible. Fortunately, Playwright has a feature called [codegen](https://playwright.dev/docs/codegen). It records all the actions on the web page and converts them into browser commands automatically.

Running codegen mode:

```shell
npx playwright codegen https://demo.playwright.dev/todomvc
```

The browser opens the provided URL and I perform the required actions. For example:

1. create a few todo items
2. mark them as completed
3. filter

Generated code:

```typescript
test('test', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc/#/');
  await page.getByPlaceholder('What needs to be done?').fill('feed the dog');
  await page.getByPlaceholder('What needs to be done?').press('Enter');
  await page.getByPlaceholder('What needs to be done?').fill('feed the cat');
  await page.getByPlaceholder('What needs to be done?').press('Enter');
  await page.locator('li').filter({ hasText: 'feed the cat' }).getByLabel('Toggle Todo').check();
  await page.getByRole('link', { name: 'Completed' }).click();
});
```

Now I pick code blocks and paste them into the class template produced by ChatGPT.

In some cases, manual edits are required. For example, I will replace `page.locator('li')` selector with a more reliable `page.getByTestId('todo-title')`.

Final `TodoPage` class with all the adjustments:

```typescript
import { Page, expect } from '@playwright/test';
import { Given, When, Then, Fixture } from 'playwright-bdd/decorators';
import { DataTable } from '@cucumber/cucumber';

export @Fixture('todoPage') class TodoPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  @Given('I am on the Todo page')
  async navigateToTodoPage() {
    await this.page.goto('https://demo.playwright.dev/todomvc/#/');
  }

  @When('I create a new todo item with text {string}')
  async createTodoItem(text: string) {
    await this.page.getByPlaceholder('What needs to be done?').fill(text);
    await this.page.getByPlaceholder('What needs to be done?').press('Enter');
  }

  @When('I complete the todo item with text {string}')
  async completeTodoItem(text: string) {
    await this.page.getByTestId('todo-item').filter({ hasText: text }).getByLabel('Toggle Todo').check();
  }

  @When('I filter to see only completed items')
  async filterCompletedItems() {
    await this.page.getByRole('link', { name: 'Completed' }).click();
  }

  @Then('I should see the following todo items:')
  async verifyTodoItemsVisible(itemList: DataTable) {
    await expect(this.page.getByTestId('todo-title')).toHaveText(itemList.raw().flat());
  }
}
```

## Generate BDD scenarios

Let’s construct BDD scenarios using the step definitions we’ve created. The key point here is to guide ChatGPT to utilize only specific steps. This enables us to execute the generated scenarios without the need for additional modifications.

> Alternatively, you could generate scenarios first and then implement the corresponding steps. However, if you decide to re-generate the scenarios, you’ll always need to update the step definitions.

To obtain a list of available steps, `playwright-bdd` offers a dedicated CLI command `bddgen export`. This command gathers step definitions from all files and displays them in plain text format in the terminal.

Run the command and get the list of steps:

```text
> npx bddgen export

List of all steps found by config: playwright.config.ts

* Given I am on the Todo page
* When I create a new todo item with text {string}
* When I complete the todo item with text {string}
* When I filter to see only completed items
* Then I should see the following todo items:
```

I select and copy these steps into my prompt.

**The prompt** to generate BDD scenarios:

```text
Generate BDD scenarios as a single Gherkin file strictly using only the following steps:* Given I am on the Todo page
* When I create a new todo item with text {string}
* When I complete the todo item with text {string}
* When I filter to see only completed items
* Then I should see the following todo items:
```

ChatGPT output:

```gherkin
Feature: Todo List Management

  Scenario: Create a new todo item
    Given I am on the Todo page
    When I create a new todo item with text "Buy groceries"
    Then I should see the following todo items:
      | Todo Text       |
      | Buy groceries   |
      
  Scenario: Complete a todo item
    Given I am on the Todo page
    When I create a new todo item with text "Read a book"
    And I complete the todo item with text "Read a book"
    Then I should see the following todo items:
      | Todo Text     |
      | [x] Read a book |
      
  Scenario: Filter completed items
    Given I am on the Todo page
    When I create a new todo item with text "Walk the dog"
    And I create a new todo item with text "Water the plants"
    And I complete the todo item with text "Walk the dog"
    And I filter to see only completed items
    Then I should see the following todo items:
      | Todo Text         |
      | [x] Walk the dog |
      
  Scenario: Filter completed items with multiple completed items
    Given I am on the Todo page
    When I create a new todo item with text "Go for a run"
    And I create a new todo item with text "Write code"
    And I complete the todo item with text "Go for a run"
    And I complete the todo item with text "Write code"
    And I filter to see only completed items
    Then I should see the following todo items:
      | Todo Text        |
      | [x] Go for a run |
      | [x] Write code   |
```

I like the result: ChatGPT correctly uses Given-When-Then syntax, generates meaningful scenarios and applies only provided steps.

As before, I want to improve the output:

1. Use `Background` keyword for common steps - it works like `beforeEach()`
2. Remove `[x]` from items text - otherwise text assertion will fail
3. Remove `Todo Text` header - it's redundant as there is only one column

I simply ask ChatGPT to do this.

**Second prompt**:

```text
* Use "Background" for common steps.
* Don't use "[x]"
* Don't use "Todo Text" header
```

ChatGPT output:

```gherkin
Feature: Todo List Management

  Background:
    Given I am on the Todo page
    
  Scenario: Create a new todo item
    When I create a new todo item with text "Buy groceries"
    Then I should see the following todo items:
      | Buy groceries   |
      
  Scenario: Complete a todo item
    When I create a new todo item with text "Read a book"
    And I complete the todo item with text "Read a book"
    Then I should see the following todo items:
      | Read a book   |
      
  Scenario: Filter completed items
    When I create a new todo item with text "Walk the dog"
    And I create a new todo item with text "Water the plants"
    And I complete the todo item with text "Walk the dog"
    And I filter to see only completed items
    Then I should see the following todo items:
      | Walk the dog   |
      
  Scenario: Filter completed items with multiple completed items
    When I create a new todo item with text "Go for a run"
    And I create a new todo item with text "Write code"
    And I complete the todo item with text "Go for a run"
    And I complete the todo item with text "Write code"
    And I filter to see only completed items
    Then I should see the following todo items:
      | Go for a run   |
      | Write code     |
```

All requested edits are done. Now I’m thrilled to run these scenarios in a browser!

## Run tests

Running BDD tests is not a built-in feature of Playwright, although [one of the most voted](https://github.com/microsoft/playwright/issues/11975). I leverage `playwright-bdd` integration for that. I only need to add configuration as all the steps and scenarios are already prepared.

For the sake of brevity, I’ll skip the installation procedures here. You can find these instructions in [ready-to-run example on GitHub](https://github.com/vitalets/playwright-bdd-example/tree/ai) with all the files from the article. You can ask ChatGPT to generate your own BDD scenarios for the TodoList and run them within the example.

Playwright configuration is the following:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['./features/todopage.feature'], // <- points to BDD scenarios
  importTestFrom: 'steps/fixtures.ts',    // <- points to step definitions
});

export default defineConfig({
  testDir,
  reporter: 'html',
});
```

[Fixtures](https://playwright.dev/docs/test-fixtures) file that imports `TodoPage` class:

```typescript
// steps/fixtures.ts
import { test as base } from 'playwright-bdd';
import { TodoPage } from './TodoPage';

export const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: async ({ page }, use) => use(new TodoPage(page)),
});
```

Finnaly, run tests:

```text
npx bddgen && npx playwright test
```

The output:

```text
Running 4 tests using 1 worker
4 passed (2.7s)
To open last HTML report run:
  npx playwright show-report
```

All tests passed!

HTML report with all the details:

![HTML report]()

## Recap

I’m quite happy with the result. While I do need to fine-tune ChatGPT responses, I spend much less time compared to writing code manually. I like this way of creating tests - not a monotonous process that some teams tend to skip. It’s a modern take on pair programming, where your partner is AI. He is not ideal and can make mistakes, but very executive, incredibly well-read and always ready to tackle any task with great enthusiasm 😊

**BDD proves to be a perfect format to generate with AI**. It is clear and human-readable. ChatGPT arranges steps into correct logical chains, and a human easily validates the result and finds an error. At the same time, BDD scenarios are technical enough to be executed in a real browser with Playwright and other tools.

I believe there are many ways to improve the process. Feel free to share your experience in the comments!

Thanks for reading and happy testing ❤️
