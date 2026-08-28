import { describe, expect, it } from 'vitest'
import { isPagedListEndReached } from 'utils/paged-list-end.js'

describe('isPagedListEndReached', () => {
  const itemsPerPage = 20

  it('returns true for an empty list', () => {
    expect(
      isPagedListEndReached({
        listLength: 0,
        totalCount: 100,
        lastPageCount: 0,
        itemsPerPage,
      })
    ).toBe(true)
  })

  it('returns false when more pages remain after a full page', () => {
    expect(
      isPagedListEndReached({
        listLength: 20,
        totalCount: 45,
        lastPageCount: 20,
        itemsPerPage,
      })
    ).toBe(false)
  })

  it('returns true when loaded count reaches total count', () => {
    expect(
      isPagedListEndReached({
        listLength: 40,
        totalCount: 40,
        lastPageCount: 20,
        itemsPerPage,
      })
    ).toBe(true)
  })

  it('returns true when the last page is shorter than the page size', () => {
    expect(
      isPagedListEndReached({
        listLength: 35,
        totalCount: 100,
        lastPageCount: 15,
        itemsPerPage,
      })
    ).toBe(true)
  })

  it('returns false when total is unknown but the last page is full', () => {
    expect(
      isPagedListEndReached({
        listLength: 20,
        totalCount: 0,
        lastPageCount: 20,
        itemsPerPage,
      })
    ).toBe(false)
  })
})
