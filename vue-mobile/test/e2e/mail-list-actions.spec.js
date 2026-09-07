const path = require('path')
const { sharedHelper, moduleHelper, fixturePath } = require(path.join(
  process.env.AURORA_MOBILE_E2E_ROOT,
  'test/e2e/helpers/paths'
))
const { test, expect } = sharedHelper('fixtures')
const { loginAsTestUser, step, attachScreenshot } = sharedHelper('login')
const {
  FOLDER_TYPES,
  waitForInboxList,
  openFolderByType,
  openFolderByName,
  openMailDrawer,
  longPressMessageItem,
  waitForListReady,
  listReadyOptions,
  clickReady,
} = require('./helpers/mail')

const hasCredentials = !!(process.env.E2E_LOGIN && process.env.E2E_PASSWORD)

test.describe('Mobile mail list filters and bulk actions', () => {
  test.skip(!hasCredentials, 'Set E2E_LOGIN and E2E_PASSWORD in .env.e2e')

  test('opens Unseen filter from folder badge and clears it', async ({
    page,
  }) => {
    test.setTimeout(180000)
    await loginAsTestUser(page)
    await waitForInboxList(page)

    await step('Open drawer and find folder with unseen badge', async () => {
      await openMailDrawer(page)
      // Folder counts arrive via RelevantFoldersInformation after list load.
      const badge = page.getByTestId('mail-folder-unseen-count').first()
      try {
        await expect(badge).toBeVisible({ timeout: 30000 })
      } catch {
        test.skip(
          true,
          'No unseen badge in drawer after waiting for folder counts'
        )
      }
      const folder = page
        .locator(
          '[data-test-id="mail-folder-item"], [data-test-id="mail-unified-inbox"]'
        )
        .filter({ has: page.getByTestId('mail-folder-unseen-count') })
        .first()
      const name =
        (await folder.getAttribute('data-folder-name').catch(() => null)) ||
        (await folder.innerText().catch(() => 'unified/unknown'))
      console.log(`  → Unseen badge on: ${String(name).trim().split('\n')[0]}`)
      await clickReady(badge)
    })

    await step('Expect unseen filter banner', async () => {
      await expect(page.getByTestId('mail-message-list')).toBeVisible({
        timeout: 30000,
      })
      await expect(page.getByTestId('mail-filter-banner')).toBeVisible({
        timeout: 15000,
      })
      await waitForListReady(page, listReadyOptions)
      await attachScreenshot(page, 'mail-filter-unseen-01')
    })

    await step('Clear filter → full folder list', async () => {
      await clickReady(page.getByTestId('mail-filter-clear'))
      await expect(page.getByTestId('mail-filter-banner')).toBeHidden({
        timeout: 30000,
      })
      await expect(page.getByTestId('mail-message-list')).toBeVisible({
        timeout: 30000,
      })
      await attachScreenshot(page, 'mail-filter-unseen-02-cleared')
    })
  })

  test('opens Starred (flagged) virtual folder', async ({ page }) => {
    test.setTimeout(180000)
    await loginAsTestUser(page)
    await waitForInboxList(page)

    await step('Open Starred from drawer', async () => {
      await openFolderByName(page, 'Starred')
      const folderLabel = (
        await page.getByTestId('mail-folder-name').innerText().catch(() => '')
      ).trim()
      console.log(`  → Folder label: ${folderLabel}`)
      expect(folderLabel.toLowerCase()).toContain('star')
      await attachScreenshot(page, 'mail-filter-starred-01')
    })
  })

  test('multi-select and bulk delete moves messages to Trash', async ({
    page,
  }) => {
    test.setTimeout(180000)
    await loginAsTestUser(page)
    await waitForInboxList(page)

    const items = page.getByTestId('mail-message-item')
    const beforeCount = await items.count()
    test.skip(beforeCount === 0, 'Inbox is empty — need at least one message')

    let deletedSubject = ''

    await step('Long-press first message → select mode', async () => {
      const first = items.first()
      deletedSubject = (
        await first.locator('.message__subject').innerText().catch(() => '')
      ).trim()
      await longPressMessageItem(page, first)
      await expect(page.getByTestId('mail-select-header')).toBeVisible({
        timeout: 15000,
      })
      await expect(page.getByTestId('mail-select-count')).toContainText(
        'Selected: 1',
        { timeout: 10000 }
      )
      console.log(`  → Selected subject: ${deletedSubject}`)
      await attachScreenshot(page, 'mail-select-01')
    })

    if (beforeCount > 1) {
      await step('Tap second message to add to selection', async () => {
        await clickReady(items.nth(1))
        await expect(page.getByTestId('mail-select-count')).toContainText(
          'Selected: 2',
          { timeout: 10000 }
        )
      })
    }

    await step('Bulk delete without confirm dialog', async () => {
      await clickReady(page.getByTestId('mail-select-delete'))
      await expect(page.getByTestId('mail-delete-dialog')).toHaveCount(0, {
        timeout: 5000,
      })
      await expect(page.getByTestId('mail-select-header')).toBeHidden({
        timeout: 30000,
      })
      await waitForListReady(page, listReadyOptions)
      await attachScreenshot(page, 'mail-select-02-deleted')
    })

    await step('Deleted message appears in Trash', async () => {
      test.skip(!deletedSubject, 'No subject captured from deleted message')
      await openFolderByType(page, FOLDER_TYPES.TRASH)
      await expect(
        page
          .getByTestId('mail-message-item')
          .filter({ hasText: deletedSubject })
          .first()
      ).toBeVisible({ timeout: 30000 })
      console.log(`  → Found in Trash: ${deletedSubject}`)
      await attachScreenshot(page, 'mail-select-03-trash')
    })
  })

  test('multi-select mark as unread then mark as read', async ({ page }) => {
    test.setTimeout(180000)
    await loginAsTestUser(page)
    await waitForInboxList(page)

    const items = page.getByTestId('mail-message-item')
    const beforeCount = await items.count()
    test.skip(beforeCount === 0, 'Inbox is empty — need at least one message')

    let subject = ''

    await step('Long-press first message → select mode', async () => {
      const first = items.first()
      subject = (
        await first.locator('.message__subject').innerText().catch(() => '')
      ).trim()
      await longPressMessageItem(page, first)
      await expect(page.getByTestId('mail-select-header')).toBeVisible({
        timeout: 15000,
      })
      console.log(`  → Selected subject: ${subject}`)
      await attachScreenshot(page, 'mail-select-mark-01')
    })

    const markUnread = page.getByTestId('mail-select-markAsUnread')
    const markRead = page.getByTestId('mail-select-markAsRead')
    const canMarkUnread = await markUnread.isVisible().catch(() => false)

    if (canMarkUnread) {
      await step('All/some seen → Mark as unread only path', async () => {
        await expect(markUnread).toBeVisible()
        await clickReady(markUnread)
        await expect(page.getByTestId('mail-select-header')).toBeHidden({
          timeout: 30000,
        })
        await waitForListReady(page, listReadyOptions)
        const target = page
          .getByTestId('mail-message-item')
          .filter({ hasText: subject })
          .first()
        await expect(target).toBeVisible({ timeout: 15000 })
        await expect(target).toHaveClass(/message__unseen/, { timeout: 15000 })
        await attachScreenshot(page, 'mail-select-mark-02-unread')
      })

      await step('Select again — only Mark as read', async () => {
        const target = page
          .getByTestId('mail-message-item')
          .filter({ hasText: subject })
          .first()
        await longPressMessageItem(page, target)
        await expect(page.getByTestId('mail-select-header')).toBeVisible({
          timeout: 15000,
        })
        await expect(page.getByTestId('mail-select-markAsRead')).toBeVisible()
        await expect(page.getByTestId('mail-select-markAsUnread')).toBeHidden()
        await clickReady(page.getByTestId('mail-select-markAsRead'))
        await expect(page.getByTestId('mail-select-header')).toBeHidden({
          timeout: 30000,
        })
        await waitForListReady(page, listReadyOptions)
        const after = page
          .getByTestId('mail-message-item')
          .filter({ hasText: subject })
          .first()
        await expect(after).toBeVisible({ timeout: 15000 })
        await expect(after).not.toHaveClass(/message__unseen/, { timeout: 15000 })
        await attachScreenshot(page, 'mail-select-mark-03-read')
      })
    } else {
      await step('All unread → Mark as read only path', async () => {
        await expect(markRead).toBeVisible()
        await expect(markUnread).toBeHidden()
        await clickReady(markRead)
        await expect(page.getByTestId('mail-select-header')).toBeHidden({
          timeout: 30000,
        })
        await waitForListReady(page, listReadyOptions)
        const after = page
          .getByTestId('mail-message-item')
          .filter({ hasText: subject })
          .first()
        await expect(after).toBeVisible({ timeout: 15000 })
        await expect(after).not.toHaveClass(/message__unseen/, { timeout: 15000 })
        await attachScreenshot(page, 'mail-select-mark-02-read')
      })

      await step('Select again — only Mark as unread', async () => {
        const target = page
          .getByTestId('mail-message-item')
          .filter({ hasText: subject })
          .first()
        await longPressMessageItem(page, target)
        await expect(page.getByTestId('mail-select-header')).toBeVisible({
          timeout: 15000,
        })
        await expect(page.getByTestId('mail-select-markAsUnread')).toBeVisible()
        await expect(page.getByTestId('mail-select-markAsRead')).toBeHidden()
        await clickReady(page.getByTestId('mail-select-markAsUnread'))
        await expect(page.getByTestId('mail-select-header')).toBeHidden({
          timeout: 30000,
        })
        await waitForListReady(page, listReadyOptions)
        const after = page
          .getByTestId('mail-message-item')
          .filter({ hasText: subject })
          .first()
        await expect(after).toHaveClass(/message__unseen/, { timeout: 15000 })
        await attachScreenshot(page, 'mail-select-mark-03-unread')
      })
    }
  })

  test('empties Trash folder', async ({ page }) => {
    test.setTimeout(180000)
    await loginAsTestUser(page)
    await waitForInboxList(page)

    await step('Open Trash', async () => {
      await openFolderByType(page, FOLDER_TYPES.TRASH)
    })

    const emptyBtn = page.getByTestId('mail-empty-folder-button')
    test.skip(
      !(await emptyBtn.isVisible().catch(() => false)),
      'Trash is empty — Empty Trash button is hidden'
    )

    await step('Empty Trash → confirm', async () => {
      await clickReady(emptyBtn)
      await expect(page.getByTestId('mail-empty-folder-dialog')).toBeVisible({
        timeout: 15000,
      })
      await clickReady(page.getByTestId('mail-empty-folder-confirm'))
      await expect(page.getByTestId('mail-empty-folder-dialog')).toBeHidden({
        timeout: 60000,
      })
      await expect(page.getByTestId('mail-empty-folder')).toBeVisible({
        timeout: 60000,
      })
      await expect(page.getByTestId('mail-empty-folder-button')).toBeHidden({
        timeout: 15000,
      })
      console.log('  → Trash emptied')
      await attachScreenshot(page, 'mail-empty-trash-01')
    })
  })
})
