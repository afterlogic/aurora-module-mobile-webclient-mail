import { describe, expect, it } from 'vitest'
import {
  getSearchFoldersMode,
  getSearchBannerI18nKey,
  shouldHideClearSearch,
  formatSearchStringForDescription,
} from 'utils/search-description.js'

describe('search-description utils', () => {
  describe('getSearchFoldersMode', () => {
    it('detects folders:all and folders:sub', () => {
      expect(getSearchFoldersMode('folders:all')).toBe('all')
      expect(getSearchFoldersMode('hello folders:sub')).toBe('sub')
      expect(getSearchFoldersMode('subject:test')).toBe('')
    })
  })

  describe('getSearchBannerI18nKey', () => {
    it('picks banner key by folders mode and unified inbox', () => {
      expect(
        getSearchBannerI18nKey({ searchText: 'folders:sub', isUnifiedInbox: false })
      ).toBe('INFO_MESSAGES_FROM_SUBFOLDERS')
      expect(
        getSearchBannerI18nKey({ searchText: 'foo folders:all', isUnifiedInbox: true })
      ).toBe('INFO_SEARCH_UNIFIED_ALL_FOLDERS_RESULT')
      expect(
        getSearchBannerI18nKey({ searchText: 'hello', isUnifiedInbox: false })
      ).toBe('INFO_SEARCH_RESULT')
    })
  })

  describe('shouldHideClearSearch', () => {
    it('hides clear only for starred + exact folders:all', () => {
      expect(
        shouldHideClearSearch({ searchText: 'folders:all', isStarredFolder: true })
      ).toBe(true)
      expect(
        shouldHideClearSearch({ searchText: 'folders:all', isStarredFolder: false })
      ).toBe(false)
      expect(
        shouldHideClearSearch({ searchText: 'foo folders:all', isStarredFolder: true })
      ).toBe(false)
    })
  })

  describe('formatSearchStringForDescription', () => {
    it('formats backend date tokens for display and strips folders mode', () => {
      const result = formatSearchStringForDescription(
        'date:2024.01.15/2024.01.20 folders:all',
        'MM/DD/YYYY'
      )
      expect(result).toContain('date:01/15/2024 - 01/20/2024')
      expect(result).not.toMatch(/folders:(all|sub)/)
    })
  })
})
