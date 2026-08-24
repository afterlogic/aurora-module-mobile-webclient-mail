const path = require('path')
const { sharedHelper, fixturePath } = require(path.join(
  process.env.AURORA_MOBILE_E2E_ROOT,
  'test/e2e/helpers/paths'
))
const { expect } = require('@playwright/test')
const { step, attachScreenshot, fieldControl } = sharedHelper('login')
const { waitForListReady, clickReady, clickDrawerItem } = sharedHelper('ready')

const FOLDER_TYPES = {
  INBOX: 1,
  SENT: 2,
  DRAFTS: 3,
  SPAM: 4,
  TRASH: 5,
}

const listReadyOptions = {
  itemTestIds: 'mail-message-item',
  emptyTestId: 'mail-empty-folder',
  spinnerSelectors: [
    '.app-list-loader_initial',
    '.app-list-loader_initial .q-spinner-dots',
  ],
  timeout: 60000,
}

async function waitForInboxList(page) {
  await expect(page.getByTestId('mail-message-list')).toBeVisible({
    timeout: 60000,
  })
  await waitForListReady(page, listReadyOptions)
}

/**
 * Wait for inbox list and open the first message.
 * @returns {{ listSubject: string, viewSubject: string } | null}
 */
async function openFirstInboxMessage(page) {
  await step('Wait for inbox list', async () => {
    await waitForInboxList(page)
  })

  const items = page.getByTestId('mail-message-item')
  const count = await items.count()
  if (count === 0) {
    await attachScreenshot(page, 'mail-inbox-empty')
    return null
  }

  const listSubject = (
    await items
      .first()
      .locator('.message__subject')
      .innerText()
      .catch(() => '')
  ).trim()

  await step('Open first inbox message', async () => {
    await clickReady(items.first())
    await expect(page.getByTestId('mail-message-view')).toBeVisible({
      timeout: 30000,
    })
    await expect(page.getByTestId('mail-message-subject')).toBeVisible({
      timeout: 60000,
    })
    await expect(
      page.getByTestId('mail-message-view').locator('.app-list-loader_initial')
    ).toHaveCount(0, { timeout: 30000 })
  })

  const viewSubject = (
    await page.getByTestId('mail-message-subject').innerText()
  ).trim()

  return { listSubject, viewSubject }
}

async function expectComposeOpen(page) {
  await expect(page.getByTestId('mail-compose')).toBeVisible({
    timeout: 30000,
  })
}

async function readComposeSubject(page) {
  return (await fieldControl(page, 'mail-compose-subject').inputValue()).trim()
}

async function closeComposeWithoutSending(page) {
  await step('Close compose without sending', async () => {
    await clickReady(page.getByTestId('mail-compose-back'))
    const discardDialog = page.getByTestId('mail-compose-discard-dialog')
    if (await discardDialog.isVisible().catch(() => false)) {
      await clickReady(page.getByTestId('mail-compose-discard-ok'))
      await expect(discardDialog).toBeHidden({ timeout: 15000 })
    } else {
      // Fallback for older discard UI.
      const discardOk = page.getByRole('button', { name: /^OK$/i })
      if (await discardOk.isVisible().catch(() => false)) {
        await discardOk.click()
      }
    }
    await expect(page.getByTestId('mail-compose')).toBeHidden({
      timeout: 30000,
    })
  })
}

async function openMailDrawer(page) {
  await clickReady(page.getByTestId('mail-folder-menu'))
  await expect(page.getByTestId('mail-drawer')).toBeVisible({
    timeout: 15000,
  })
  await expect(page.getByTestId('mail-folder-item').first()).toBeVisible({
    timeout: 15000,
  })
}

async function openFolderByType(page, folderType) {
  await openMailDrawer(page)
  const folder = page
    .locator(
      `[data-test-id="mail-folder-item"][data-folder-type="${folderType}"]`
    )
    .first()
  await expect(folder).toBeVisible({ timeout: 15000 })
  const name = (await folder.getAttribute('data-folder-name')) || ''
  console.log(`  → Opening folder type=${folderType} name=${name}`)
  // Click the label, not the unread badge (badge opens unseen-only filter).
  const folderLabel = folder.locator('.folder-name').first()
  await clickDrawerItem(page, folderLabel)
  await expect(page.getByTestId('mail-message-list')).toBeVisible({
    timeout: 30000,
  })
  await expect(page.getByTestId('mail-filter-banner')).toHaveCount(0, {
    timeout: 15000,
  })
  await waitForListReady(page, listReadyOptions)
  return name
}

async function fillComposeRecipient(page, email, fieldTestId = 'mail-compose-to') {
  const field = page.getByTestId(fieldTestId)
  await field.locator('.q-field__control, .q-field__native').first().click()
  const input = field.locator('input').first()
  await input.fill(email, { force: true })

  const option = page.getByRole('option', { name: email }).first()
  await expect(option).toBeVisible({ timeout: 15000 })
  await option.click()

  await expect(field.locator('.recipients-input__chip').first()).toBeVisible({
    timeout: 15000,
  })
  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 }).catch(
    () => undefined
  )
}

async function sendCompose(page, { attempts = 2, timeout = 90000 } = {}) {
  const compose = page.getByTestId('mail-compose')
  const send = page.getByTestId('mail-compose-send')

  for (let attempt = 1; attempt <= attempts; attempt++) {
    await expect(send).toBeVisible({ timeout: 15000 })
    await clickReady(send)

    const closed = await compose
      .waitFor({ state: 'hidden', timeout })
      .then(() => true)
      .catch(() => false)

    if (closed) {
      return
    }

    // Mail SendMessage can fail with MailSo SocketReadTimeoutException on the
    // stand; the UI stays on compose (error toast ~2s). Retry once.
    console.log(
      `  → Send attempt ${attempt}/${attempts}: compose still open (likely SMTP/API timeout)`
    )
    if (attempt < attempts) {
      await page.keyboard.press('Escape').catch(() => undefined)
      await page.waitForTimeout(500)
    }
  }

  await expect(
    compose,
    'Compose still open after Send — Mail.SendMessage likely failed (e.g. SMTP SocketReadTimeoutException)'
  ).toBeHidden({ timeout: 5000 })
}

async function openFolderByName(page, folderName) {
  await openMailDrawer(page)
  const folder = page
    .locator(
      `[data-test-id="mail-folder-item"][data-folder-name="${folderName}"]`
    )
    .first()
  await expect(folder).toBeVisible({ timeout: 15000 })
  await clickDrawerItem(page, folder)
  await expect(page.getByTestId('mail-message-list')).toBeVisible({
    timeout: 30000,
  })
  await waitForListReady(page, listReadyOptions)
  return folderName
}

async function longPressMessageItem(page, item) {
  const box = await item.boundingBox()
  if (!box) {
    throw new Error('mail-message-item has no bounding box for long-press')
  }
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(750)
  await page.mouse.up()
}

async function sendInboxMessage(page, { subject, body, recipient } = {}) {
  const composeTo =
    recipient || process.env.E2E_COMPOSE_TO || process.env.E2E_LOGIN
  const messageSubject = subject || `E2E mail ${Date.now()}`
  const messageBody = body || `E2E mail body ${Date.now()}`

  await waitForInboxList(page)
  await clickReady(page.getByTestId('mail-compose-fab'))
  await expect(page.getByTestId('mail-compose')).toBeVisible({
    timeout: 15000,
  })
  await fillComposeRecipient(page, composeTo)
  await fieldControl(page, 'mail-compose-subject').fill(messageSubject)
  const editor = page
    .getByTestId('mail-compose-body')
    .locator('.q-editor__content')
  await expect(editor).toBeVisible({ timeout: 15000 })
  await editor.click()
  await editor.fill(messageBody)
  await sendCompose(page)
  await expect(page.getByTestId('mail-message-list')).toBeVisible({
    timeout: 30000,
  })
  return messageSubject
}

async function waitForInboxMessage(page, subject, { timeout = 120000 } = {}) {
  await openFolderByType(page, FOLDER_TYPES.INBOX)
  const item = page
    .getByTestId('mail-message-item')
    .filter({ hasText: subject })
    .first()
  await expect(item).toBeVisible({ timeout })
  return item
}

async function openInboxMessageBySubject(page, subject) {
  const item = await waitForInboxMessage(page, subject)
  await clickReady(item)
  await expect(page.getByTestId('mail-message-view')).toBeVisible({
    timeout: 30000,
  })
  await expect(page.getByTestId('mail-message-subject')).toBeVisible({
    timeout: 60000,
  })
  await expect(
    page.getByTestId('mail-message-view').locator('.app-list-loader_initial')
  ).toHaveCount(0, { timeout: 30000 })
}

/** Best-effort delete of a message by subject (cleanup after dedicated sends). */
async function cleanupDeleteMessageBySubject(page, subject) {
  try {
    if (!(await page.getByTestId('mail-message-view').isVisible().catch(() => false))) {
      await openInboxMessageBySubject(page, subject)
    }
    await clickReady(page.getByTestId('mail-action-delete'))
    const dialog = page.getByTestId('mail-delete-dialog')
    if (await dialog.isVisible().catch(() => false)) {
      await clickReady(page.getByTestId('mail-delete-confirm'))
      await expect(dialog).toBeHidden({ timeout: 30000 })
    }
    await expect(page.getByTestId('mail-message-list')).toBeVisible({
      timeout: 30000,
    })
    console.log(`  → cleanup mail: ${subject}`)
  } catch (e) {
    console.log(`  → cleanup mail failed (${subject}): ${e.message}`)
  }
}

module.exports = {
  FOLDER_TYPES,
  waitForInboxList,
  openFirstInboxMessage,
  expectComposeOpen,
  readComposeSubject,
  closeComposeWithoutSending,
  openMailDrawer,
  openFolderByType,
  openFolderByName,
  longPressMessageItem,
  fillComposeRecipient,
  sendCompose,
  sendInboxMessage,
  waitForInboxMessage,
  openInboxMessageBySubject,
  cleanupDeleteMessageBySubject,
  waitForListReady,
  listReadyOptions,
  clickReady,
}
